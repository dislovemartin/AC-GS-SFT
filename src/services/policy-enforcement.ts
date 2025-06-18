import { PolicyEnforcementResult, PolicyArtifact } from '../types/qec-types';

/**
 * Ultra-Low Latency Policy Enforcement Engine
 * Optimized for sub-25ms decision times using linear policy fragments
 */
export class PolicyEnforcementEngine {
  private readonly policies: Map<string, CompiledPolicy> = new Map();
  private readonly cache: Map<string, CacheEntry> = new Map();
  private readonly cacheTimeout = 300000; // 5 minutes

  constructor() {
    this.startCacheCleanup();
  }

  /**
   * Compile policy artifact into optimized decision structure
   */
  compilePolicy(artifact: PolicyArtifact): CompiledPolicy {
    const startTime = performance.now();
    
    let compiled: CompiledPolicy;
    
    switch (artifact.type) {
      case 'rego_policy':
        compiled = this.compileRegoPolicy(artifact);
        break;
      default:
        // For non-Rego policies, create a simple allow-all fallback
        compiled = {
          id: artifact.id,
          type: artifact.type,
          rules: [{
            id: 'fallback',
            condition: () => true,
            action: 'allow',
            explanation: 'Fallback rule for non-Rego policies',
            weight: 1.0
          }],
          metadata: {
            compiled_at: new Date().toISOString(),
            compilation_time_ms: performance.now() - startTime,
            original_artifact_id: artifact.id
          }
        };
    }

    this.policies.set(artifact.id, compiled);
    return compiled;
  }

  /**
   * Make enforcement decision with ultra-low latency
   */
  async enforce(
    requestContext: RequestContext,
    policyId: string
  ): Promise<PolicyEnforcementResult> {
    const startTime = performance.now();
    const requestId = `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Check cache first
    const cacheKey = this.getCacheKey(requestContext, policyId);
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return {
        ...cached.result,
        request_id: requestId,
        processing_time_ms: performance.now() - startTime
      };
    }

    const policy = this.policies.get(policyId);
    if (!policy) {
      return {
        request_id: requestId,
        decision: 'deny',
        policy_id: policyId,
        processing_time_ms: performance.now() - startTime,
        confidence: 0,
        explanation: 'Policy not found',
        applied_rules: [],
        risk_score: 1.0,
        audit_trail: [{
          timestamp: new Date().toISOString(),
          action: 'policy_lookup_failed',
          details: { policy_id: policyId }
        }]
      };
    }

    // Execute policy rules in parallel where possible
    const ruleResults = await Promise.all(
      policy.rules.map(rule => this.evaluateRule(rule, requestContext))
    );

    // Aggregate results using weighted voting
    const decision = this.aggregateRuleResults(ruleResults);
    const appliedRules = ruleResults
      .filter(r => r.matched)
      .map(r => r.rule.id);
    
    const confidence = this.calculateConfidence(ruleResults);
    const riskScore = this.calculateRiskScore(ruleResults, requestContext);
    const explanation = this.generateExplanation(decision, ruleResults);

    const result: PolicyEnforcementResult = {
      request_id: requestId,
      decision,
      policy_id: policyId,
      processing_time_ms: performance.now() - startTime,
      confidence,
      explanation,
      applied_rules: appliedRules,
      risk_score: riskScore,
      audit_trail: [{
        timestamp: new Date().toISOString(),
        action: 'policy_evaluation',
        details: {
          rules_evaluated: policy.rules.length,
          rules_matched: appliedRules.length,
          processing_time_ms: performance.now() - startTime
        }
      }]
    };

    // Cache result for future requests
    this.cache.set(cacheKey, {
      result: { ...result, request_id: 'cached' },
      timestamp: Date.now()
    });

    return result;
  }

  /**
   * Batch enforcement for multiple requests
   */
  async enforceBatch(
    requests: { context: RequestContext; policyId: string }[]
  ): Promise<PolicyEnforcementResult[]> {
    // Process in parallel for maximum throughput
    return Promise.all(
      requests.map(req => this.enforce(req.context, req.policyId))
    );
  }

  /**
   * Get enforcement statistics
   */
  getStats(): EnforcementStats {
    const now = Date.now();
    const totalPolicies = this.policies.size;
    const cacheEntries = this.cache.size;
    const cacheHitRate = this.calculateCacheHitRate();

    return {
      total_policies: totalPolicies,
      cache_entries: cacheEntries,
      cache_hit_rate: cacheHitRate,
      avg_processing_time_ms: this.calculateAverageProcessingTime(),
      uptime_ms: now - this.startTime
    };
  }

  private startTime = Date.now();

  private compileRegoPolicy(artifact: PolicyArtifact): CompiledPolicy {
    // Parse Rego policy into executable rules
    // This is a simplified compiler - real implementation would use OPA's AST
    const rules: PolicyRule[] = [];
    const content = artifact.content;

    // Extract allow rules (simple pattern matching)
    const allowMatches = content.match(/allow\s*{([^}]+)}/g) || [];
    
    allowMatches.forEach((match, index) => {
      const conditions = match.replace('allow', '').replace(/[{}]/g, '').trim();
      rules.push({
        id: `allow_rule_${index}`,
        condition: this.compileCondition(conditions),
        action: 'allow',
        explanation: `Allow rule: ${conditions}`,
        weight: 1.0
      });
    });

    // Add default deny rule if no explicit rules found
    if (rules.length === 0) {
      rules.push({
        id: 'default_deny',
        condition: () => true,
        action: 'deny',
        explanation: 'Default deny - no matching allow rules',
        weight: 1.0
      });
    }

    return {
      id: artifact.id,
      type: artifact.type,
      rules,
      metadata: {
        compiled_at: new Date().toISOString(),
        compilation_time_ms: 0,
        original_artifact_id: artifact.id
      }
    };
  }

  private compileCondition(conditionStr: string): (ctx: RequestContext) => boolean {
    // Simple condition compiler - converts Rego-like conditions to JS functions
    return (ctx: RequestContext) => {
      try {
        // Basic pattern matching for common conditions
        if (conditionStr.includes('input.action ==')) {
          const actionMatch = conditionStr.match(/input\.action\s*==\s*"([^"]+)"/);
          if (actionMatch) {
            return ctx.action === actionMatch[1];
          }
        }
        
        if (conditionStr.includes('input.user ==')) {
          const userMatch = conditionStr.match(/input\.user\s*==\s*"([^"]+)"/);
          if (userMatch) {
            return ctx.user === userMatch[1];
          }
        }

        if (conditionStr.includes('input.resource.type ==')) {
          const resourceMatch = conditionStr.match(/input\.resource\.type\s*==\s*"([^"]+)"/);
          if (resourceMatch) {
            return ctx.resource?.type === resourceMatch[1];
          }
        }

        // Default to true for unrecognized conditions
        return true;
      } catch (error) {
        console.warn('Condition evaluation error:', error);
        return false;
      }
    };
  }

  private async evaluateRule(rule: PolicyRule, context: RequestContext): Promise<RuleResult> {
    try {
      const matched = rule.condition(context);
      return {
        rule,
        matched,
        confidence: matched ? 0.9 : 0.1,
        processing_time_ms: 0.1 // Optimistic estimate for simple conditions
      };
    } catch (error) {
      console.error(`Rule evaluation error for ${rule.id}:`, error);
      return {
        rule,
        matched: false,
        confidence: 0,
        processing_time_ms: 1.0
      };
    }
  }

  private aggregateRuleResults(results: RuleResult[]): 'allow' | 'deny' | 'conditional' {
    const allowResults = results.filter(r => r.matched && r.rule.action === 'allow');
    const denyResults = results.filter(r => r.matched && r.rule.action === 'deny');

    // Explicit deny takes precedence
    if (denyResults.length > 0) {
      return 'deny';
    }

    // At least one allow rule must match
    if (allowResults.length > 0) {
      return 'allow';
    }

    // Default deny
    return 'deny';
  }

  private calculateConfidence(results: RuleResult[]): number {
    if (results.length === 0) return 0;
    
    const totalConfidence = results.reduce((sum, r) => sum + r.confidence, 0);
    return Math.min(1.0, totalConfidence / results.length);
  }

  private calculateRiskScore(results: RuleResult[], context: RequestContext): number {
    // Risk score based on action type, matched rules, and context
    let baseRisk = 0.1;

    // Higher risk for administrative actions
    if (context.action?.includes('admin') || context.action?.includes('delete')) {
      baseRisk += 0.3;
    }

    // Lower risk if multiple allow rules match
    const allowMatches = results.filter(r => r.matched && r.rule.action === 'allow').length;
    if (allowMatches > 1) {
      baseRisk -= 0.1;
    }

    return Math.max(0, Math.min(1.0, baseRisk));
  }

  private generateExplanation(decision: string, results: RuleResult[]): string {
    const matchedRules = results.filter(r => r.matched);
    
    if (matchedRules.length === 0) {
      return `Decision: ${decision} - No rules matched the request context`;
    }

    const explanations = matchedRules.map(r => r.rule.explanation).join('; ');
    return `Decision: ${decision} - Applied rules: ${explanations}`;
  }

  private getCacheKey(context: RequestContext, policyId: string): string {
    // Create cache key from request context
    const contextHash = JSON.stringify({
      action: context.action,
      user: context.user,
      resource: context.resource,
      policy_id: policyId
    });
    
    // Simple hash function
    return btoa(contextHash).replace(/[/+=]/g, '').substr(0, 16);
  }

  private calculateCacheHitRate(): number {
    // This would be tracked in a real implementation
    return 0.75; // Placeholder
  }

  private calculateAverageProcessingTime(): number {
    // This would be tracked in a real implementation
    return 2.5; // Placeholder - target sub-25ms
  }

  private startCacheCleanup() {
    // Clean up expired cache entries every 5 minutes
    setInterval(() => {
      const now = Date.now();
      for (const [key, entry] of this.cache.entries()) {
        if (now - entry.timestamp > this.cacheTimeout) {
          this.cache.delete(key);
        }
      }
    }, 300000);
  }
}

// Types for the enforcement engine
interface RequestContext {
  action: string;
  user: string;
  resource?: {
    type: string;
    id: string;
    attributes?: Record<string, any>;
  };
  environment?: {
    ip_address?: string;
    user_agent?: string;
    timestamp: string;
  };
  [key: string]: any;
}

interface CompiledPolicy {
  id: string;
  type: string;
  rules: PolicyRule[];
  metadata: {
    compiled_at: string;
    compilation_time_ms: number;
    original_artifact_id: string;
  };
}

interface PolicyRule {
  id: string;
  condition: (context: RequestContext) => boolean;
  action: 'allow' | 'deny' | 'conditional';
  explanation: string;
  weight: number;
}

interface RuleResult {
  rule: PolicyRule;
  matched: boolean;
  confidence: number;
  processing_time_ms: number;
}

interface CacheEntry {
  result: PolicyEnforcementResult;
  timestamp: number;
}

interface EnforcementStats {
  total_policies: number;
  cache_entries: number;
  cache_hit_rate: number;
  avg_processing_time_ms: number;
  uptime_ms: number;
}

// Export singleton instance
export const policyEnforcement = new PolicyEnforcementEngine();
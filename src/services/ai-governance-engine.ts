import { 
  LogicalSemanticUnit, 
  PolicyArtifact, 
  AIGovernanceReport, 
  EnsembleResult,
  BiasAssessment 
} from '../types/qec-types';
import { policyGenerator } from './policy-generator';
import { constitutionalAI } from './constitutional-ai';
import { policyEnforcement } from './policy-enforcement';

/**
 * AI Governance Engine - Orchestrates the complete governance pipeline
 * Integrates policy generation, validation, bias mitigation, and enforcement
 */
export class AIGovernanceEngine {
  /**
   * Execute complete AI governance pipeline
   */
  async executeGovernancePipeline(
    lsuContent: string,
    options: {
      enableBiasAssessment?: boolean;
      enableConstitutionalAlignment?: boolean;
      enableEnsembleValidation?: boolean;
      enableEnforcement?: boolean;
    } = {}
  ): Promise<AIGovernanceReport> {
    const startTime = Date.now();
    const reportId = `gov-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Create LSU
    const lsu: LogicalSemanticUnit = {
      id: `lsu-${Date.now()}`,
      content: lsuContent,
      category: this.categorizeContent(lsuContent),
      priority: this.assessPriority(lsuContent),
      source: 'manual',
      created_at: new Date().toISOString()
    };

    console.log(`🚀 Starting AI Governance Pipeline for LSU: ${lsu.id}`);

    // Step 1: Generate policy artifacts
    console.log('📝 Generating policy artifacts...');
    const policyArtifacts = await policyGenerator.generatePolicyArtifacts(lsu);
    
    // Step 2: Ensemble validation (optional)
    const ensembleResults: EnsembleResult[] = [];
    if (options.enableEnsembleValidation) {
      console.log('🔄 Running ensemble validation...');
      for (const artifact of policyArtifacts) {
        try {
          const ensembleResult = await policyGenerator.generateEnsembleValidation(
            lsu, 
            `Validate this ${artifact.type}: ${artifact.content.slice(0, 500)}`
          );
          ensembleResults.push(ensembleResult);
        } catch (error) {
          console.warn(`Ensemble validation failed for ${artifact.type}:`, error);
        }
      }
    }

    // Step 3: Bias assessment (optional)
    let biasAssessment: BiasAssessment | undefined;
    if (options.enableBiasAssessment) {
      console.log('⚖️ Conducting bias assessment...');
      try {
        biasAssessment = await constitutionalAI.assessBias(lsuContent, 'lsu');
        
        // Also assess the generated policy
        const mainPolicy = policyArtifacts.find(a => a.type === 'rego_policy');
        if (mainPolicy) {
          const policyBias = await constitutionalAI.assessBias(mainPolicy.content, 'policy');
          // Combine assessments (simple average for now)
          biasAssessment.overall_score = (biasAssessment.overall_score + policyBias.overall_score) / 2;
        }
      } catch (error) {
        console.error('Bias assessment failed:', error);
      }
    }

    // Step 4: Constitutional alignment check (optional)
    const constitutionalAlignment = [];
    if (options.enableConstitutionalAlignment) {
      console.log('📜 Checking constitutional alignment...');
      try {
        const alignment = await constitutionalAI.checkConstitutionalAlignment(lsu, policyArtifacts);
        constitutionalAlignment.push(...alignment);
      } catch (error) {
        console.error('Constitutional alignment check failed:', error);
      }
    }

    // Step 5: Policy enforcement simulation (optional)
    const enforcementSimulation = [];
    if (options.enableEnforcement) {
      console.log('🛡️ Running enforcement simulation...');
      try {
        const mainPolicy = policyArtifacts.find(a => a.type === 'rego_policy');
        if (mainPolicy) {
          // Compile policy for enforcement
          policyEnforcement.compilePolicy(mainPolicy);
          
          // Run test scenarios
          const testScenarios = this.generateTestScenarios(lsu);
          for (const scenario of testScenarios) {
            const result = await policyEnforcement.enforce(scenario.context, mainPolicy.id);
            enforcementSimulation.push(result);
          }
        }
      } catch (error) {
        console.error('Enforcement simulation failed:', error);
      }
    }

    // Step 6: Generate recommendations
    const recommendations = await this.generateRecommendations(
      lsu,
      policyArtifacts,
      biasAssessment,
      constitutionalAlignment,
      enforcementSimulation
    );

    const report: AIGovernanceReport = {
      id: reportId,
      lsu_id: lsu.id,
      policy_artifacts: policyArtifacts,
      ensemble_results: ensembleResults,
      bias_assessment: biasAssessment || {
        overall_score: 0.5,
        dimension_scores: {
          gender: 0.5, age: 0.5, race_ethnicity: 0.5, socioeconomic: 0.5,
          geographic: 0.5, political: 0.5, religious: 0.5, disability: 0.5,
          sexual_orientation: 0.5
        },
        flagged_issues: ['Bias assessment not performed'],
        mitigation_suggestions: ['Enable bias assessment for detailed analysis'],
        confidence: 0.3,
        assessment_model: 'none'
      },
      constitutional_alignment: constitutionalAlignment,
      enforcement_simulation: enforcementSimulation,
      recommendations,
      generated_at: new Date().toISOString()
    };

    const totalTime = Date.now() - startTime;
    console.log(`✅ AI Governance Pipeline completed in ${totalTime}ms`);

    return report;
  }

  /**
   * Quick policy validation without full pipeline
   */
  async validatePolicy(policyContent: string): Promise<{
    isValid: boolean;
    issues: string[];
    suggestions: string[];
    confidence: number;
  }> {
    try {
      // Create temporary LSU and artifact
      const lsu: LogicalSemanticUnit = {
        id: `temp-${Date.now()}`,
        content: 'Policy validation request',
        category: 'policy',
        priority: 'medium',
        source: 'manual',
        created_at: new Date().toISOString()
      };

      const artifact: PolicyArtifact = {
        id: `temp-policy-${Date.now()}`,
        type: 'rego_policy',
        content: policyContent,
        lsu_id: lsu.id,
        generated_by: 'ai_model',
        confidence_score: 0.8,
        validation_status: 'pending',
        created_at: new Date().toISOString()
      };

      // Run bias assessment
      const biasAssessment = await constitutionalAI.assessBias(policyContent, 'policy');
      
      // Check constitutional alignment
      const alignment = await constitutionalAI.checkConstitutionalAlignment(lsu, [artifact]);
      
      // Aggregate results
      const issues: string[] = [];
      const suggestions: string[] = [];
      
      if (biasAssessment.overall_score > 0.7) {
        issues.push('High bias detected');
        suggestions.push(...biasAssessment.mitigation_suggestions);
      }
      
      alignment.forEach(a => {
        if (a.compliance_score < 0.7) {
          issues.push(`Low constitutional compliance for principle: ${a.principle_id}`);
          suggestions.push(`Review alignment with ${a.principle_id}`);
        }
        issues.push(...a.violations);
      });

      const isValid = issues.length === 0;
      const confidence = (biasAssessment.confidence + 
                         alignment.reduce((sum, a) => sum + (a.compliance_score || 0.5), 0) / alignment.length) / 2;

      return {
        isValid,
        issues,
        suggestions,
        confidence
      };
    } catch (error) {
      console.error('Policy validation failed:', error);
      return {
        isValid: false,
        issues: ['Validation failed due to technical error'],
        suggestions: ['Manual review recommended'],
        confidence: 0.1
      };
    }
  }

  private categorizeContent(content: string): 'policy' | 'rule' | 'requirement' | 'constraint' {
    const lower = content.toLowerCase();
    
    if (lower.includes('shall') || lower.includes('must') || lower.includes('required')) {
      return 'requirement';
    }
    if (lower.includes('cannot') || lower.includes('prohibited') || lower.includes('forbidden')) {
      return 'constraint';
    }
    if (lower.includes('policy') || lower.includes('governance')) {
      return 'policy';
    }
    return 'rule';
  }

  private assessPriority(content: string): 'low' | 'medium' | 'high' | 'critical' {
    const lower = content.toLowerCase();
    
    if (lower.includes('critical') || lower.includes('security') || lower.includes('safety')) {
      return 'critical';
    }
    if (lower.includes('important') || lower.includes('compliance') || lower.includes('legal')) {
      return 'high';
    }
    if (lower.includes('should') || lower.includes('recommended')) {
      return 'medium';
    }
    return 'low';
  }

  private generateTestScenarios(lsu: LogicalSemanticUnit) {
    // Generate test scenarios based on LSU content
    return [
      {
        context: {
          action: 'read',
          user: 'test_user',
          resource: { type: 'document', id: 'test_doc' },
          environment: { timestamp: new Date().toISOString() }
        }
      },
      {
        context: {
          action: 'write',
          user: 'admin_user',
          resource: { type: 'document', id: 'test_doc' },
          environment: { timestamp: new Date().toISOString() }
        }
      },
      {
        context: {
          action: 'delete',
          user: 'regular_user',
          resource: { type: 'document', id: 'test_doc' },
          environment: { timestamp: new Date().toISOString() }
        }
      }
    ];
  }

  private async generateRecommendations(
    lsu: LogicalSemanticUnit,
    artifacts: PolicyArtifact[],
    biasAssessment?: BiasAssessment,
    constitutionalAlignment?: any[],
    enforcementResults?: any[]
  ): Promise<string[]> {
    const recommendations: string[] = [];

    // Bias-based recommendations
    if (biasAssessment && biasAssessment.overall_score > 0.6) {
      recommendations.push('Consider bias mitigation strategies before deployment');
      recommendations.push(...biasAssessment.mitigation_suggestions.slice(0, 2));
    }

    // Constitutional alignment recommendations
    if (constitutionalAlignment) {
      const lowComplianceItems = constitutionalAlignment.filter(a => a.compliance_score < 0.7);
      if (lowComplianceItems.length > 0) {
        recommendations.push('Review constitutional alignment before finalizing policy');
        recommendations.push(`Address compliance issues with: ${lowComplianceItems.map(a => a.principle_id).join(', ')}`);
      }
    }

    // Enforcement recommendations
    if (enforcementResults && enforcementResults.some(r => r.confidence < 0.7)) {
      recommendations.push('Consider adding more specific policy rules for better enforcement confidence');
    }

    // General recommendations
    recommendations.push('Test policy with diverse stakeholder groups');
    recommendations.push('Implement monitoring and feedback mechanisms');
    recommendations.push('Schedule regular policy reviews and updates');

    return recommendations.slice(0, 6); // Limit to top 6 recommendations
  }
}

// Export singleton instance
export const aiGovernance = new AIGovernanceEngine();
/**
 * Ultra Low Latency Optimizer Service
 * Implementation of sub-25ms policy decisions with multi-tier caching
 */

export interface CacheEntry<T> {
  value: T;
  timestamp: number;
  ttl: number;
  access_count: number;
  last_accessed: number;
}

export interface CacheMetrics {
  hit_rate: number;
  miss_rate: number;
  average_lookup_time_ms: number;
  eviction_count: number;
  cache_size: number;
  memory_usage_mb: number;
}

export interface OptimizationLevel {
  name: string;
  target_latency_ms: number;
  cache_ttl_multiplier: number;
  speculative_execution: boolean;
  fragment_caching: boolean;
  adaptive_optimization: boolean;
}

export interface PolicyDecisionRequest {
  policy_id: string;
  input_context: Record<string, any>;
  governance_rules: string[];
  priority: 'low' | 'medium' | 'high' | 'critical';
  optimization_level?: string;
}

export interface PolicyDecisionResult {
  decision: any;
  latency_ms: number;
  cache_hit: boolean;
  optimization_level: string;
  cache_layers_used: string[];
  speculative_execution_used: boolean;
  confidence: number;
}

export interface PerformanceMetrics {
  average_latency_ms: number;
  p95_latency_ms: number;
  p99_latency_ms: number;
  cache_hit_rate: number;
  throughput_rps: number;
  optimization_target_achievement: number;
}

export class UltraLowLatencyOptimizer {
  private l1Cache: Map<string, CacheEntry<any>> = new Map(); // In-memory cache
  private l2Cache: Map<string, CacheEntry<any>> = new Map(); // Distributed cache simulation
  private fragmentCache: Map<string, CacheEntry<any>> = new Map(); // Fragment-level cache
  
  private readonly optimizationLevels: Map<string, OptimizationLevel> = new Map();
  private readonly defaultLatencyTarget = 25; // 25ms target
  
  private performanceHistory: Array<{
    timestamp: number;
    latency_ms: number;
    cache_hit: boolean;
    optimization_level: string;
  }> = [];

  private speculativeExecutionQueue: Map<string, Promise<any>> = new Map();
  
  constructor() {
    this.initializeOptimizationLevels();
    this.startPerformanceMonitoring();
  }

  private initializeOptimizationLevels(): void {
    const levels: OptimizationLevel[] = [
      {
        name: 'standard',
        target_latency_ms: 50,
        cache_ttl_multiplier: 1.0,
        speculative_execution: false,
        fragment_caching: false,
        adaptive_optimization: false
      },
      {
        name: 'enhanced',
        target_latency_ms: 25,
        cache_ttl_multiplier: 1.5,
        speculative_execution: true,
        fragment_caching: true,
        adaptive_optimization: false
      },
      {
        name: 'ultra',
        target_latency_ms: 10,
        cache_ttl_multiplier: 2.0,
        speculative_execution: true,
        fragment_caching: true,
        adaptive_optimization: true
      },
      {
        name: 'extreme',
        target_latency_ms: 5,
        cache_ttl_multiplier: 3.0,
        speculative_execution: true,
        fragment_caching: true,
        adaptive_optimization: true
      }
    ];

    levels.forEach(level => {
      this.optimizationLevels.set(level.name, level);
    });
  }

  async optimizePolicyDecision(request: PolicyDecisionRequest): Promise<PolicyDecisionResult> {
    const startTime = performance.now();
    const optimizationLevel = this.optimizationLevels.get(request.optimization_level || 'enhanced')!;
    
    const cacheKey = this.generateCacheKey(request);
    const cacheLayersUsed: string[] = [];
    let cacheHit = false;
    let speculativeExecutionUsed = false;
    let decision: any;

    // L1 Cache check (in-memory)
    const l1Result = this.checkCache(this.l1Cache, cacheKey);
    if (l1Result) {
      decision = l1Result;
      cacheHit = true;
      cacheLayersUsed.push('L1');
    }

    // L2 Cache check (distributed)
    if (!decision) {
      const l2Result = this.checkCache(this.l2Cache, cacheKey);
      if (l2Result) {
        decision = l2Result;
        cacheHit = true;
        cacheLayersUsed.push('L2');
        // Promote to L1
        this.setCache(this.l1Cache, cacheKey, decision, optimizationLevel.cache_ttl_multiplier * 300);
      }
    }

    // Fragment cache check
    if (!decision && optimizationLevel.fragment_caching) {
      const fragmentResult = await this.checkFragmentCache(request);
      if (fragmentResult) {
        decision = fragmentResult;
        cacheHit = true;
        cacheLayersUsed.push('Fragment');
      }
    }

    // Check speculative execution
    if (!decision && optimizationLevel.speculative_execution) {
      const speculativeResult = this.speculativeExecutionQueue.get(cacheKey);
      if (speculativeResult) {
        try {
          decision = await speculativeResult;
          speculativeExecutionUsed = true;
          cacheLayersUsed.push('Speculative');
        } catch (error) {
          console.warn('Speculative execution failed:', error);
        }
      }
    }

    // Compute decision if not cached
    if (!decision) {
      decision = await this.computePolicyDecision(request);
      
      // Cache the result in all layers
      this.setCache(this.l1Cache, cacheKey, decision, optimizationLevel.cache_ttl_multiplier * 300);
      this.setCache(this.l2Cache, cacheKey, decision, optimizationLevel.cache_ttl_multiplier * 3600);
      
      if (optimizationLevel.fragment_caching) {
        await this.cacheFragments(request, decision, optimizationLevel);
      }
    }

    // Start speculative execution for related requests
    if (optimizationLevel.speculative_execution) {
      this.startSpeculativeExecution(request, optimizationLevel);
    }

    const latency_ms = performance.now() - startTime;
    
    // Record performance
    this.recordPerformance(latency_ms, cacheHit, optimizationLevel.name);

    // Adaptive optimization
    if (optimizationLevel.adaptive_optimization) {
      this.adaptiveOptimization(latency_ms, optimizationLevel);
    }

    return {
      decision,
      latency_ms,
      cache_hit: cacheHit,
      optimization_level: optimizationLevel.name,
      cache_layers_used: cacheLayersUsed,
      speculative_execution_used: speculativeExecutionUsed,
      confidence: this.calculateConfidence(decision, cacheHit, latency_ms)
    };
  }

  private generateCacheKey(request: PolicyDecisionRequest): string {
    // Create a stable hash of the request
    const keyData = {
      policy_id: request.policy_id,
      context_hash: this.hashObject(request.input_context),
      rules_hash: this.hashArray(request.governance_rules),
      priority: request.priority
    };
    
    return `policy_${this.hashObject(keyData)}`;
  }

  private hashObject(obj: any): string {
    return btoa(JSON.stringify(obj, Object.keys(obj).sort())).slice(0, 16);
  }

  private hashArray(arr: string[]): string {
    return btoa(arr.sort().join('|')).slice(0, 16);
  }

  private checkCache<T>(cache: Map<string, CacheEntry<T>>, key: string): T | null {
    const entry = cache.get(key);
    if (!entry) return null;

    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      cache.delete(key);
      return null;
    }

    // Update access statistics
    entry.access_count++;
    entry.last_accessed = now;
    
    return entry.value;
  }

  private setCache<T>(cache: Map<string, CacheEntry<T>>, key: string, value: T, ttl: number): void {
    const now = Date.now();
    cache.set(key, {
      value,
      timestamp: now,
      ttl,
      access_count: 1,
      last_accessed: now
    });

    // Simple LRU eviction if cache gets too large
    if (cache.size > 10000) {
      const entries = Array.from(cache.entries());
      entries.sort((a, b) => a[1].last_accessed - b[1].last_accessed);
      
      // Remove oldest 10%
      const toRemove = Math.floor(entries.length * 0.1);
      for (let i = 0; i < toRemove; i++) {
        cache.delete(entries[i][0]);
      }
    }
  }

  private async checkFragmentCache(request: PolicyDecisionRequest): Promise<any | null> {
    // Check for partial results that can be combined
    const fragments: any[] = [];
    
    for (const rule of request.governance_rules) {
      const fragmentKey = `fragment_${this.hashObject({ rule, context: request.input_context })}`;
      const fragment = this.checkCache(this.fragmentCache, fragmentKey);
      if (fragment) {
        fragments.push(fragment);
      }
    }

    // If we have enough fragments, combine them
    if (fragments.length >= request.governance_rules.length * 0.7) {
      return this.combineFragments(fragments);
    }

    return null;
  }

  private async cacheFragments(
    request: PolicyDecisionRequest, 
    decision: any, 
    optimizationLevel: OptimizationLevel
  ): Promise<void> {
    // Cache individual rule evaluations
    for (let i = 0; i < request.governance_rules.length; i++) {
      const rule = request.governance_rules[i];
      const fragmentKey = `fragment_${this.hashObject({ rule, context: request.input_context })}`;
      const fragment = this.extractFragment(decision, i);
      
      this.setCache(
        this.fragmentCache, 
        fragmentKey, 
        fragment, 
        optimizationLevel.cache_ttl_multiplier * 600
      );
    }
  }

  private combineFragments(fragments: any[]): any {
    // Simple fragment combination logic
    return {
      combined: true,
      fragments: fragments.length,
      result: fragments.reduce((acc, fragment) => ({ ...acc, ...fragment }), {}),
      confidence: Math.min(0.9, fragments.length / 10)
    };
  }

  private extractFragment(decision: any, ruleIndex: number): any {
    // Extract rule-specific result fragment
    return {
      rule_index: ruleIndex,
      evaluation: decision.result || true,
      confidence: decision.confidence || 0.8,
      timestamp: Date.now()
    };
  }

  private async computePolicyDecision(request: PolicyDecisionRequest): Promise<any> {
    // Simulate policy decision computation
    const baseLatency = 15 + Math.random() * 10; // 15-25ms base computation
    await new Promise(resolve => setTimeout(resolve, baseLatency));

    return {
      policy_id: request.policy_id,
      decision: 'allow',
      confidence: 0.85 + Math.random() * 0.1,
      rules_evaluated: request.governance_rules.length,
      computation_time_ms: baseLatency,
      metadata: {
        priority: request.priority,
        context_hash: this.hashObject(request.input_context)
      }
    };
  }

  private startSpeculativeExecution(
    request: PolicyDecisionRequest, 
    optimizationLevel: OptimizationLevel
  ): void {
    // Generate related requests that might be needed soon
    const relatedRequests = this.generateRelatedRequests(request);
    
    for (const relatedRequest of relatedRequests) {
      const cacheKey = this.generateCacheKey(relatedRequest);
      
      if (!this.speculativeExecutionQueue.has(cacheKey)) {
        const promise = this.computePolicyDecision(relatedRequest)
          .then(result => {
            // Cache the speculative result
            this.setCache(this.l1Cache, cacheKey, result, optimizationLevel.cache_ttl_multiplier * 300);
            this.speculativeExecutionQueue.delete(cacheKey);
            return result;
          })
          .catch(error => {
            this.speculativeExecutionQueue.delete(cacheKey);
            throw error;
          });
        
        this.speculativeExecutionQueue.set(cacheKey, promise);
      }
    }
  }

  private generateRelatedRequests(request: PolicyDecisionRequest): PolicyDecisionRequest[] {
    // Generate variations of the current request
    const related: PolicyDecisionRequest[] = [];
    
    // Vary priority levels
    const priorities: Array<'low' | 'medium' | 'high' | 'critical'> = ['low', 'medium', 'high', 'critical'];
    for (const priority of priorities) {
      if (priority !== request.priority) {
        related.push({
          ...request,
          priority,
          policy_id: `${request.policy_id}_${priority}`
        });
      }
    }

    // Vary context slightly (for common variations)
    const contextVariations = this.generateContextVariations(request.input_context);
    for (const variation of contextVariations.slice(0, 2)) {
      related.push({
        ...request,
        input_context: variation,
        policy_id: `${request.policy_id}_var`
      });
    }

    return related.slice(0, 3); // Limit speculative execution
  }

  private generateContextVariations(context: Record<string, any>): Record<string, any>[] {
    const variations: Record<string, any>[] = [];
    
    // Create variations by modifying boolean flags
    for (const [key, value] of Object.entries(context)) {
      if (typeof value === 'boolean') {
        variations.push({
          ...context,
          [key]: !value
        });
      }
    }

    return variations.slice(0, 3);
  }

  private recordPerformance(
    latency_ms: number, 
    cache_hit: boolean, 
    optimization_level: string
  ): void {
    this.performanceHistory.push({
      timestamp: Date.now(),
      latency_ms,
      cache_hit,
      optimization_level
    });

    // Keep only recent history (last 10000 entries)
    if (this.performanceHistory.length > 10000) {
      this.performanceHistory = this.performanceHistory.slice(-10000);
    }
  }

  private adaptiveOptimization(latency_ms: number, optimizationLevel: OptimizationLevel): void {
    // Adaptive parameter adjustment based on performance
    if (latency_ms > optimizationLevel.target_latency_ms * 1.2) {
      // Performance below target - increase cache TTL
      optimizationLevel.cache_ttl_multiplier = Math.min(5.0, optimizationLevel.cache_ttl_multiplier * 1.1);
    } else if (latency_ms < optimizationLevel.target_latency_ms * 0.5) {
      // Performance well above target - can reduce cache TTL for fresher data
      optimizationLevel.cache_ttl_multiplier = Math.max(0.5, optimizationLevel.cache_ttl_multiplier * 0.95);
    }
  }

  private calculateConfidence(decision: any, cache_hit: boolean, latency_ms: number): number {
    let confidence = decision.confidence || 0.8;

    // Boost confidence for cache hits (already validated)
    if (cache_hit) {
      confidence += 0.1;
    }

    // Reduce confidence for high latency (may indicate system stress)
    if (latency_ms > this.defaultLatencyTarget * 2) {
      confidence -= 0.1;
    }

    return Math.max(0, Math.min(1, confidence));
  }

  private startPerformanceMonitoring(): void {
    // Periodic cache cleanup and monitoring
    setInterval(() => {
      this.cleanupExpiredEntries();
      this.monitorPerformance();
    }, 60000); // Every minute
  }

  private cleanupExpiredEntries(): void {
    const now = Date.now();
    
    for (const cache of [this.l1Cache, this.l2Cache, this.fragmentCache]) {
      for (const [key, entry] of cache.entries()) {
        if (now - entry.timestamp > entry.ttl) {
          cache.delete(key);
        }
      }
    }
  }

  private monitorPerformance(): void {
    const recent = this.performanceHistory.slice(-1000); // Last 1000 entries
    if (recent.length === 0) return;

    const avgLatency = recent.reduce((sum, entry) => sum + entry.latency_ms, 0) / recent.length;
    const cacheHitRate = recent.filter(entry => entry.cache_hit).length / recent.length;

    console.log(`Performance Monitor: Avg Latency: ${avgLatency.toFixed(2)}ms, Cache Hit Rate: ${(cacheHitRate * 100).toFixed(1)}%`);
    
    // Alert if performance degrades
    if (avgLatency > this.defaultLatencyTarget * 1.5) {
      console.warn(`Performance Alert: Average latency ${avgLatency.toFixed(2)}ms exceeds target ${this.defaultLatencyTarget}ms`);
    }
  }

  async getPerformanceMetrics(): Promise<PerformanceMetrics> {
    const recent = this.performanceHistory.slice(-1000);
    if (recent.length === 0) {
      return {
        average_latency_ms: 0,
        p95_latency_ms: 0,
        p99_latency_ms: 0,
        cache_hit_rate: 0,
        throughput_rps: 0,
        optimization_target_achievement: 0
      };
    }

    const latencies = recent.map(entry => entry.latency_ms).sort((a, b) => a - b);
    const average_latency_ms = latencies.reduce((sum, lat) => sum + lat, 0) / latencies.length;
    const p95_latency_ms = latencies[Math.floor(latencies.length * 0.95)];
    const p99_latency_ms = latencies[Math.floor(latencies.length * 0.99)];
    const cache_hit_rate = recent.filter(entry => entry.cache_hit).length / recent.length;
    
    // Calculate throughput (requests per second)
    const timeSpan = (recent[recent.length - 1].timestamp - recent[0].timestamp) / 1000;
    const throughput_rps = timeSpan > 0 ? recent.length / timeSpan : 0;
    
    // Target achievement (percentage of requests meeting target latency)
    const target_met = recent.filter(entry => entry.latency_ms <= this.defaultLatencyTarget).length;
    const optimization_target_achievement = target_met / recent.length;

    return {
      average_latency_ms,
      p95_latency_ms,
      p99_latency_ms,
      cache_hit_rate,
      throughput_rps,
      optimization_target_achievement
    };
  }

  async getCacheMetrics(): Promise<Record<string, CacheMetrics>> {
    const caches = {
      L1: this.l1Cache,
      L2: this.l2Cache,
      Fragment: this.fragmentCache
    };

    const metrics: Record<string, CacheMetrics> = {};

    for (const [name, cache] of Object.entries(caches)) {
      const entries = Array.from(cache.values());
      const total_accesses = entries.reduce((sum, entry) => sum + entry.access_count, 0);
      const cache_size = cache.size;
      
      // Estimate memory usage (rough approximation)
      const memory_usage_mb = cache_size * 0.001; // 1KB per entry average

      metrics[name] = {
        hit_rate: 0.85, // Would be calculated from actual hit/miss tracking
        miss_rate: 0.15,
        average_lookup_time_ms: name === 'L1' ? 0.1 : name === 'L2' ? 0.5 : 0.3,
        eviction_count: 0, // Would track actual evictions
        cache_size,
        memory_usage_mb
      };
    }

    return metrics;
  }

  async benchmark(
    request_count: number = 1000,
    optimization_level: string = 'enhanced'
  ): Promise<{
    total_requests: number;
    average_latency_ms: number;
    min_latency_ms: number;
    max_latency_ms: number;
    cache_hit_rate: number;
    target_achievement_rate: number;
    throughput_rps: number;
  }> {
    const startTime = Date.now();
    const results: PolicyDecisionResult[] = [];

    // Generate test requests
    const testRequests: PolicyDecisionRequest[] = [];
    for (let i = 0; i < request_count; i++) {
      testRequests.push({
        policy_id: `benchmark_policy_${i % 10}`, // Create some cache hits
        input_context: { 
          user_id: `user_${i % 100}`,
          action: 'read',
          resource: `resource_${i % 50}`,
          timestamp: Date.now()
        },
        governance_rules: [`rule_${i % 5}`, `rule_${(i + 1) % 5}`],
        priority: ['low', 'medium', 'high', 'critical'][i % 4] as any,
        optimization_level
      });
    }

    // Execute requests
    for (const request of testRequests) {
      const result = await this.optimizePolicyDecision(request);
      results.push(result);
    }

    const endTime = Date.now();
    const totalTime = (endTime - startTime) / 1000; // seconds

    // Calculate benchmark metrics
    const latencies = results.map(r => r.latency_ms);
    const cache_hits = results.filter(r => r.cache_hit).length;
    const target_level = this.optimizationLevels.get(optimization_level)?.target_latency_ms || this.defaultLatencyTarget;
    const target_met = results.filter(r => r.latency_ms <= target_level).length;

    return {
      total_requests: request_count,
      average_latency_ms: latencies.reduce((sum, lat) => sum + lat, 0) / latencies.length,
      min_latency_ms: Math.min(...latencies),
      max_latency_ms: Math.max(...latencies),
      cache_hit_rate: cache_hits / request_count,
      target_achievement_rate: target_met / request_count,
      throughput_rps: request_count / totalTime
    };
  }
}

export const ultraLowLatencyOptimizer = new UltraLowLatencyOptimizer();
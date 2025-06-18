import { LogicalSemanticUnit, PolicyArtifact, EnsembleResult } from '../types/qec-types';

/**
 * AI-powered Policy Generator
 * Converts LSUs into executable policy artifacts using multiple LLM models
 */
export class PolicyGenerator {
  private readonly nvidiaApiKey: string;
  private readonly groqApiKey: string;
  private readonly nvidiaApiUrl = 'https://integrate.api.nvidia.com/v1';
  private readonly groqApiUrl = 'https://api.groq.com/openai/v1';

  constructor() {
    this.nvidiaApiKey = import.meta.env.VITE_NVIDIA_API_KEY || '';
    this.groqApiKey = import.meta.env.VITE_GROQ_API_KEY || '';
  }

  /**
   * Generate policy artifacts using ensemble of AI models
   */
  async generatePolicyArtifacts(lsu: LogicalSemanticUnit): Promise<PolicyArtifact[]> {
    const artifacts: PolicyArtifact[] = [];
    
    try {
      // Generate Rego policy
      const regoPolicy = await this.generateRegoPolicy(lsu);
      artifacts.push(regoPolicy);

      // Generate TLA+ specification
      const tlaSpec = await this.generateTLASpec(lsu);
      artifacts.push(tlaSpec);

      // Generate Python test suite
      const pythonTests = await this.generatePythonTests(lsu);
      artifacts.push(pythonTests);

      // Generate documentation
      const documentation = await this.generateDocumentation(lsu, artifacts);
      artifacts.push(documentation);

      return artifacts;
    } catch (error) {
      console.error('Policy generation failed:', error);
      throw new Error(`Policy generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generate ensemble validation using multiple models
   */
  async generateEnsembleValidation(lsu: LogicalSemanticUnit, task: string): Promise<EnsembleResult> {
    const startTime = Date.now();
    const models = ['nvidia-nemotron', 'groq-qwen'];
    const outputs: string[] = [];
    const confidences: number[] = [];

    // Run parallel inference on available models
    const results = await Promise.allSettled([
      this.callNvidiaAPI(lsu, task),
      this.callGroqAPI(lsu, task)
    ]);

    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        outputs.push(result.value.text);
        confidences.push(result.value.confidence);
      } else {
        console.warn(`Model ${models[index]} failed:`, result.reason);
        outputs.push('');
        confidences.push(0);
      }
    });

    // Calculate consensus using majority vote with confidence weighting
    const finalOutput = this.calculateConsensus(outputs, confidences);
    const agreementScore = this.calculateAgreementScore(outputs);
    const overallConfidence = confidences.reduce((a, b) => a + b, 0) / confidences.length;

    return {
      models_used: models.filter((_, i) => outputs[i] !== ''),
      outputs: outputs.filter(o => o !== ''),
      consensus_method: 'confidence_weighted',
      final_output: finalOutput,
      confidence_score: overallConfidence,
      agreement_score: agreementScore,
      individual_confidences: confidences,
      processing_time_ms: Date.now() - startTime
    };
  }

  private async generateRegoPolicy(lsu: LogicalSemanticUnit): Promise<PolicyArtifact> {
    const prompt = `Generate an OPA Rego policy that implements this governance rule:

"${lsu.content}"

Requirements:
- Use proper Rego syntax and structure
- Include input validation
- Add descriptive comments
- Implement allow/deny logic
- Consider edge cases and security implications

Return only the Rego policy code:`;

    const ensembleResult = await this.generateEnsembleValidation(lsu, prompt);

    return {
      id: `rego-${Date.now()}`,
      type: 'rego_policy',
      content: ensembleResult.final_output,
      lsu_id: lsu.id,
      generated_by: 'ai_model',
      model_used: ensembleResult.models_used.join(', '),
      confidence_score: ensembleResult.confidence_score,
      validation_status: 'pending',
      created_at: new Date().toISOString()
    };
  }

  private async generateTLASpec(lsu: LogicalSemanticUnit): Promise<PolicyArtifact> {
    const prompt = `Generate a TLA+ specification that formally models this governance rule:

"${lsu.content}"

Requirements:
- Define proper state variables and initial conditions
- Model the system behavior and transitions
- Include safety and liveness properties
- Add invariants that must hold
- Use proper TLA+ syntax

Return only the TLA+ specification:`;

    const ensembleResult = await this.generateEnsembleValidation(lsu, prompt);

    return {
      id: `tla-${Date.now()}`,
      type: 'tla_spec',
      content: ensembleResult.final_output,
      lsu_id: lsu.id,
      generated_by: 'ai_model',
      model_used: ensembleResult.models_used.join(', '),
      confidence_score: ensembleResult.confidence_score,
      validation_status: 'pending',
      created_at: new Date().toISOString()
    };
  }

  private async generatePythonTests(lsu: LogicalSemanticUnit): Promise<PolicyArtifact> {
    const prompt = `Generate comprehensive Python test cases for this governance rule:

"${lsu.content}"

Requirements:
- Use pytest framework
- Test positive and negative cases
- Include edge cases and boundary conditions
- Add descriptive test names and docstrings
- Mock external dependencies if needed
- Test for security vulnerabilities

Return only the Python test code:`;

    const ensembleResult = await this.generateEnsembleValidation(lsu, prompt);

    return {
      id: `test-${Date.now()}`,
      type: 'python_test',
      content: ensembleResult.final_output,
      lsu_id: lsu.id,
      generated_by: 'ai_model',
      model_used: ensembleResult.models_used.join(', '),
      confidence_score: ensembleResult.confidence_score,
      validation_status: 'pending',
      created_at: new Date().toISOString()
    };
  }

  private async generateDocumentation(lsu: LogicalSemanticUnit, artifacts: PolicyArtifact[]): Promise<PolicyArtifact> {
    const prompt = `Generate comprehensive documentation for this governance policy:

Original Rule: "${lsu.content}"

Generated Artifacts:
- Rego Policy: ${artifacts.find(a => a.type === 'rego_policy')?.content.slice(0, 200)}...
- TLA+ Spec: ${artifacts.find(a => a.type === 'tla_spec')?.content.slice(0, 200)}...
- Python Tests: ${artifacts.find(a => a.type === 'python_test')?.content.slice(0, 200)}...

Requirements:
- Explain the governance rule and its purpose
- Document the implementation approach
- Describe verification methods
- Include usage examples
- Add troubleshooting guide
- List compliance considerations

Return markdown documentation:`;

    const ensembleResult = await this.generateEnsembleValidation(lsu, prompt);

    return {
      id: `doc-${Date.now()}`,
      type: 'documentation',
      content: ensembleResult.final_output,
      lsu_id: lsu.id,
      generated_by: 'ai_model',
      model_used: ensembleResult.models_used.join(', '),
      confidence_score: ensembleResult.confidence_score,
      validation_status: 'pending',
      created_at: new Date().toISOString()
    };
  }

  private async callNvidiaAPI(lsu: LogicalSemanticUnit, prompt: string): Promise<{ text: string; confidence: number }> {
    if (!this.nvidiaApiKey) {
      throw new Error('NVIDIA API key not configured');
    }

    const response = await fetch(`${this.nvidiaApiUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.nvidiaApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'meta/llama-3.1-405b-instruct',
        messages: [
          {
            role: 'system',
            content: 'You are an expert AI governance and policy generation assistant specialized in creating secure, compliant, and effective governance policies.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 2000,
        temperature: 0.3,
        top_p: 0.9
      })
    });

    if (!response.ok) {
      throw new Error(`NVIDIA API error: ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';
    
    // Simple confidence estimation based on response length and model certainty
    const confidence = Math.min(0.95, 0.6 + (content.length / 2000) * 0.35);

    return {
      text: content,
      confidence: confidence
    };
  }

  private async callGroqAPI(lsu: LogicalSemanticUnit, prompt: string): Promise<{ text: string; confidence: number }> {
    if (!this.groqApiKey) {
      throw new Error('Groq API key not configured');
    }

    const response = await fetch(`${this.groqApiUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.groqApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'qwen2.5-72b-instruct',
        messages: [
          {
            role: 'system',
            content: 'You are an expert AI governance and policy generation assistant specialized in creating secure, compliant, and effective governance policies.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 2000,
        temperature: 0.3,
        top_p: 0.9
      })
    });

    if (!response.ok) {
      throw new Error(`Groq API error: ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';
    
    // Simple confidence estimation
    const confidence = Math.min(0.95, 0.5 + (content.length / 2000) * 0.45);

    return {
      text: content,
      confidence: confidence
    };
  }

  private calculateConsensus(outputs: string[], confidences: number[]): string {
    // Remove empty outputs
    const validOutputs = outputs.filter((output, index) => output.trim() !== '' && confidences[index] > 0);
    const validConfidences = confidences.filter((conf, index) => outputs[index].trim() !== '' && conf > 0);

    if (validOutputs.length === 0) {
      return 'No valid outputs generated';
    }

    if (validOutputs.length === 1) {
      return validOutputs[0];
    }

    // For now, return the output with highest confidence
    // TODO: Implement more sophisticated consensus algorithms
    const maxConfidenceIndex = validConfidences.indexOf(Math.max(...validConfidences));
    return validOutputs[maxConfidenceIndex];
  }

  private calculateAgreementScore(outputs: string[]): number {
    const validOutputs = outputs.filter(o => o.trim() !== '');
    
    if (validOutputs.length <= 1) {
      return 1.0;
    }

    // Simple similarity check - count common words/tokens
    const tokenSets = validOutputs.map(output => 
      new Set(output.toLowerCase().split(/\s+/).filter(token => token.length > 3))
    );

    let totalSimilarity = 0;
    let comparisons = 0;

    for (let i = 0; i < tokenSets.length; i++) {
      for (let j = i + 1; j < tokenSets.length; j++) {
        const intersection = new Set([...tokenSets[i]].filter(x => tokenSets[j].has(x)));
        const union = new Set([...tokenSets[i], ...tokenSets[j]]);
        const similarity = union.size > 0 ? intersection.size / union.size : 0;
        totalSimilarity += similarity;
        comparisons++;
      }
    }

    return comparisons > 0 ? totalSimilarity / comparisons : 0;
  }
}

// Export singleton instance
export const policyGenerator = new PolicyGenerator();
export interface VLLMResponse {
  choices: {
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface VLLMRequest {
  model: string;
  messages: {
    role: 'system' | 'user' | 'assistant';
    content: string;
  }[];
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  stream?: boolean;
}

export class VLLMClient {
  private baseUrl: string;
  private modelName: string;

  constructor(
    baseUrl: string = 'http://localhost:8000', 
    modelName: string = 'openbmb/MiniCPM4-8B-Eagle-FRSpec-QAT-cpmcu'
  ) {
    this.baseUrl = baseUrl;
    this.modelName = modelName;
  }

  async isServerHealthy(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/health`, {
        method: 'GET',
        timeout: 5000,
      } as RequestInit);
      return response.ok;
    } catch (error) {
      console.warn('vLLM server health check failed:', error);
      return false;
    }
  }

  async generateCompletion(
    prompt: string,
    systemPrompt?: string,
    options: Partial<VLLMRequest> = {}
  ): Promise<VLLMResponse> {
    const messages: VLLMRequest['messages'] = [];
    
    if (systemPrompt) {
      messages.push({
        role: 'system',
        content: systemPrompt
      });
    }
    
    messages.push({
      role: 'user',
      content: prompt
    });

    const requestBody: VLLMRequest = {
      model: this.modelName,
      messages,
      temperature: 0.7,
      max_tokens: 2048,
      top_p: 0.9,
      stream: false,
      ...options
    };

    const response = await fetch(`${this.baseUrl}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`vLLM API error: ${response.status} ${response.statusText}`);
    }

    return await response.json() as VLLMResponse;
  }

  async generateRepresentation(
    lsu: string,
    representationType: 'rego' | 'tla' | 'python' | 'markdown'
  ): Promise<string> {
    const systemPrompts = {
      rego: `You are an expert in Open Policy Agent (OPA) Rego policy language. Generate production-ready Rego policies that implement the given Logical Semantic Unit (LSU). Include proper package declarations, rules, and helper functions.`,
      
      tla: `You are an expert in TLA+ formal specification language. Generate formal TLA+ specifications that model the given Logical Semantic Unit (LSU). Include proper module structure, variables, initialization, next-state relations, and invariants.`,
      
      python: `You are an expert Python developer specializing in test automation and policy validation. Generate comprehensive Python test suites that validate the given Logical Semantic Unit (LSU). Include unit tests, integration tests, and edge case validation.`,
      
      markdown: `You are a technical documentation expert. Generate comprehensive documentation for the given Logical Semantic Unit (LSU). Include overview, implementation details, verification methods, and compliance information.`
    };

    const prompts = {
      rego: `Generate a Rego policy that implements this requirement: "${lsu}"

The policy should:
1. Include proper package declaration
2. Have clear allow/deny rules
3. Include helper functions for validation
4. Handle edge cases appropriately
5. Be production-ready

Return only the Rego code without explanation.`,

      tla: `Generate a TLA+ specification that formally models this requirement: "${lsu}"

The specification should:
1. Include proper module declaration
2. Define state variables
3. Include Init and Next predicates
4. Define safety and liveness properties
5. Be mathematically precise

Return only the TLA+ code without explanation.`,

      python: `Generate a Python test suite that validates this requirement: "${lsu}"

The test suite should:
1. Include comprehensive unit tests
2. Test edge cases and boundary conditions
3. Use pytest framework
4. Include proper assertions
5. Test both positive and negative cases

Return only the Python test code without explanation.`,

      markdown: `Generate comprehensive documentation for this requirement: "${lsu}"

The documentation should:
1. Include clear overview
2. Detail implementation approach
3. List verification methods
4. Cover compliance considerations
5. Be well-structured with proper headers

Return only the Markdown documentation without explanation.`
    };

    const response = await this.generateCompletion(
      prompts[representationType],
      systemPrompts[representationType],
      { 
        temperature: 0.3, // Lower temperature for more consistent code generation
        max_tokens: 1024 
      }
    );

    return response.choices[0]?.message?.content || '';
  }

  async analyzeSemanticConsistency(
    lsu: string,
    representations: Record<string, string>
  ): Promise<{
    isConsistent: boolean;
    confidence: number;
    issues: string[];
    analysis: string;
  }> {
    const systemPrompt = `You are an expert semantic analyzer specializing in cross-representation consistency validation. Analyze the consistency between different representations of the same logical requirement.`;

    const prompt = `Analyze the semantic consistency of these representations for the LSU: "${lsu}"

Representations:
${Object.entries(representations).map(([type, content]) => `
${type.toUpperCase()}:
\`\`\`
${content}
\`\`\`
`).join('\n')}

Evaluate:
1. Do all representations implement the same logical requirement?
2. Are there any semantic contradictions between representations?
3. Are the implementation approaches consistent?
4. What is your confidence level (0-100%)?

Return a JSON response with this exact structure:
{
  "isConsistent": boolean,
  "confidence": number,
  "issues": ["list of specific issues found"],
  "analysis": "detailed analysis explanation"
}`;

    const response = await this.generateCompletion(prompt, systemPrompt, {
      temperature: 0.2,
      max_tokens: 1024
    });

    try {
      const content = response.choices[0]?.message?.content || '{}';
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (error) {
      console.warn('Failed to parse semantic consistency response:', error);
    }

    // Fallback response
    return {
      isConsistent: false,
      confidence: 0.3,
      issues: ['Failed to analyze semantic consistency'],
      analysis: 'Analysis could not be completed due to parsing error'
    };
  }

  async performSecurityAnalysis(
    representations: Record<string, string>
  ): Promise<{
    hasSecurityIssues: boolean;
    severity: 'low' | 'medium' | 'high' | 'critical';
    vulnerabilities: string[];
    recommendations: string[];
  }> {
    const systemPrompt = `You are a cybersecurity expert specializing in policy and code security analysis. Identify security vulnerabilities and provide recommendations.`;

    const prompt = `Perform a security analysis of these code representations:

${Object.entries(representations).map(([type, content]) => `
${type.toUpperCase()}:
\`\`\`
${content}
\`\`\`
`).join('\n')}

Analyze for:
1. Security vulnerabilities
2. Access control issues
3. Input validation problems
4. Injection attack vectors
5. Authorization bypass potential

Return a JSON response with this exact structure:
{
  "hasSecurityIssues": boolean,
  "severity": "low|medium|high|critical",
  "vulnerabilities": ["list of specific vulnerabilities"],
  "recommendations": ["list of security recommendations"]
}`;

    const response = await this.generateCompletion(prompt, systemPrompt, {
      temperature: 0.2,
      max_tokens: 1024
    });

    try {
      const content = response.choices[0]?.message?.content || '{}';
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (error) {
      console.warn('Failed to parse security analysis response:', error);
    }

    // Fallback response
    return {
      hasSecurityIssues: true,
      severity: 'medium',
      vulnerabilities: ['Could not complete security analysis'],
      recommendations: ['Manual security review required']
    };
  }
}

export const vllmClient = new VLLMClient();
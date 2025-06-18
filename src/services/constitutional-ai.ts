import { ConstitutionalPrinciple, BiasAssessment, LogicalSemanticUnit, PolicyArtifact } from '../types/qec-types';

/**
 * Constitutional AI Engine for bias mitigation and alignment
 * Implements collective constitutional AI principles for fair governance
 */
export class ConstitutionalAI {
  private readonly principles: ConstitutionalPrinciple[] = [
    {
      id: 'fairness-equality',
      title: 'Fairness and Equality',
      description: 'Policies should treat all individuals and groups equitably without discrimination',
      category: 'fairness',
      weight: 1.0,
      examples: [
        'Does not discriminate based on protected characteristics',
        'Provides equal opportunities and access',
        'Considers disparate impact on different groups'
      ],
      stakeholder_votes: 847,
      created_at: '2024-01-01T00:00:00Z'
    },
    {
      id: 'transparency-explainability',
      title: 'Transparency and Explainability',
      description: 'Policies should be clear, understandable, and their decisions explainable',
      category: 'transparency',
      weight: 0.9,
      examples: [
        'Clear reasoning for policy decisions',
        'Accessible language and documentation',
        'Audit trails for all decisions'
      ],
      stakeholder_votes: 723,
      created_at: '2024-01-01T00:00:00Z'
    },
    {
      id: 'accountability-responsibility',
      title: 'Accountability and Responsibility',
      description: 'Clear lines of responsibility and mechanisms for redress',
      category: 'accountability',
      weight: 0.95,
      examples: [
        'Clear ownership and responsibility',
        'Appeals and correction mechanisms',
        'Regular review and updates'
      ],
      stakeholder_votes: 692,
      created_at: '2024-01-01T00:00:00Z'
    },
    {
      id: 'privacy-protection',
      title: 'Privacy Protection',
      description: 'Respect for individual privacy and data protection rights',
      category: 'privacy',
      weight: 0.85,
      examples: [
        'Minimal data collection and use',
        'Strong security and access controls',
        'Respect for consent and choice'
      ],
      stakeholder_votes: 658,
      created_at: '2024-01-01T00:00:00Z'
    },
    {
      id: 'safety-security',
      title: 'Safety and Security',
      description: 'Policies should prioritize safety and security of all stakeholders',
      category: 'safety',
      weight: 1.0,
      examples: [
        'Risk assessment and mitigation',
        'Fail-safe mechanisms',
        'Continuous monitoring and improvement'
      ],
      stakeholder_votes: 789,
      created_at: '2024-01-01T00:00:00Z'
    }
  ];

  private readonly nvidiaApiKey: string;
  private readonly nvidiaApiUrl = 'https://integrate.api.nvidia.com/v1';

  constructor() {
    this.nvidiaApiKey = import.meta.env.VITE_NVIDIA_API_KEY || '';
  }

  /**
   * Assess bias across multiple social dimensions
   */
  async assessBias(content: string, type: 'lsu' | 'policy' | 'decision'): Promise<BiasAssessment> {
    const prompt = `Analyze the following ${type} for potential bias across multiple social dimensions.

Content to analyze:
"${content}"

Please assess bias potential (scale 0-1, where 0 = no bias detected, 1 = severe bias) for each dimension:
1. Gender bias
2. Age bias  
3. Race/ethnicity bias
4. Socioeconomic bias
5. Geographic bias
6. Political bias
7. Religious bias
8. Disability bias
9. Sexual orientation bias

For each dimension, provide:
- A numerical score (0-1)
- Brief explanation of any concerns
- Specific flagged issues
- Mitigation suggestions

Format response as JSON with the structure:
{
  "overall_score": number,
  "dimension_scores": {
    "gender": number,
    "age": number,
    "race_ethnicity": number,
    "socioeconomic": number,
    "geographic": number,
    "political": number,
    "religious": number,
    "disability": number,
    "sexual_orientation": number
  },
  "flagged_issues": [string],
  "mitigation_suggestions": [string],
  "confidence": number
}`;

    try {
      const response = await this.callNvidiaAPI(prompt, 'bias-assessment');
      const assessment = JSON.parse(response.text);
      
      return {
        ...assessment,
        assessment_model: 'nvidia-llama-3.1-405b'
      };
    } catch (error) {
      console.error('Bias assessment failed:', error);
      
      // Return conservative fallback assessment
      return {
        overall_score: 0.5,
        dimension_scores: {
          gender: 0.5,
          age: 0.5,
          race_ethnicity: 0.5,
          socioeconomic: 0.5,
          geographic: 0.5,
          political: 0.5,
          religious: 0.5,
          disability: 0.5,
          sexual_orientation: 0.5
        },
        flagged_issues: ['Unable to complete full bias assessment - manual review recommended'],
        mitigation_suggestions: ['Conduct manual bias review', 'Test with diverse stakeholder groups'],
        confidence: 0.3,
        assessment_model: 'fallback-conservative'
      };
    }
  }

  /**
   * Check alignment with constitutional principles
   */
  async checkConstitutionalAlignment(
    lsu: LogicalSemanticUnit, 
    artifacts: PolicyArtifact[]
  ): Promise<{ principle_id: string; compliance_score: number; violations: string[] }[]> {
    const alignmentResults = [];

    for (const principle of this.principles) {
      const prompt = `Evaluate how well this governance policy aligns with the constitutional principle: "${principle.title}"

Principle Description: ${principle.description}

Examples of compliance:
${principle.examples.map(ex => `- ${ex}`).join('\n')}

Original Rule (LSU): "${lsu.content}"

Generated Policy Artifacts:
${artifacts.map(artifact => `${artifact.type}: ${artifact.content.slice(0, 300)}...`).join('\n\n')}

Please evaluate:
1. Compliance score (0-1, where 1 = perfect alignment)
2. List any violations or concerns
3. Suggest improvements if needed

Format response as JSON:
{
  "compliance_score": number,
  "violations": [string],
  "improvements": [string],
  "confidence": number
}`;

      try {
        const response = await this.callNvidiaAPI(prompt, 'constitutional-alignment');
        const result = JSON.parse(response.text);
        
        alignmentResults.push({
          principle_id: principle.id,
          compliance_score: result.compliance_score,
          violations: result.violations || []
        });
      } catch (error) {
        console.error(`Constitutional alignment check failed for ${principle.id}:`, error);
        
        // Add conservative fallback
        alignmentResults.push({
          principle_id: principle.id,
          compliance_score: 0.7, // Neutral score
          violations: ['Unable to complete alignment assessment - manual review recommended']
        });
      }
    }

    return alignmentResults;
  }

  /**
   * Apply constitutional corrections to policy content
   */
  async applyConstitutionalCorrections(
    content: string,
    violations: string[],
    principle: ConstitutionalPrinciple
  ): Promise<string> {
    if (violations.length === 0) {
      return content;
    }

    const prompt = `Please revise the following policy content to address constitutional principle violations:

Constitutional Principle: "${principle.title}"
Description: ${principle.description}

Current Policy Content:
"${content}"

Identified Violations:
${violations.map(v => `- ${v}`).join('\n')}

Please provide a revised version that:
1. Addresses all identified violations
2. Maintains the original intent and functionality
3. Aligns with the constitutional principle
4. Preserves technical accuracy

Return only the corrected policy content:`;

    try {
      const response = await this.callNvidiaAPI(prompt, 'constitutional-correction');
      return response.text.trim();
    } catch (error) {
      console.error('Constitutional correction failed:', error);
      return content; // Return original if correction fails
    }
  }

  /**
   * Generate stakeholder impact assessment
   */
  async generateStakeholderImpactAssessment(
    lsu: LogicalSemanticUnit,
    artifacts: PolicyArtifact[]
  ): Promise<{
    stakeholder_groups: string[];
    impacts: { group: string; impact: string; severity: 'low' | 'medium' | 'high' }[];
    mitigation_strategies: string[];
  }> {
    const prompt = `Analyze the potential impact of this governance policy on different stakeholder groups:

Original Rule: "${lsu.content}"

Generated Policy Implementation:
${artifacts.find(a => a.type === 'rego_policy')?.content.slice(0, 500) || 'No policy implementation available'}

Please identify:
1. All relevant stakeholder groups that could be affected
2. Specific impacts on each group (positive, negative, or neutral)
3. Severity of impacts (low, medium, high)
4. Recommended mitigation strategies for negative impacts

Format response as JSON:
{
  "stakeholder_groups": [string],
  "impacts": [{"group": string, "impact": string, "severity": "low"|"medium"|"high"}],
  "mitigation_strategies": [string]
}`;

    try {
      const response = await this.callNvidiaAPI(prompt, 'stakeholder-impact');
      return JSON.parse(response.text);
    } catch (error) {
      console.error('Stakeholder impact assessment failed:', error);
      
      return {
        stakeholder_groups: ['end_users', 'administrators', 'regulators'],
        impacts: [
          { group: 'end_users', impact: 'Assessment unavailable - manual review needed', severity: 'medium' }
        ],
        mitigation_strategies: ['Conduct stakeholder consultation', 'Implement feedback mechanisms']
      };
    }
  }

  /**
   * Get constitutional principles for UI display
   */
  getConstitutionalPrinciples(): ConstitutionalPrinciple[] {
    return [...this.principles];
  }

  private async callNvidiaAPI(prompt: string, task: string): Promise<{ text: string; confidence: number }> {
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
            content: `You are an expert in AI ethics, constitutional AI, and bias assessment. You specialize in ${task} and provide thorough, fair, and evidence-based analysis.`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 2000,
        temperature: 0.2, // Lower temperature for more consistent analysis
        top_p: 0.9
      })
    });

    if (!response.ok) {
      throw new Error(`NVIDIA API error: ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';
    
    return {
      text: content,
      confidence: 0.85 // High confidence for constitutional analysis
    };
  }
}

// Export singleton instance
export const constitutionalAI = new ConstitutionalAI();
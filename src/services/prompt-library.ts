import { IntentType } from './intent-parser';

export interface PromptTemplate {
  id: string;
  intent: IntentType;
  version: number;
  performance: {
    accuracy: number;
    factuality: number;
    latency: number;
    complexity: number;
    fitness: number;
  };
  template: string;
  instructions: string[];
  constraints: string[];
  examples?: string[];
  isChampion: boolean;
  isChallenger: boolean;
  createdAt: Date;
  updatedAt: Date;
  usageCount: number;
}

export class PromptLibrary {
  private templates: Map<string, PromptTemplate[]> = new Map();
  private champions: Map<IntentType, PromptTemplate> = new Map();

  constructor() {
    this.initializeDefaultTemplates();
  }

  private initializeDefaultTemplates() {
    const defaultTemplates: Omit<PromptTemplate, 'id' | 'createdAt' | 'updatedAt' | 'usageCount'>[] = [
      {
        intent: 'medical_summary',
        version: 1,
        performance: { accuracy: 0.85, factuality: 0.90, latency: 0.7, complexity: 0.6, fitness: 0.83 },
        template: `You are a medical expert providing accurate summaries. You MUST:

1. Use ONLY the information provided in the context documents
2. Clearly cite all sources with [Source: X] format
3. Think step-by-step through your analysis
4. If information is missing or unclear, explicitly state this
5. Do not speculate or add information not in the sources

Context: {context}

Query: {query}

Please provide a comprehensive medical summary following these steps:
1. First, analyze the key findings
2. Then, summarize the relevant medical information
3. Finally, note any limitations or gaps in the provided information

Response:`,
        instructions: [
          'Use only provided context',
          'Cite all sources',
          'Think step-by-step',
          'Be explicit about limitations'
        ],
        constraints: [
          'No speculation beyond provided data',
          'Must include source citations',
          'Must acknowledge uncertainty when appropriate'
        ],
        examples: [
          'When summarizing clinical trials, include sample size, methodology, and statistical significance',
          'For drug information, specify dosages, contraindications, and side effects when available'
        ],
        isChampion: true,
        isChallenger: false
      },
      {
        intent: 'financial_analysis',
        version: 1,
        performance: { accuracy: 0.80, factuality: 0.85, latency: 0.75, complexity: 0.7, fitness: 0.78 },
        template: `You are a financial analyst providing objective analysis. You MUST:

1. Base all statements on the provided financial data and documents
2. Use precise numerical data with citations [Source: X]
3. Clearly distinguish between facts and analysis/interpretation
4. Include relevant disclaimers about market volatility and risks
5. Think through your analysis step-by-step

Context: {context}

Query: {query}

Please provide your financial analysis following this structure:
1. Key Financial Metrics (from provided data)
2. Analysis and Interpretation
3. Risk Factors and Limitations
4. Conclusion with appropriate disclaimers

Response:`,
        instructions: [
          'Use precise numerical data',
          'Distinguish facts from interpretation',
          'Include risk disclaimers',
          'Structure analysis clearly'
        ],
        constraints: [
          'No investment advice',
          'Must include risk warnings',
          'Base on provided data only'
        ],
        isChampion: true,
        isChallenger: false
      },
      {
        intent: 'technical_explanation',
        version: 1,
        performance: { accuracy: 0.88, factuality: 0.82, latency: 0.8, complexity: 0.5, fitness: 0.84 },
        template: `You are a technical expert providing clear, accurate explanations. You MUST:

1. Use the provided technical documentation and context
2. Explain concepts progressively from basic to advanced
3. Include practical examples where appropriate
4. Cite specific sources for technical claims [Source: X]
5. Be precise about technical specifications and limitations

Context: {context}

Query: {query}

Please structure your technical explanation as follows:
1. Core Concept Overview
2. Detailed Technical Analysis
3. Practical Applications/Examples
4. Limitations and Considerations

Think step-by-step and ensure accuracy.

Response:`,
        instructions: [
          'Progressive complexity explanation',
          'Include practical examples',
          'Precise technical specifications',
          'Cite technical sources'
        ],
        constraints: [
          'Must be technically accurate',
          'No outdated information',
          'Include version/specification details'
        ],
        isChampion: true,
        isChallenger: false
      },
      {
        intent: 'comparative_analysis',
        version: 1,
        performance: { accuracy: 0.83, factuality: 0.87, latency: 0.7, complexity: 0.8, fitness: 0.81 },
        template: `You are conducting a comparative analysis. You MUST:

1. Use ONLY the provided context for both subjects being compared
2. Create a balanced, objective comparison
3. Organize comparison in clear categories/dimensions
4. Cite sources for all claims [Source: X]
5. Acknowledge any gaps in available information

Context: {context}

Query: {query}

Please structure your comparative analysis as follows:
1. Overview of subjects being compared
2. Detailed comparison by key dimensions:
   - [Dimension 1]: Subject A vs Subject B
   - [Dimension 2]: Subject A vs Subject B
   - [Continue for all relevant dimensions]
3. Summary comparison table
4. Limitations and gaps in analysis

Think through each dimension systematically.

Response:`,
        instructions: [
          'Balanced objective comparison',
          'Clear categorical organization',
          'Comprehensive dimension analysis',
          'Summary comparison table'
        ],
        constraints: [
          'Equal treatment of all subjects',
          'No bias toward any option',
          'Must acknowledge information gaps'
        ],
        isChampion: true,
        isChallenger: false
      },
      {
        intent: 'factual_query',
        version: 1,
        performance: { accuracy: 0.90, factuality: 0.95, latency: 0.9, complexity: 0.3, fitness: 0.91 },
        template: `You are answering a factual query with high accuracy. You MUST:

1. Provide direct, factual answers based on reliable sources
2. Include source citations for all factual claims [Source: X]
3. If uncertain or if information is not in context, clearly state this
4. Provide additional relevant context when helpful
5. Be concise but complete

Context: {context}

Query: {query}

Please answer this factual query by:
1. Providing the direct answer first
2. Supporting with evidence from sources
3. Adding relevant context if helpful
4. Noting any limitations or uncertainties

Response:`,
        instructions: [
          'Direct factual answers',
          'Strong source citations',
          'Acknowledge uncertainty',
          'Concise but complete'
        ],
        constraints: [
          'No speculation',
          'Must cite factual claims',
          'Admit when information unavailable'
        ],
        isChampion: true,
        isChallenger: false
      },
      {
        intent: 'general_qa',
        version: 1,
        performance: { accuracy: 0.75, factuality: 0.80, latency: 0.85, complexity: 0.4, fitness: 0.76 },
        template: `You are providing a helpful and accurate response. You MUST:

1. Base your response on the provided context when available
2. Be honest about the limitations of your knowledge
3. Provide clear, well-structured answers
4. Include citations when making specific claims [Source: X]
5. Think step-by-step through complex questions

Context: {context}

Query: {query}

Please provide a helpful response by:
1. Understanding the core question
2. Drawing from available context
3. Structuring your answer clearly
4. Acknowledging any limitations

Response:`,
        instructions: [
          'Helpful and accurate responses',
          'Clear structure',
          'Honest about limitations',
          'Step-by-step for complex questions'
        ],
        constraints: [
          'No false information',
          'Acknowledge knowledge gaps',
          'Use available context first'
        ],
        isChampion: true,
        isChallenger: false
      }
    ];

    // Initialize templates with proper IDs and timestamps
    defaultTemplates.forEach(template => {
      const fullTemplate: PromptTemplate = {
        ...template,
        id: this.generateId(),
        createdAt: new Date(),
        updatedAt: new Date(),
        usageCount: 0
      };

      const intentKey = template.intent;
      if (!this.templates.has(intentKey)) {
        this.templates.set(intentKey, []);
      }
      this.templates.get(intentKey)!.push(fullTemplate);
      
      // Set as champion if marked
      if (template.isChampion) {
        this.champions.set(template.intent, fullTemplate);
      }
    });
  }

  getChampionPrompt(intent: IntentType): PromptTemplate | null {
    return this.champions.get(intent) || null;
  }

  getAllTemplates(intent: IntentType): PromptTemplate[] {
    return this.templates.get(intent) || [];
  }

  addTemplate(template: Omit<PromptTemplate, 'id' | 'createdAt' | 'updatedAt' | 'usageCount'>): string {
    const fullTemplate: PromptTemplate = {
      ...template,
      id: this.generateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
      usageCount: 0
    };

    const intentKey = template.intent;
    if (!this.templates.has(intentKey)) {
      this.templates.set(intentKey, []);
    }
    this.templates.get(intentKey)!.push(fullTemplate);

    return fullTemplate.id;
  }

  updateTemplatePerformance(templateId: string, performance: Partial<PromptTemplate['performance']>) {
    for (const templates of this.templates.values()) {
      const template = templates.find(t => t.id === templateId);
      if (template) {
        template.performance = { ...template.performance, ...performance };
        template.updatedAt = new Date();
        
        // Recalculate fitness score
        template.performance.fitness = this.calculateFitness(template.performance);
        
        return true;
      }
    }
    return false;
  }

  promoteToChampion(templateId: string): boolean {
    for (const templates of this.templates.values()) {
      const template = templates.find(t => t.id === templateId);
      if (template) {
        // Demote current champion
        const currentChampion = this.champions.get(template.intent);
        if (currentChampion) {
          currentChampion.isChampion = false;
        }

        // Promote new champion
        template.isChampion = true;
        template.isChallenger = false;
        this.champions.set(template.intent, template);
        
        return true;
      }
    }
    return false;
  }

  markAsChallenger(templateId: string): boolean {
    for (const templates of this.templates.values()) {
      const template = templates.find(t => t.id === templateId);
      if (template) {
        template.isChallenger = true;
        return true;
      }
    }
    return false;
  }

  incrementUsage(templateId: string) {
    for (const templates of this.templates.values()) {
      const template = templates.find(t => t.id === templateId);
      if (template) {
        template.usageCount++;
        return;
      }
    }
  }

  compilePrompt(template: PromptTemplate, context: string, query: string): string {
    return template.template
      .replace('{context}', context)
      .replace('{query}', query);
  }

  private calculateFitness(performance: PromptTemplate['performance']): number {
    // Multi-objective fitness function from the architecture blueprint
    const weights = {
      accuracy: 0.3,
      factuality: 0.4,  // Higher weight for factuality
      latency: -0.2,    // Negative because lower latency is better
      complexity: -0.1  // Negative because lower complexity is better
    };

    return (
      weights.accuracy * performance.accuracy +
      weights.factuality * performance.factuality +
      weights.latency * performance.latency +
      weights.complexity * performance.complexity
    );
  }

  private generateId(): string {
    return `prompt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Get performance statistics for monitoring
  getPerformanceStats(intent?: IntentType): any {
    const templates = intent ? this.getAllTemplates(intent) : 
                     Array.from(this.templates.values()).flat();

    if (templates.length === 0) return null;

    const stats = {
      count: templates.length,
      avgAccuracy: 0,
      avgFactuality: 0,
      avgFitness: 0,
      championFitness: 0,
      totalUsage: 0
    };

    templates.forEach(template => {
      stats.avgAccuracy += template.performance.accuracy;
      stats.avgFactuality += template.performance.factuality;
      stats.avgFitness += template.performance.fitness;
      stats.totalUsage += template.usageCount;
    });

    stats.avgAccuracy /= templates.length;
    stats.avgFactuality /= templates.length;
    stats.avgFitness /= templates.length;

    if (intent) {
      const champion = this.getChampionPrompt(intent);
      stats.championFitness = champion?.performance.fitness || 0;
    }

    return stats;
  }
}

export const promptLibrary = new PromptLibrary();
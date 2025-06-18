export type IntentType = 
  | 'medical_summary'
  | 'financial_analysis'
  | 'legal_research'
  | 'technical_explanation'
  | 'code_generation'
  | 'data_analysis'
  | 'creative_writing'
  | 'factual_query'
  | 'comparative_analysis'
  | 'general_qa';

export interface ParsedIntent {
  type: IntentType;
  confidence: number;
  domain: string;
  riskLevel: 'low' | 'medium' | 'high';
  entities: string[];
  requiresVerification: boolean;
}

export class IntentParser {
  private medicalKeywords = [
    'drug', 'medication', 'treatment', 'symptom', 'diagnosis', 'clinical', 'trial', 
    'patient', 'dosage', 'side effects', 'therapy', 'disease', 'condition', 'medical'
  ];

  private financialKeywords = [
    'stock', 'investment', 'portfolio', 'trading', 'market', 'price', 'profit', 
    'loss', 'revenue', 'financial', 'earnings', 'budget', 'risk', 'return'
  ];

  private legalKeywords = [
    'law', 'legal', 'contract', 'regulation', 'compliance', 'court', 'case', 
    'statute', 'liability', 'rights', 'obligation', 'jurisdiction', 'litigation'
  ];

  private technicalKeywords = [
    'algorithm', 'system', 'architecture', 'implementation', 'technology', 
    'protocol', 'framework', 'database', 'api', 'configuration', 'optimization'
  ];

  private codeKeywords = [
    'function', 'class', 'variable', 'code', 'programming', 'debug', 'script', 
    'syntax', 'library', 'framework', 'method', 'object', 'array', 'loop'
  ];

  private comparativeKeywords = [
    'compare', 'versus', 'vs', 'difference', 'similarity', 'contrast', 'better', 
    'worse', 'advantages', 'disadvantages', 'pros', 'cons', 'between'
  ];

  parseIntent(query: string): ParsedIntent {
    const normalizedQuery = query.toLowerCase();
    const words = normalizedQuery.split(/\s+/);
    
    // Extract entities (capitalized words, numbers, specific patterns)
    const entities = this.extractEntities(query);
    
    // Calculate keyword matches for each intent type
    const medicalScore = this.calculateKeywordScore(words, this.medicalKeywords);
    const financialScore = this.calculateKeywordScore(words, this.financialKeywords);
    const legalScore = this.calculateKeywordScore(words, this.legalKeywords);
    const technicalScore = this.calculateKeywordScore(words, this.technicalKeywords);
    const codeScore = this.calculateKeywordScore(words, this.codeKeywords);
    const comparativeScore = this.calculateKeywordScore(words, this.comparativeKeywords);
    
    // Determine primary intent
    const scores = {
      medical_summary: medicalScore,
      financial_analysis: financialScore,
      legal_research: legalScore,
      technical_explanation: technicalScore,
      code_generation: codeScore,
      comparative_analysis: comparativeScore,
      data_analysis: this.isDataAnalysisQuery(normalizedQuery) ? 0.8 : 0,
      creative_writing: this.isCreativeWritingQuery(normalizedQuery) ? 0.9 : 0,
      factual_query: this.isFactualQuery(normalizedQuery) ? 0.7 : 0,
      general_qa: 0.3 // baseline score
    };

    const maxScore = Math.max(...Object.values(scores));
    const topIntent = Object.entries(scores).find(([_, score]) => score === maxScore)?.[0] as IntentType;
    
    // Determine risk level and verification requirements
    const riskLevel = this.determineRiskLevel(topIntent!, entities);
    const requiresVerification = riskLevel === 'high' || maxScore > 0.7;
    
    return {
      type: topIntent!,
      confidence: maxScore,
      domain: this.getDomain(topIntent!),
      riskLevel,
      entities,
      requiresVerification
    };
  }

  private calculateKeywordScore(words: string[], keywords: string[]): number {
    const matches = words.filter(word => 
      keywords.some(keyword => word.includes(keyword) || keyword.includes(word))
    );
    return Math.min(matches.length / Math.max(keywords.length * 0.1, 2), 1);
  }

  private extractEntities(query: string): string[] {
    const entities: string[] = [];
    
    // Extract capitalized words (proper nouns)
    const capitalizedWords = query.match(/\b[A-Z][a-zA-Z]+\b/g) || [];
    entities.push(...capitalizedWords);
    
    // Extract numbers and dates
    const numbers = query.match(/\b\d+(\.\d+)?\b/g) || [];
    entities.push(...numbers);
    
    // Extract quoted phrases
    const quotes = query.match(/"([^"]+)"/g) || [];
    entities.push(...quotes.map(q => q.slice(1, -1)));
    
    return [...new Set(entities)].slice(0, 10); // Limit to 10 entities
  }

  private isDataAnalysisQuery(query: string): boolean {
    const dataKeywords = ['analyze', 'data', 'statistics', 'chart', 'graph', 'trend', 'correlation'];
    return dataKeywords.some(keyword => query.includes(keyword));
  }

  private isCreativeWritingQuery(query: string): boolean {
    const creativeKeywords = ['write', 'story', 'poem', 'creative', 'imagine', 'fiction'];
    return creativeKeywords.some(keyword => query.includes(keyword));
  }

  private isFactualQuery(query: string): boolean {
    const factualKeywords = ['what is', 'who is', 'when did', 'where is', 'how many', 'fact'];
    return factualKeywords.some(keyword => query.includes(keyword));
  }

  private determineRiskLevel(intent: IntentType, entities: string[]): 'low' | 'medium' | 'high' {
    // High-risk domains require more verification
    if (['medical_summary', 'financial_analysis', 'legal_research'].includes(intent)) {
      return 'high';
    }
    
    // Medium risk for technical and comparative analysis
    if (['technical_explanation', 'comparative_analysis', 'factual_query'].includes(intent)) {
      return 'medium';
    }
    
    // High risk if many specific entities (names, numbers, etc.)
    if (entities.length > 5) {
      return 'medium';
    }
    
    return 'low';
  }

  private getDomain(intent: IntentType): string {
    const domainMap: Record<IntentType, string> = {
      medical_summary: 'healthcare',
      financial_analysis: 'finance',
      legal_research: 'legal',
      technical_explanation: 'technology',
      code_generation: 'software',
      data_analysis: 'analytics',
      creative_writing: 'creative',
      factual_query: 'knowledge',
      comparative_analysis: 'analysis',
      general_qa: 'general'
    };
    
    return domainMap[intent];
  }
}

export const intentParser = new IntentParser();
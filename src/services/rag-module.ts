export interface Document {
  id: string;
  content: string;
  metadata: {
    source: string;
    title?: string;
    author?: string;
    date?: string;
    domain?: string;
    reliability?: number; // 0-1 score
  };
  embedding?: number[];
  relevanceScore?: number;
}

export interface RetrievalResult {
  documents: Document[];
  query: string;
  retrievalMethod: 'hybrid' | 'semantic' | 'keyword';
  totalMatches: number;
  confidence: number;
}

export class RAGModule {
  private documents: Map<string, Document> = new Map();
  private keywordIndex: Map<string, Set<string>> = new Map();
  
  constructor() {
    this.initializeKnowledgeBase();
  }

  private initializeKnowledgeBase() {
    // Initialize with sample trusted documents for different domains
    const sampleDocs: Omit<Document, 'id'>[] = [
      {
        content: `Acetaminophen (paracetamol) is an analgesic and antipyretic medication. The standard adult dose is 500-1000mg every 4-6 hours, with a maximum daily dose of 4000mg. Common side effects include nausea and skin rash. Overdose can cause severe liver damage. It should be used with caution in patients with liver disease.`,
        metadata: {
          source: 'FDA Drug Database',
          title: 'Acetaminophen Safety Information',
          domain: 'medical',
          reliability: 0.95
        }
      },
      {
        content: `The S&P 500 is a stock market index that measures the stock performance of 500 large companies listed on stock exchanges in the United States. It is market-capitalization-weighted and is one of the most commonly followed equity indices. The index includes companies from all sectors of the economy and is considered a leading indicator of U.S. stock market performance.`,
        metadata: {
          source: 'Financial Industry Regulatory Authority',
          title: 'S&P 500 Index Overview',
          domain: 'financial',
          reliability: 0.98
        }
      },
      {
        content: `HTTP (Hypertext Transfer Protocol) is an application-layer protocol for transmitting hypermedia documents, such as HTML. It was designed for communication between web browsers and web servers. HTTP is stateless, meaning each request-response pair is independent. Common HTTP methods include GET (retrieve data), POST (submit data), PUT (update data), and DELETE (remove data).`,
        metadata: {
          source: 'Mozilla Developer Network',
          title: 'HTTP Protocol Documentation',
          domain: 'technical',
          reliability: 0.92
        }
      },
      {
        content: `Machine learning is a subset of artificial intelligence that enables systems to automatically learn and improve from experience without being explicitly programmed. It focuses on developing algorithms that can access data and use it to learn patterns. Common types include supervised learning (with labeled data), unsupervised learning (finding hidden patterns), and reinforcement learning (learning through interaction).`,
        metadata: {
          source: 'MIT Technology Review',
          title: 'Introduction to Machine Learning',
          domain: 'technical',
          reliability: 0.90
        }
      },
      {
        content: `The Fair Credit Reporting Act (FCRA) is a federal law that regulates the collection, dissemination, and use of consumer information, including consumer credit information. Under FCRA, consumers have the right to know what's in their credit report, dispute inaccurate information, and control access to their credit information. Credit reporting agencies must follow strict procedures for maintaining and providing credit information.`,
        metadata: {
          source: 'Federal Trade Commission',
          title: 'Fair Credit Reporting Act Summary',
          domain: 'legal',
          reliability: 0.99
        }
      },
      {
        content: `Diversification is a risk management strategy that mixes a wide variety of investments within a portfolio. The rationale behind this technique is that a portfolio constructed of different kinds of assets will, on average, yield higher long-term returns and lower the risk of any individual holding or security. Modern Portfolio Theory suggests that diversification can reduce portfolio risk without sacrificing expected returns.`,
        metadata: {
          source: 'CFA Institute',
          title: 'Portfolio Diversification Principles',
          domain: 'financial',
          reliability: 0.94
        }
      }
    ];

    sampleDocs.forEach(doc => {
      const fullDoc: Document = {
        ...doc,
        id: this.generateDocId(),
        embedding: this.generateSimpleEmbedding(doc.content)
      };
      
      this.addDocument(fullDoc);
    });
  }

  addDocument(document: Document): void {
    this.documents.set(document.id, document);
    this.indexDocument(document);
  }

  private indexDocument(document: Document): void {
    // Simple keyword indexing
    const keywords = this.extractKeywords(document.content);
    keywords.forEach(keyword => {
      if (!this.keywordIndex.has(keyword)) {
        this.keywordIndex.set(keyword, new Set());
      }
      this.keywordIndex.get(keyword)!.add(document.id);
    });
  }

  private extractKeywords(content: string): string[] {
    return content
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 3)
      .filter(word => !this.isStopWord(word));
  }

  private isStopWord(word: string): boolean {
    const stopWords = new Set([
      'the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'any', 'can', 'had',
      'her', 'was', 'one', 'our', 'out', 'day', 'get', 'has', 'him', 'his', 'how',
      'man', 'new', 'now', 'old', 'see', 'two', 'way', 'who', 'boy', 'did', 'its',
      'let', 'put', 'say', 'she', 'too', 'use', 'that', 'with', 'have', 'this',
      'will', 'your', 'from', 'they', 'know', 'want', 'been', 'good', 'much',
      'some', 'time', 'very', 'when', 'come', 'here', 'just', 'like', 'long',
      'make', 'many', 'over', 'such', 'take', 'than', 'them', 'well', 'were'
    ]);
    return stopWords.has(word);
  }

  retrieveDocuments(
    query: string, 
    limit: number = 5, 
    domain?: string,
    minReliability: number = 0.7
  ): RetrievalResult {
    const queryKeywords = this.extractKeywords(query);
    const queryEmbedding = this.generateSimpleEmbedding(query);
    
    // Get candidate documents through hybrid retrieval
    const candidates = this.getHybridCandidates(queryKeywords, queryEmbedding, domain, minReliability);
    
    // Rank and select top documents
    const rankedDocs = candidates
      .sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0))
      .slice(0, limit);

    const confidence = this.calculateRetrievalConfidence(rankedDocs, queryKeywords);

    return {
      documents: rankedDocs,
      query,
      retrievalMethod: 'hybrid',
      totalMatches: candidates.length,
      confidence
    };
  }

  private getHybridCandidates(
    queryKeywords: string[], 
    queryEmbedding: number[], 
    domain?: string,
    minReliability: number = 0.7
  ): Document[] {
    const candidates = new Map<string, Document>();
    
    // Keyword-based retrieval (sparse)
    queryKeywords.forEach(keyword => {
      const docIds = this.keywordIndex.get(keyword) || new Set();
      docIds.forEach(docId => {
        const doc = this.documents.get(docId);
        if (doc && (!domain || doc.metadata.domain === domain) && 
            (doc.metadata.reliability || 0) >= minReliability) {
          candidates.set(docId, doc);
        }
      });
    });

    // Semantic similarity (dense) - simplified cosine similarity
    Array.from(this.documents.values()).forEach(doc => {
      if ((!domain || doc.metadata.domain === domain) && 
          (doc.metadata.reliability || 0) >= minReliability) {
        const similarity = this.cosineSimilarity(queryEmbedding, doc.embedding || []);
        if (similarity > 0.3) { // Threshold for semantic relevance
          if (!candidates.has(doc.id)) {
            candidates.set(doc.id, doc);
          }
          // Boost score if found in both keyword and semantic search
          const existingDoc = candidates.get(doc.id)!;
          existingDoc.relevanceScore = (existingDoc.relevanceScore || similarity) + 
                                      (existingDoc.relevanceScore ? 0.2 : 0);
        }
      }
    });

    // Calculate relevance scores for all candidates
    Array.from(candidates.values()).forEach(doc => {
      if (!doc.relevanceScore) {
        doc.relevanceScore = this.calculateRelevanceScore(doc, queryKeywords, queryEmbedding);
      }
    });

    return Array.from(candidates.values());
  }

  private calculateRelevanceScore(
    document: Document, 
    queryKeywords: string[], 
    queryEmbedding: number[]
  ): number {
    const docKeywords = this.extractKeywords(document.content);
    
    // Keyword match score
    const keywordMatches = queryKeywords.filter(qk => 
      docKeywords.some(dk => dk.includes(qk) || qk.includes(dk))
    ).length;
    const keywordScore = keywordMatches / Math.max(queryKeywords.length, 1);
    
    // Semantic similarity score
    const semanticScore = this.cosineSimilarity(queryEmbedding, document.embedding || []);
    
    // Reliability boost
    const reliabilityBoost = (document.metadata.reliability || 0.5) * 0.2;
    
    // Combined score
    return (keywordScore * 0.4) + (semanticScore * 0.4) + reliabilityBoost;
  }

  private calculateRetrievalConfidence(documents: Document[], queryKeywords: string[]): number {
    if (documents.length === 0) return 0;
    
    // Base confidence on average relevance score and number of documents
    const avgRelevance = documents.reduce((sum, doc) => sum + (doc.relevanceScore || 0), 0) / documents.length;
    const coverageBonus = Math.min(documents.length / 3, 1) * 0.2; // Bonus for having multiple sources
    
    return Math.min(avgRelevance + coverageBonus, 1);
  }

  // Simplified embedding generation (in real implementation, use proper embeddings)
  private generateSimpleEmbedding(text: string): number[] {
    const words = this.extractKeywords(text);
    const embedding = new Array(100).fill(0);
    
    words.forEach((word, index) => {
      const hash = this.simpleHash(word);
      embedding[hash % 100] += 1;
    });
    
    // Normalize
    const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
    return magnitude > 0 ? embedding.map(val => val / magnitude) : embedding;
  }

  private simpleHash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  private cosineSimilarity(vecA: number[], vecB: number[]): number {
    if (vecA.length !== vecB.length) return 0;
    
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    
    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }
    
    const denominator = Math.sqrt(normA) * Math.sqrt(normB);
    return denominator === 0 ? 0 : dotProduct / denominator;
  }

  private generateDocId(): string {
    return `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  formatContext(documents: Document[]): string {
    if (documents.length === 0) {
      return "No relevant context documents found.";
    }

    return documents.map((doc, index) => {
      return `[Source ${index + 1}: ${doc.metadata.source}]
Title: ${doc.metadata.title || 'Untitled'}
Content: ${doc.content}
Reliability: ${((doc.metadata.reliability || 0) * 100).toFixed(0)}%
Relevance: ${((doc.relevanceScore || 0) * 100).toFixed(0)}%

`;
    }).join('\n');
  }

  // Get grounding score for a generated response against retrieved context
  calculateGroundingScore(response: string, retrievedDocs: Document[]): number {
    if (retrievedDocs.length === 0) return 0;
    
    const responseKeywords = this.extractKeywords(response);
    const contextKeywords = new Set(
      retrievedDocs.flatMap(doc => this.extractKeywords(doc.content))
    );
    
    // Check how many response keywords are grounded in context
    const groundedKeywords = responseKeywords.filter(keyword => 
      Array.from(contextKeywords).some(ctxKeyword => 
        keyword.includes(ctxKeyword) || ctxKeyword.includes(keyword)
      )
    );
    
    return responseKeywords.length > 0 ? groundedKeywords.length / responseKeywords.length : 0;
  }

  // Get knowledge base statistics
  getKnowledgeBaseStats(): any {
    const domains = new Map<string, number>();
    let totalReliability = 0;
    
    Array.from(this.documents.values()).forEach(doc => {
      const domain = doc.metadata.domain || 'unknown';
      domains.set(domain, (domains.get(domain) || 0) + 1);
      totalReliability += doc.metadata.reliability || 0;
    });

    return {
      totalDocuments: this.documents.size,
      domainDistribution: Object.fromEntries(domains),
      averageReliability: totalReliability / this.documents.size,
      indexedKeywords: this.keywordIndex.size
    };
  }
}

export const ragModule = new RAGModule();
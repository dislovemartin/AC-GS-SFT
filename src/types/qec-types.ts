// Core data types for the QEC-SFT Platform
// These represent the formal schemas of the constitutional artifacts

export interface DetailedDiagnosis {
  issue_explanation: string;
  remediation_steps: string[];
  relevant_artifact?: string;
  confidence: number;
  ai_generated: boolean;
}

export interface SemanticSyndrome {
  lsu_id: string;
  stabilizer_map: {
    name: string;
    outcome: 1 | -1;
    description: string;
    confidence: number;
    detailed_diagnosis?: DetailedDiagnosis;
  }[];
  vector: (1 | -1)[];
  coherence_score: number;
}

export interface CertificateOfSemanticIntegrity {
  diagnosis_id: string;
  lsu_id: string;
  status: "COHERENT" | "INCOHERENT";
  certified_at: string; // ISO 8601 date string
  syndrome_vector: (1 | -1)[];
  sde_version: string;
  coherence_score: number;
  probable_fault_location?: string;
  recommended_action?: string;
  risk_assessment: {
    severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
    impact_analysis: string;
    mitigation_strategy: string;
  };
}

export interface CertifiedArtifactPackage {
  payload: {
    artifact_id: string;
    artifact_type: "rego_policy" | "safety_protocol" | "governance_rule";
    artifact_body: string;
    lsu_id: string;
    representations: Record<string, string>;
    metadata: {
      creation_timestamp: string;
      processing_duration_ms: number;
      version: string;
      ai_mode?: string;
      model_used?: string;
    };
  };
  certificate_of_semantic_integrity: CertificateOfSemanticIntegrity;
  signature: {
    key_id: string;
    algorithm: string;
    value: string;
    timestamp: string;
  };
}

export interface PipelineRun {
  runId: string;
  lsu: string;
  status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";
  startTime: string;
  endTime?: string;
  result?: CertifiedArtifactPackage;
  error?: string;
}

export interface StabilizerCheck {
  name: string;
  description: string;
  category: "syntax" | "semantic" | "security" | "performance" | "compliance";
  weight: number;
  expected_outcome: 1 | -1;
}

// AI Governance Extension Types
export interface LogicalSemanticUnit {
  id: string;
  content: string;
  category: "policy" | "rule" | "requirement" | "constraint";
  priority: "low" | "medium" | "high" | "critical";
  source: "manual" | "regulatory" | "stakeholder" | "ai_generated";
  created_at: string;
  metadata?: Record<string, any>;
}

export interface PolicyArtifact {
  id: string;
  type: "rego_policy" | "tla_spec" | "python_test" | "documentation";
  content: string;
  lsu_id: string;
  generated_by: "simulation" | "ai_model" | "hybrid";
  model_used?: string;
  confidence_score: number;
  validation_status: "pending" | "validated" | "failed";
  created_at: string;
}

export interface EnsembleResult {
  models_used: string[];
  outputs: string[];
  consensus_method: "majority_vote" | "weighted_average" | "confidence_weighted";
  final_output: string;
  confidence_score: number;
  agreement_score: number;
  individual_confidences: number[];
  processing_time_ms: number;
}

export interface ConstitutionalPrinciple {
  id: string;
  title: string;
  description: string;
  category: "fairness" | "transparency" | "accountability" | "privacy" | "safety";
  weight: number;
  examples: string[];
  stakeholder_votes: number;
  created_at: string;
}

export interface BiasAssessment {
  overall_score: number;
  dimension_scores: {
    gender: number;
    age: number;
    race_ethnicity: number;
    socioeconomic: number;
    geographic: number;
    political: number;
    religious: number;
    disability: number;
    sexual_orientation: number;
  };
  flagged_issues: string[];
  mitigation_suggestions: string[];
  confidence: number;
  assessment_model: string;
}

export interface PolicyEnforcementResult {
  request_id: string;
  decision: "allow" | "deny" | "conditional";
  policy_id: string;
  processing_time_ms: number;
  confidence: number;
  explanation: string;
  applied_rules: string[];
  risk_score: number;
  audit_trail: {
    timestamp: string;
    action: string;
    details: Record<string, any>;
  }[];
}

export interface AIGovernanceReport {
  id: string;
  lsu_id: string;
  policy_artifacts: PolicyArtifact[];
  ensemble_results: EnsembleResult[];
  bias_assessment: BiasAssessment;
  constitutional_alignment: {
    principle_id: string;
    compliance_score: number;
    violations: string[];
  }[];
  enforcement_simulation: PolicyEnforcementResult[];
  recommendations: string[];
  generated_at: string;
}
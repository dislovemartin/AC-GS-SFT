export interface CarbonProject {
  id: string;
  name: string;
  description: string;
  location: string;
  projectType: CarbonProjectType;
  verificationStandard: VerificationStandard;
  totalCredits: number;
  availableCredits: number;
  pricePerCredit: number;
  vintage: number;
  certificationDate: Date;
  retirementDate?: Date;
  additionalCertifications: string[];
  images: string[];
  documents: ProjectDocument[];
  impactMetrics: ImpactMetrics;
  assetId?: number;
}

export interface CarbonCredit {
  id: string;
  projectId: string;
  assetId: number;
  serialNumber: string;
  quantity: number;
  vintage: number;
  status: CreditStatus;
  owner: string;
  price: number;
  metadata: CreditMetadata;
  retirementInfo?: RetirementInfo;
  transactionHistory: TransactionRecord[];
}

export interface CreditMetadata {
  projectName: string;
  projectType: CarbonProjectType;
  location: string;
  verificationStandard: VerificationStandard;
  certificationDate: string;
  additionalData: Record<string, any>;
}

export interface RetirementInfo {
  retiredBy: string;
  retiredFor: string;
  retirementDate: Date;
  retirementReason: string;
  beneficiary?: string;
  retirementCertificate: string;
}

export interface TransactionRecord {
  id: string;
  type: TransactionType;
  from: string;
  to: string;
  quantity: number;
  price: number;
  timestamp: Date;
  txHash: string;
}

export interface ImpactMetrics {
  co2Reduced: number;
  treesPlanted?: number;
  renewableEnergyGenerated?: number;
  forestArea?: number;
  beneficiaries?: number;
  sdgGoals: number[];
}

export interface ProjectDocument {
  name: string;
  type: DocumentType;
  url: string;
  hash: string;
  uploadDate: Date;
}

export interface MarketplaceStats {
  totalCreditsIssued: number;
  totalCreditsRetired: number;
  totalProjects: number;
  averagePrice: number;
  totalVolumeTraded: number;
  topProjectTypes: Array<{
    type: CarbonProjectType;
    count: number;
    volume: number;
  }>;
}

export interface CarbonFootprint {
  category: string;
  description: string;
  co2Equivalent: number;
  source: string;
  calculationMethod: string;
}

export interface OffsetRecommendation {
  footprint: CarbonFootprint[];
  totalCO2: number;
  recommendedCredits: number;
  suggestedProjects: CarbonProject[];
  estimatedCost: number;
}

export enum CarbonProjectType {
  REFORESTATION = 'reforestation',
  RENEWABLE_ENERGY = 'renewable_energy',
  METHANE_CAPTURE = 'methane_capture',
  SOIL_CARBON = 'soil_carbon',
  BLUE_CARBON = 'blue_carbon',
  DIRECT_AIR_CAPTURE = 'direct_air_capture',
  BIOCHAR = 'biochar',
  COOKSTOVES = 'cookstoves',
  TRANSPORTATION = 'transportation',
  INDUSTRIAL = 'industrial'
}

export enum VerificationStandard {
  VERRA_VCS = 'verra_vcs',
  GOLD_STANDARD = 'gold_standard',
  CLIMATE_ACTION_RESERVE = 'climate_action_reserve',
  AMERICAN_CARBON_REGISTRY = 'american_carbon_registry',
  PLAN_VIVO = 'plan_vivo'
}

export enum CreditStatus {
  ISSUED = 'issued',
  AVAILABLE = 'available',
  SOLD = 'sold',
  RETIRED = 'retired',
  CANCELLED = 'cancelled'
}

export enum TransactionType {
  ISSUANCE = 'issuance',
  TRANSFER = 'transfer',
  PURCHASE = 'purchase',
  RETIREMENT = 'retirement',
  CANCELLATION = 'cancellation'
}

export enum DocumentType {
  PROJECT_DESIGN = 'project_design',
  VERIFICATION_REPORT = 'verification_report',
  MONITORING_REPORT = 'monitoring_report',
  CERTIFICATION = 'certification',
  LEGAL_DOCUMENT = 'legal_document',
  PHOTO = 'photo',
  OTHER = 'other'
}

export interface CarbonMarketplaceProps {
  onCreditPurchase?: (credit: CarbonCredit) => void;
  onCreditRetire?: (credit: CarbonCredit) => void;
  onProjectView?: (project: CarbonProject) => void;
}

export interface WalletState {
  isConnected: boolean;
  address: string | null;
  balance: number;
  connector: any;
}
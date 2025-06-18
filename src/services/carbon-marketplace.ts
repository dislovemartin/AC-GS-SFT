import algosdk from 'algosdk';
import { 
  CarbonProject, 
  CarbonCredit, 
  CreditMetadata, 
  CarbonProjectType, 
  VerificationStandard,
  CreditStatus,
  TransactionType,
  MarketplaceStats,
  ImpactMetrics
} from '../types/carbon-types';

export class CarbonMarketplaceService {
  private algodClient: algosdk.Algodv2;
  private readonly CARBON_REGISTRY_APP_ID = 0; // Will be set after deployment
  
  constructor() {
    // Initialize Algorand client for TestNet
    this.algodClient = new algosdk.Algodv2(
      '',
      'https://testnet-api.algonode.cloud',
      ''
    );
  }

  // Mock data for development
  private mockProjects: CarbonProject[] = [
    {
      id: 'proj_1',
      name: 'Amazon Rainforest Conservation',
      description: 'Large-scale reforestation and forest conservation project in the Brazilian Amazon, protecting 50,000 hectares of critical habitat.',
      location: 'Acre, Brazil',
      projectType: CarbonProjectType.REFORESTATION,
      verificationStandard: VerificationStandard.VERRA_VCS,
      totalCredits: 500000,
      availableCredits: 125000,
      pricePerCredit: 12.50,
      vintage: 2024,
      certificationDate: new Date('2024-01-15'),
      additionalCertifications: ['FSC Certified', 'CCBS Gold'],
      images: ['/api/placeholder/400/300'],
      documents: [],
      impactMetrics: {
        co2Reduced: 500000,
        treesPlanted: 250000,
        forestArea: 50000,
        beneficiaries: 1200,
        sdgGoals: [13, 15, 1, 8]
      }
    },
    {
      id: 'proj_2',
      name: 'West Texas Wind Farm',
      description: 'Renewable energy generation from wind turbines, displacing fossil fuel-based electricity generation.',
      location: 'Texas, USA',
      projectType: CarbonProjectType.RENEWABLE_ENERGY,
      verificationStandard: VerificationStandard.CLIMATE_ACTION_RESERVE,
      totalCredits: 300000,
      availableCredits: 87500,
      pricePerCredit: 8.75,
      vintage: 2024,
      certificationDate: new Date('2024-02-20'),
      additionalCertifications: ['EPA Green Power'],
      images: ['/api/placeholder/400/300'],
      documents: [],
      impactMetrics: {
        co2Reduced: 300000,
        renewableEnergyGenerated: 450000,
        beneficiaries: 800,
        sdgGoals: [7, 13, 9]
      }
    },
    {
      id: 'proj_3',
      name: 'Kenyan Cookstove Program',
      description: 'Distribution of efficient cookstoves to rural households, reducing fuelwood consumption and indoor air pollution.',
      location: 'Western Kenya',
      projectType: CarbonProjectType.COOKSTOVES,
      verificationStandard: VerificationStandard.GOLD_STANDARD,
      totalCredits: 75000,
      availableCredits: 32000,
      pricePerCredit: 15.20,
      vintage: 2024,
      certificationDate: new Date('2024-03-10'),
      additionalCertifications: ['UN SDG Impact Standard'],
      images: ['/api/placeholder/400/300'],
      documents: [],
      impactMetrics: {
        co2Reduced: 75000,
        beneficiaries: 15000,
        sdgGoals: [3, 5, 13, 7]
      }
    }
  ];

  async getProjects(): Promise<CarbonProject[]> {
    // In production, this would query the blockchain registry
    return this.mockProjects;
  }

  async getProjectById(id: string): Promise<CarbonProject | null> {
    return this.mockProjects.find(p => p.id === id) || null;
  }

  async createCarbonCreditASA(
    creator: algosdk.Account,
    project: CarbonProject,
    quantity: number
  ): Promise<number> {
    const metadata: CreditMetadata = {
      projectName: project.name,
      projectType: project.projectType,
      location: project.location,
      verificationStandard: project.verificationStandard,
      certificationDate: project.certificationDate.toISOString(),
      additionalData: {
        vintage: project.vintage,
        projectId: project.id
      }
    };

    const assetName = `${project.name.substring(0, 20)} Carbon Credit`;
    const unitName = 'tCO2e';
    
    const txn = algosdk.makeAssetCreateTxnWithSuggestedParamsFromObject({
      from: creator.addr,
      suggestedParams: await this.algodClient.getTransactionParams().do(),
      assetName,
      unitName,
      total: quantity,
      decimals: 2,
      defaultFrozen: false,
      manager: creator.addr,
      reserve: creator.addr,
      freeze: undefined,
      clawback: undefined,
      assetURL: `https://carboncreds.app/projects/${project.id}`,
      assetMetadataHash: new Uint8Array(Buffer.from(JSON.stringify(metadata))),
      note: new Uint8Array(Buffer.from(`Carbon Credit - ${project.name}`))
    });

    const signedTxn = txn.signTxn(creator.sk);
    const { txId } = await this.algodClient.sendRawTransaction(signedTxn).do();
    
    const result = await algosdk.waitForConfirmation(this.algodClient, txId, 4);
    return result['asset-index'];
  }

  async purchaseCredits(
    buyer: algosdk.Account,
    project: CarbonProject,
    quantity: number
  ): Promise<string> {
    // In a real implementation, this would interact with a smart contract
    // For now, we'll simulate the purchase
    
    const totalCost = quantity * project.pricePerCredit * 1_000_000; // Convert to microAlgos
    
    const txn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
      from: buyer.addr,
      to: 'CARBON_MARKETPLACE_ADDRESS', // Would be the marketplace contract address
      amount: totalCost,
      note: new Uint8Array(Buffer.from(`Purchase ${quantity} credits from ${project.id}`)),
      suggestedParams: await this.algodClient.getTransactionParams().do()
    });

    const signedTxn = txn.signTxn(buyer.sk);
    const { txId } = await this.algodClient.sendRawTransaction(signedTxn).do();
    
    await algosdk.waitForConfirmation(this.algodClient, txId, 4);
    return txId;
  }

  async retireCredits(
    owner: algosdk.Account,
    assetId: number,
    quantity: number,
    retirementReason: string,
    beneficiary?: string
  ): Promise<string> {
    // Create retirement transaction by sending credits to a burn address
    const burnAddress = 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';
    
    const txn = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
      from: owner.addr,
      to: burnAddress,
      assetIndex: assetId,
      amount: quantity * 100, // Multiply by 100 for 2 decimal places
      note: new Uint8Array(Buffer.from(`RETIREMENT: ${retirementReason} | Beneficiary: ${beneficiary || 'N/A'}`)),
      suggestedParams: await this.algodClient.getTransactionParams().do()
    });

    const signedTxn = txn.signTxn(owner.sk);
    const { txId } = await this.algodClient.sendRawTransaction(signedTxn).do();
    
    await algosdk.waitForConfirmation(this.algodClient, txId, 4);
    return txId;
  }

  async getMarketplaceStats(): Promise<MarketplaceStats> {
    // Mock statistics - in production, this would aggregate on-chain data
    return {
      totalCreditsIssued: 1250000,
      totalCreditsRetired: 185000,
      totalProjects: 47,
      averagePrice: 11.85,
      totalVolumeTraded: 23500000,
      topProjectTypes: [
        { type: CarbonProjectType.REFORESTATION, count: 18, volume: 8500000 },
        { type: CarbonProjectType.RENEWABLE_ENERGY, count: 12, volume: 7200000 },
        { type: CarbonProjectType.METHANE_CAPTURE, count: 8, volume: 4100000 },
        { type: CarbonProjectType.COOKSTOVES, count: 6, volume: 2800000 },
        { type: CarbonProjectType.SOIL_CARBON, count: 3, volume: 900000 }
      ]
    };
  }

  async searchProjects(filters: {
    projectType?: CarbonProjectType;
    verificationStandard?: VerificationStandard;
    location?: string;
    maxPrice?: number;
    minVintage?: number;
  }): Promise<CarbonProject[]> {
    let filtered = this.mockProjects;

    if (filters.projectType) {
      filtered = filtered.filter(p => p.projectType === filters.projectType);
    }
    if (filters.verificationStandard) {
      filtered = filtered.filter(p => p.verificationStandard === filters.verificationStandard);
    }
    if (filters.location) {
      filtered = filtered.filter(p => p.location.toLowerCase().includes(filters.location!.toLowerCase()));
    }
    if (filters.maxPrice) {
      filtered = filtered.filter(p => p.pricePerCredit <= filters.maxPrice!);
    }
    if (filters.minVintage) {
      filtered = filtered.filter(p => p.vintage >= filters.minVintage!);
    }

    return filtered;
  }

  async getUserCredits(userAddress: string): Promise<CarbonCredit[]> {
    // In production, this would query the user's ASA holdings
    // For now, return mock data
    return [
      {
        id: 'cred_1',
        projectId: 'proj_1',
        assetId: 12345,
        serialNumber: 'AMZ-2024-001-100',
        quantity: 100,
        vintage: 2024,
        status: CreditStatus.AVAILABLE,
        owner: userAddress,
        price: 12.50,
        metadata: {
          projectName: 'Amazon Rainforest Conservation',
          projectType: CarbonProjectType.REFORESTATION,
          location: 'Acre, Brazil',
          verificationStandard: VerificationStandard.VERRA_VCS,
          certificationDate: '2024-01-15',
          additionalData: { vintage: 2024, projectId: 'proj_1' }
        },
        transactionHistory: [
          {
            id: 'tx_1',
            type: TransactionType.PURCHASE,
            from: 'MARKETPLACE',
            to: userAddress,
            quantity: 100,
            price: 1250,
            timestamp: new Date(),
            txHash: 'ABC123'
          }
        ]
      }
    ];
  }

  calculateFootprint(activities: Array<{
    category: string;
    amount: number;
    unit: string;
  }>): number {
    // Simplified carbon footprint calculation
    const emissionFactors: Record<string, number> = {
      'flight_domestic': 0.255, // kg CO2 per km
      'flight_international': 0.195,
      'car_gasoline': 0.192, // kg CO2 per km
      'electricity': 0.475, // kg CO2 per kWh
      'natural_gas': 2.04, // kg CO2 per cubic meter
      'beef': 27, // kg CO2 per kg
      'pork': 12.1,
      'chicken': 6.9
    };

    return activities.reduce((total, activity) => {
      const factor = emissionFactors[activity.category] || 0;
      return total + (activity.amount * factor);
    }, 0);
  }
}
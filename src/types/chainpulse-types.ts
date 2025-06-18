// ChainPulse Analytics Data Types
// Comprehensive types for Algorand blockchain analytics

export interface NetworkMetrics {
  networkId: string;
  currentRound: number;
  lastRoundTime: number;
  totalAccounts: number;
  totalTransactions: number;
  totalApplications: number;
  totalAssets: number;
  averageBlockTime: number;
  tps: number;
  networkHealth: 'healthy' | 'degraded' | 'offline';
}

export interface AccountMetrics {
  address: string;
  balance: number;
  minBalance: number;
  totalTransactions: number;
  assetCount: number;
  applicationCount: number;
  firstSeen: number;
  lastActive: number;
  accountType: 'user' | 'application' | 'asset' | 'exchange' | 'defi' | 'nft' | 'unknown';
  labels: string[];
}

export interface TransactionMetrics {
  id: string;
  txType: 'pay' | 'keyreg' | 'acfg' | 'axfer' | 'afrz' | 'appl';
  sender: string;
  receiver?: string;
  amount?: number;
  assetId?: number;
  applicationId?: number;
  confirmedRound: number;
  roundTime: number;
  fee: number;
  note?: string;
  group?: string;
}

export interface ApplicationMetrics {
  id: number;
  creator: string;
  createdAtRound: number;
  deleted: boolean;
  globalStateSchema: {
    numUint: number;
    numByteSlice: number;
  };
  localStateSchema: {
    numUint: number;
    numByteSlice: number;
  };
  callCount: number;
  uniqueCallers: number;
  totalVolume: number;
  category: 'defi' | 'nft' | 'dao' | 'gaming' | 'utility' | 'unknown';
}

export interface AssetMetrics {
  id: number;
  creator: string;
  name: string;
  unitName: string;
  total: number;
  decimals: number;
  defaultFrozen: boolean;
  createdAtRound: number;
  deleted: boolean;
  holderCount: number;
  transferCount: number;
  totalVolume: number;
  category: 'token' | 'nft' | 'stablecoin' | 'governance' | 'unknown';
}

export interface DeFiProtocolMetrics {
  protocolId: string;
  name: string;
  category: 'dex' | 'lending' | 'yield-farming' | 'bridge' | 'derivatives';
  tvl: number;
  volume24h: number;
  volume7d: number;
  fees24h: number;
  userCount: number;
  transactionCount: number;
  applications: number[];
  assets: number[];
}

export interface NFTCollectionMetrics {
  collectionId: string;
  name: string;
  creator: string;
  totalSupply: number;
  holders: number;
  floorPrice: number;
  volume24h: number;
  volume7d: number;
  averagePrice: number;
  listings: number;
  sales24h: number;
}

export interface TimeSeriesDataPoint {
  timestamp: number;
  value: number;
  metadata?: Record<string, any>;
}

export interface AnalyticsQuery {
  metric: string;
  timeframe: '1h' | '24h' | '7d' | '30d' | '90d' | '1y';
  granularity: 'minute' | 'hour' | 'day' | 'week';
  filters?: Record<string, any>;
  groupBy?: string[];
}

export interface AnalyticsResponse {
  query: AnalyticsQuery;
  data: TimeSeriesDataPoint[];
  summary: {
    total: number;
    average: number;
    min: number;
    max: number;
    change24h: number;
    changePercent24h: number;
  };
  lastUpdated: number;
}

export interface WalletProfile {
  address: string;
  balance: number;
  portfolio: {
    assetId: number;
    amount: number;
    value: number;
    percentage: number;
  }[];
  transactionHistory: TransactionMetrics[];
  dexActivity: {
    totalSwaps: number;
    totalVolume: number;
    favoriteTokens: number[];
    liquidityProvided: number;
  };
  nftActivity: {
    owned: number;
    traded: number;
    collections: string[];
    totalSpent: number;
    totalEarned: number;
  };
  defiActivity: {
    protocolsUsed: string[];
    totalValueDeposited: number;
    yieldEarned: number;
  };
  riskScore: number;
  labels: string[];
}

export interface EcosystemHealth {
  network: NetworkMetrics;
  defiTvl: number;
  activeAddresses24h: number;
  transactionVolume24h: number;
  newApplications24h: number;
  newAssets24h: number;
  topProtocols: DeFiProtocolMetrics[];
  topAssets: AssetMetrics[];
  healthScore: number;
  trends: {
    metric: string;
    direction: 'up' | 'down' | 'stable';
    change: number;
  }[];
}

export interface AlertConfig {
  id: string;
  name: string;
  type: 'wallet' | 'protocol' | 'asset' | 'network';
  conditions: {
    metric: string;
    operator: '>' | '<' | '=' | '>=' | '<=';
    value: number;
    timeframe: string;
  }[];
  targets: string[];
  notifications: {
    email?: boolean;
    webhook?: string;
    discord?: string;
  };
  enabled: boolean;
}

export interface DataPipelineStatus {
  component: 'indexer' | 'processor' | 'enricher' | 'api' | 'cache';
  status: 'healthy' | 'degraded' | 'down' | 'maintenance';
  lastUpdate: number;
  latency: number;
  errorRate: number;
  processed24h: number;
}

// Dashboard configuration types
export interface DashboardWidget {
  id: string;
  type: 'chart' | 'metric' | 'table' | 'map' | 'alert';
  title: string;
  query: AnalyticsQuery;
  visualization: {
    chartType?: 'line' | 'bar' | 'pie' | 'area' | 'scatter';
    colors?: string[];
    showLegend?: boolean;
    yAxis?: {
      min?: number;
      max?: number;
      format?: 'number' | 'currency' | 'percentage';
    };
  };
  refreshInterval: number;
  size: 'small' | 'medium' | 'large' | 'xlarge';
}

export interface Dashboard {
  id: string;
  name: string;
  description: string;
  widgets: DashboardWidget[];
  layout: {
    widgetId: string;
    x: number;
    y: number;
    w: number;
    h: number;
  }[];
  isPublic: boolean;
  tags: string[];
  createdAt: number;
  updatedAt: number;
}

export interface ChainPulseConfig {
  apiEndpoint: string;
  refreshInterval: number;
  defaultNetwork: 'mainnet' | 'testnet' | 'betanet';
  features: {
    realTimeUpdates: boolean;
    alerting: boolean;
    customDashboards: boolean;
    apiAccess: boolean;
    exportData: boolean;
  };
  rateLimit: {
    requestsPerMinute: number;
    requestsPerHour: number;
  };
}
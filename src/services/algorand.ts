import algosdk from 'algosdk';

const API_TOKEN = '98D9CE80660AD243893D56D9F125CD2D';

export interface AlgorandConfig {
  nodeUrl: string;
  indexerUrl: string;
  network: 'mainnet' | 'testnet' | 'betanet';
}

export const ALGORAND_CONFIGS: Record<string, AlgorandConfig> = {
  mainnet: {
    nodeUrl: 'https://mainnet-api.4160.nodely.io',
    indexerUrl: 'https://mainnet-idx.4160.nodely.io',
    network: 'mainnet'
  },
  testnet: {
    nodeUrl: 'https://testnet-api.4160.nodely.io',
    indexerUrl: 'https://testnet-idx.4160.nodely.io',
    network: 'testnet'
  },
  betanet: {
    nodeUrl: 'https://betanet-api.4160.nodely.io',
    indexerUrl: 'https://betanet-idx.4160.nodely.io',
    network: 'betanet'
  }
};

export class AlgorandService {
  private algodClient: algosdk.Algodv2;
  private indexerClient: algosdk.Indexer;
  private config: AlgorandConfig;

  constructor(network: 'mainnet' | 'testnet' | 'betanet' = 'testnet') {
    this.config = ALGORAND_CONFIGS[network];
    
    this.algodClient = new algosdk.Algodv2(
      { 'X-Algo-API-Token': API_TOKEN },
      this.config.nodeUrl,
      ''
    );

    this.indexerClient = new algosdk.Indexer(
      { 'X-Algo-API-Token': API_TOKEN },
      this.config.indexerUrl,
      ''
    );
  }

  async getNetworkStatus() {
    try {
      const status = await this.algodClient.status().do();
      return {
        success: true,
        data: status,
        network: this.config.network
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        network: this.config.network
      };
    }
  }

  async getAccountInfo(address: string) {
    try {
      const accountInfo = await this.algodClient.accountInformation(address).do();
      return {
        success: true,
        data: {
          address,
          balance: algosdk.microAlgosToAlgos(accountInfo.amount),
          minBalance: algosdk.microAlgosToAlgos(accountInfo['min-balance']),
          assets: accountInfo.assets || [],
          createdApps: accountInfo['created-apps'] || [],
          appsLocalState: accountInfo['apps-local-state'] || []
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch account info'
      };
    }
  }

  async getAccountTransactions(address: string, limit: number = 10) {
    try {
      const txnResponse = await this.indexerClient
        .lookupAccountTransactions(address)
        .limit(limit)
        .do();
      
      return {
        success: true,
        data: {
          transactions: txnResponse.transactions,
          nextToken: txnResponse['next-token']
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch transactions'
      };
    }
  }

  async getAccountBalance(address: string, round?: number) {
    try {
      if (round) {
        const response = await fetch(
          `${this.config.indexerUrl}/x2/account/${address}/snapshot/${round}/0`,
          {
            headers: {
              'X-Algo-API-Token': API_TOKEN
            }
          }
        );
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        return {
          success: true,
          data: {
            address,
            balance: algosdk.microAlgosToAlgos(data.amount),
            round,
            historical: true
          }
        };
      } else {
        const accountInfo = await this.getAccountInfo(address);
        if (accountInfo.success) {
          return {
            success: true,
            data: {
              address,
              balance: accountInfo.data.balance,
              historical: false
            }
          };
        }
        return accountInfo;
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch balance'
      };
    }
  }

  async compileSmartContract(source: string) {
    try {
      const compiled = await this.algodClient.compile(source).do();
      return {
        success: true,
        data: {
          hash: compiled.hash,
          result: compiled.result
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to compile contract'
      };
    }
  }

  async deployApplication(
    sender: string,
    approvalProgram: Uint8Array,
    clearProgram: Uint8Array,
    numLocalInts: number = 0,
    numLocalByteSlices: number = 0,
    numGlobalInts: number = 0,
    numGlobalByteSlices: number = 0,
    appArgs?: Uint8Array[]
  ) {
    try {
      const suggestedParams = await this.algodClient.getTransactionParams().do();
      
      const txn = algosdk.makeApplicationCreateTxn(
        sender,
        suggestedParams,
        algosdk.OnApplicationComplete.NoOpOC,
        approvalProgram,
        clearProgram,
        numLocalInts,
        numLocalByteSlices,
        numGlobalInts,
        numGlobalByteSlices,
        appArgs
      );

      return {
        success: true,
        data: {
          transaction: txn,
          txnId: txn.txID(),
          note: 'Transaction created - needs to be signed and submitted'
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create deployment transaction'
      };
    }
  }

  async callApplication(
    sender: string,
    appId: number,
    appArgs?: Uint8Array[],
    accounts?: string[],
    foreignApps?: number[],
    foreignAssets?: number[]
  ) {
    try {
      const suggestedParams = await this.algodClient.getTransactionParams().do();
      
      const txn = algosdk.makeApplicationCallTxn(
        sender,
        suggestedParams,
        appId,
        algosdk.OnApplicationComplete.NoOpOC,
        appArgs,
        accounts,
        foreignApps,
        foreignAssets
      );

      return {
        success: true,
        data: {
          transaction: txn,
          txnId: txn.txID(),
          note: 'Transaction created - needs to be signed and submitted'
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create application call'
      };
    }
  }

  async getApplicationInfo(appId: number) {
    try {
      const appInfo = await this.algodClient.getApplicationByID(appId).do();
      return {
        success: true,
        data: appInfo
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch application info'
      };
    }
  }

  switchNetwork(network: 'mainnet' | 'testnet' | 'betanet') {
    this.config = ALGORAND_CONFIGS[network];
    
    this.algodClient = new algosdk.Algodv2(
      { 'X-Algo-API-Token': API_TOKEN },
      this.config.nodeUrl,
      ''
    );

    this.indexerClient = new algosdk.Indexer(
      { 'X-Algo-API-Token': API_TOKEN },
      this.config.indexerUrl,
      ''
    );
  }
}

export const algorandService = new AlgorandService();
import React, { useState, useEffect } from 'react';
import { algorandService } from '../services/algorand';
import { Search, Wallet, Code, Network, RefreshCw, History } from 'lucide-react';

interface AccountInfo {
  address: string;
  balance: number;
  minBalance: number;
  assets: any[];
  createdApps: any[];
  appsLocalState: any[];
}

interface Transaction {
  id: string;
  'tx-type': string;
  'confirmed-round': number;
  'round-time': number;
  sender: string;
  'payment-transaction'?: {
    amount: number;
    receiver: string;
  };
}

const AlgorandDashboard: React.FC = () => {
  const [network, setNetwork] = useState<'mainnet' | 'testnet' | 'betanet'>('testnet');
  const [searchAddress, setSearchAddress] = useState('');
  const [accountInfo, setAccountInfo] = useState<AccountInfo | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [networkStatus, setNetworkStatus] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [contractSource, setContractSource] = useState(`#pragma version 8
// Simple Hello World Smart Contract
txn ApplicationID
int 0
==
bnz main_l1
int 1
return
main_l1:
int 1
return`);
  const [compiledContract, setCompiledContract] = useState<any>(null);

  useEffect(() => {
    loadNetworkStatus();
  }, [network]);

  const loadNetworkStatus = async () => {
    const result = await algorandService.getNetworkStatus();
    if (result.success) {
      setNetworkStatus(result.data);
    }
  };

  const handleNetworkChange = (newNetwork: 'mainnet' | 'testnet' | 'betanet') => {
    setNetwork(newNetwork);
    algorandService.switchNetwork(newNetwork);
    setAccountInfo(null);
    setTransactions([]);
    setError(null);
  };

  const handleSearchAccount = async () => {
    if (!searchAddress.trim()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const [accountResult, txnResult] = await Promise.all([
        algorandService.getAccountInfo(searchAddress),
        algorandService.getAccountTransactions(searchAddress, 10)
      ]);

      if (accountResult.success) {
        setAccountInfo(accountResult.data);
      } else {
        setError(accountResult.error);
      }

      if (txnResult.success) {
        setTransactions(txnResult.data.transactions);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const handleCompileContract = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await algorandService.compileSmartContract(contractSource);
      if (result.success) {
        setCompiledContract(result.data);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to compile contract');
    } finally {
      setLoading(false);
    }
  };

  const formatAlgos = (microAlgos: number) => {
    return (microAlgos / 1000000).toFixed(6);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
              <Network className="w-8 h-8 text-blue-600" />
              Algorand Dashboard
            </h1>
            
            <div className="flex items-center gap-4">
              <select 
                value={network} 
                onChange={(e) => handleNetworkChange(e.target.value as any)}
                className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="testnet">Testnet</option>
                <option value="mainnet">Mainnet</option>
                <option value="betanet">Betanet</option>
              </select>
              
              <button
                onClick={loadNetworkStatus}
                className="p-2 text-gray-600 hover:text-blue-600 transition-colors"
                title="Refresh network status"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
            </div>
          </div>

          {networkStatus && (
            <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-6">
              <div className="flex items-center gap-2 text-green-800">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="font-medium">Network Status: Connected to {network}</span>
              </div>
              <p className="text-sm text-green-700 mt-1">
                Last Round: {networkStatus['last-round']} | 
                Genesis ID: {networkStatus['genesis-id']}
              </p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Wallet className="w-5 h-5 text-blue-600" />
              Account Lookup
            </h2>
            
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                placeholder="Enter Algorand address..."
                value={searchAddress}
                onChange={(e) => setSearchAddress(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                onKeyPress={(e) => e.key === 'Enter' && handleSearchAccount()}
              />
              <button
                onClick={handleSearchAccount}
                disabled={loading || !searchAddress.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Search className="w-4 h-4" />
                Search
              </button>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4">
                {error}
              </div>
            )}

            {accountInfo && (
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-md p-4">
                  <h3 className="font-medium text-gray-800 mb-2">Account Information</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Address:</span>
                      <span className="font-mono break-all">{accountInfo.address}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Balance:</span>
                      <span className="font-medium">{accountInfo.balance} ALGO</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Min Balance:</span>
                      <span>{accountInfo.minBalance} ALGO</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Assets:</span>
                      <span>{accountInfo.assets.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Created Apps:</span>
                      <span>{accountInfo.createdApps.length}</span>
                    </div>
                  </div>
                </div>

                {transactions.length > 0 && (
                  <div className="bg-gray-50 rounded-md p-4">
                    <h3 className="font-medium text-gray-800 mb-2 flex items-center gap-2">
                      <History className="w-4 h-4" />
                      Recent Transactions
                    </h3>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {transactions.map((txn, index) => (
                        <div key={index} className="bg-white rounded p-3 text-sm">
                          <div className="flex justify-between items-start mb-1">
                            <span className="font-medium text-blue-600">{txn['tx-type']}</span>
                            <span className="text-gray-500">Round {txn['confirmed-round']}</span>
                          </div>
                          <div className="text-gray-600">
                            ID: <span className="font-mono text-xs">{txn.id}</span>
                          </div>
                          {txn['payment-transaction'] && (
                            <div className="text-gray-600">
                              Amount: {formatAlgos(txn['payment-transaction'].amount)} ALGO
                            </div>
                          )}
                          <div className="text-gray-500 text-xs">
                            {formatDate(txn['round-time'])}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Code className="w-5 h-5 text-green-600" />
              Smart Contract Compiler
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  TEAL Source Code
                </label>
                <textarea
                  value={contractSource}
                  onChange={(e) => setContractSource(e.target.value)}
                  className="w-full h-40 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 font-mono text-sm"
                  placeholder="Enter TEAL source code..."
                />
              </div>
              
              <button
                onClick={handleCompileContract}
                disabled={loading || !contractSource.trim()}
                className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Code className="w-4 h-4" />
                Compile Contract
              </button>

              {compiledContract && (
                <div className="bg-green-50 rounded-md p-4">
                  <h3 className="font-medium text-green-800 mb-2">Compilation Successful</h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-green-700 font-medium">Hash:</span>
                      <div className="font-mono text-xs mt-1 p-2 bg-white rounded border break-all">
                        {compiledContract.hash}
                      </div>
                    </div>
                    <div>
                      <span className="text-green-700 font-medium">Compiled Bytecode:</span>
                      <div className="font-mono text-xs mt-1 p-2 bg-white rounded border break-all max-h-20 overflow-y-auto">
                        {compiledContract.result}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlgorandDashboard;
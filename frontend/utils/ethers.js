import { ethers } from 'ethers';

// Network configurations
const NETWORKS = {
  SEPOLIA: {
    chainId: '0xaa36a7', // 11155111 in hex
    chainName: 'Sepolia Testnet',
    nativeCurrency: {
      name: 'Sepolia Ether',
      symbol: 'ETH',
      decimals: 18,
    },
    rpcUrls: ['https://sepolia.infura.io/v3/'],
    blockExplorerUrls: ['https://sepolia.etherscan.io/'],
  },
  MUMBAI: {
    chainId: '0x13881', // 80001 in hex
    chainName: 'Mumbai Testnet',
    nativeCurrency: {
      name: 'MATIC',
      symbol: 'MATIC',
      decimals: 18,
    },
    rpcUrls: ['https://rpc-mumbai.maticvigil.com/'],
    blockExplorerUrls: ['https://mumbai.polygonscan.com/'],
  },
};

// Check if MetaMask is installed
export const isMetaMaskInstalled = () => {
  return typeof window !== 'undefined' && window.ethereum && window.ethereum.isMetaMask;
};

// Initialize provider
export const getProvider = () => {
  if (!isMetaMaskInstalled()) {
    throw new Error('MetaMask is not installed!');
  }
  
  return new ethers.BrowserProvider(window.ethereum);
};

// Request account connection
export const connectWallet = async () => {
  if (!isMetaMaskInstalled()) {
    throw new Error('MetaMask is not installed!');
  }
  
  try {
    // Request account access
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    return accounts[0];
  } catch (error) {
    console.error('Error connecting to MetaMask:', error);
    throw error;
  }
};

// Get current account
export const getCurrentAccount = async () => {
  if (!isMetaMaskInstalled()) {
    throw new Error('MetaMask is not installed!');
  }
  
  try {
    const accounts = await window.ethereum.request({ method: 'eth_accounts' });
    return accounts[0] || null;
  } catch (error) {
    console.error('Error getting current account:', error);
    throw error;
  }
};

// Switch network
export const switchNetwork = async (networkName) => {
  if (!isMetaMaskInstalled()) {
    throw new Error('MetaMask is not installed!');
  }
  
  const network = NETWORKS[networkName.toUpperCase()];
  if (!network) {
    throw new Error(`Network ${networkName} not supported`);
  }
  
  try {
    // Try to switch to the network
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: network.chainId }],
    });
  } catch (switchError) {
    // This error code indicates that the chain has not been added to MetaMask
    if (switchError.code === 4902) {
      try {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainId: network.chainId,
              chainName: network.chainName,
              nativeCurrency: network.nativeCurrency,
              rpcUrls: network.rpcUrls,
              blockExplorerUrls: network.blockExplorerUrls,
            },
          ],
        });
      } catch (addError) {
        console.error('Error adding network:', addError);
        throw addError;
      }
    } else {
      console.error('Error switching network:', switchError);
      throw switchError;
    }
  }
};

// Get current network
export const getCurrentNetwork = async () => {
  if (!isMetaMaskInstalled()) {
    throw new Error('MetaMask is not installed!');
  }
  
  try {
    const chainId = await window.ethereum.request({ method: 'eth_chainId' });
    return chainId;
  } catch (error) {
    console.error('Error getting current network:', error);
    throw error;
  }
};

// Setup event listeners for account and network changes
export const setupEventListeners = (onAccountsChanged, onChainChanged) => {
  if (!isMetaMaskInstalled()) {
    throw new Error('MetaMask is not installed!');
  }
  
  // Listen for account changes
  if (onAccountsChanged) {
    window.ethereum.on('accountsChanged', onAccountsChanged);
  }
  
  // Listen for chain changes
  if (onChainChanged) {
    window.ethereum.on('chainChanged', onChainChanged);
  }
  
  // Return a cleanup function
  return () => {
    if (onAccountsChanged) {
      window.ethereum.removeListener('accountsChanged', onAccountsChanged);
    }
    if (onChainChanged) {
      window.ethereum.removeListener('chainChanged', onChainChanged);
    }
  };
};

// Get signer
export const getSigner = async () => {
  const provider = getProvider();
  return await provider.getSigner();
};

// Create contract instance
export const getContract = (contractAddress, contractABI) => {
  return async () => {
    const signer = await getSigner();
    return new ethers.Contract(contractAddress, contractABI, signer);
  };
}; 
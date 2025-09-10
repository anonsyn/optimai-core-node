// PancakeSwap API functions

const isWalletConnected = (): string => {
  return `
    (() => {
      try {
        const result = window.pancakeSwapApi.connector.isConnected();
        console.log('Wallet connection status:', result);
        return result;
      } catch (error) {
        console.error('Failed to check wallet connection:', error);
        throw error;
      }
    })()
  `
}

const connectWallet = (): string => {
  return `
    (async () => {
      try {
        const result = await window.pancakeSwapApi.connector.connect();
        console.log('Wallet connect result:', result);
        return result;
      } catch (error) {
        console.error('Failed to connect wallet:', error);
        throw error;
      }
    })()
  `
}

const swap = (params: {
  from: { token: string; address?: string }
  to: { token: string; address?: string }
  amount: string
}): string => {
  return `
    (async () => {
      try {
        const params = ${JSON.stringify(params)};
        const result = await window.pancakeSwapApi.exchanger.swap(params);
        console.log('Swap transaction completed:', result);
        return result;
      } catch (error) {
        console.error('Failed to execute swap:', error);
        throw error;
      }
    })()
  `
}

const pancakeSwapApi = {
  isWalletConnected,
  connectWallet,
  swap
}

export default pancakeSwapApi

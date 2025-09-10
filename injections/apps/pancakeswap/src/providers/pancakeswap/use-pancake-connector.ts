import { clickElement, sleep, waitForElement } from '@xagent/utils'
import { useCallback, useMemo } from 'react'

export const usePancakeConnector = () => {
  const findConnectButton = useCallback(() => {
    const buttons = document.querySelectorAll('button') as NodeListOf<HTMLButtonElement>
    const target = Array.from(buttons).find((btn) => {
      const buttonText = btn.textContent?.trim().toLowerCase()
      return buttonText?.includes('connect wallet')
    })
    return target
  }, [])

  const isConnected = useCallback(() => {
    const connectButton = findConnectButton()
    return !connectButton
  }, [findConnectButton])

  const connect = useCallback(async () => {
    if (isConnected()) {
      return true
    }

    const connectButton = findConnectButton() as HTMLButtonElement
    if (!connectButton) {
      throw new Error('Connect button not found')
    }

    clickElement(connectButton)

    const walletConnectButton = await waitForElement('[title="WalletConnect"]', 10000)
    if (!walletConnectButton) {
      throw new Error('WalletConnect button not found')
    }

    clickElement(walletConnectButton)
    await sleep(1000)

    if (isConnected()) {
      return true
    }

    const w3mModal = await waitForElement('w3m-modal', 10000)
    if (!w3mModal) {
      throw new Error('w3m-modal not found')
    }
    await sleep(1000)

    await new Promise((resolve) => {
      const observer = new MutationObserver((mutationsList) => {
        for (const mutation of mutationsList) {
          if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
            const isModalClosed = !w3mModal.className.includes('open')
            if (isModalClosed) {
              console.log('Wallet Connect is closed')
              sleep(1000).finally(() => {
                console.log('Connect result', isConnected())
                resolve(isConnected())
              })
            }
          }
        }
      })

      observer.observe(w3mModal, { attributes: true })
    })

    return isConnected()
  }, [isConnected, findConnectButton])

  return useMemo(
    () => ({
      isConnected,
      connect
    }),
    [isConnected, connect]
  )
}
import {
  clickElement,
  doubleFocus,
  getAllElementsWithOwnText,
  insertTextIntoElement,
  setReactInputValue,
  sleep,
  waitForElement
} from '@xagent/utils'
import { useCallback, useMemo } from 'react'
import { usePancakeConnector } from './use-pancake-connector'

export interface SwapParams {
  from: {
    token: string
    address?: string
  }
  to: {
    token: string
    address?: string
  }
  amount: string
}

export const usePancakeExchanger = () => {
  const connector = usePancakeConnector()

  const selectCurrency = useCallback(async (button: HTMLButtonElement, token: string) => {
    const selectedCurrencyPairElement = button.querySelector('#pair')

    if (selectedCurrencyPairElement) {
      const selectedCurrencyPair = selectedCurrencyPairElement.textContent
        ?.trim()
        .toLocaleLowerCase()
      if (selectedCurrencyPair === token.toLowerCase()) {
        console.log('Already select the token')
        return true
      }
    }

    clickElement(button)

    const tokenInput = await waitForElement('#token-search-input')
    if (!tokenInput) {
      throw new Error('Token input not found')
    }

    await insertTextIntoElement(tokenInput, token)
    await sleep(2000)

    const tokenItemElements = document.querySelectorAll('[class*="token-item-"]')

    const targetTokenItemElement = Array.from(tokenItemElements).find((element) => {
      const textElements = getAllElementsWithOwnText(element)
      return textElements.some((textElement) => {
        const text = textElement.textContent?.trim().toLowerCase() || ''
        return text === token.toLowerCase()
      })
    })

    if (!targetTokenItemElement) {
      throw new Error(`Token item for ${token} not found`)
    }

    clickElement(targetTokenItemElement)
    return true
  }, [])

  const swap = useCallback(
    async (params: SwapParams) => {
      const isConnected = connector.isConnected()
      if (!isConnected) {
        throw new Error('You need to connect wallet first')
      }

      const { from, to, amount } = params
      const fromToken = from.token
      const toToken = to.token

      const swapContainer = await waitForElement('#swap-page')
      if (!swapContainer) {
        throw new Error('Swap container not found')
      }

      const swapInputContainer = await waitForElement('#swap-currency-input')
      const swapOutputContainer = await waitForElement('#swap-currency-output')
      if (!swapInputContainer || !swapOutputContainer) {
        throw new Error('Swap input or output container not found')
      }

      const fromButton = swapInputContainer?.querySelector('.open-currency-select-button')
      const toButton = swapOutputContainer?.querySelector('.open-currency-select-button')
      const tokenAmountInput = swapContainer.querySelector('.token-amount-input') as HTMLInputElement

      if (!fromButton || !toButton) {
        throw new Error('Currency select button not found')
      }

      if (!tokenAmountInput) {
        throw new Error('Token amount input not found')
      }

      console.log('START SELECT FROM TOKEN')
      await selectCurrency(fromButton as HTMLButtonElement, fromToken)
      await sleep(5000)

      console.log('START SELECT TARGET TOKEN')
      await selectCurrency(toButton as HTMLButtonElement, toToken)
      await sleep(5000)

      await doubleFocus(tokenAmountInput)
      await sleep(500)
      setReactInputValue(tokenAmountInput, amount)
      await sleep(300)
      tokenAmountInput.blur()
      await sleep(500)
      await doubleFocus(tokenAmountInput)
      await sleep(3000)

      const swapButton = (await waitForElement('#swap-button, #confirm-swap-or-send')) as HTMLButtonElement

      if (!swapButton) {
        throw new Error('Swap button not found')
      }

      if (swapButton.disabled) {
        await sleep(3000)
        const isDisabled = swapButton.disabled
        if (isDisabled) {
          const error = swapButton.textContent || 'Something went wrong'
          throw new Error(error)
        }
      }

      clickElement(swapButton)
      await sleep(1000)

      const confirmSwapButton = (await waitForElement('#confirm-swap-button', 10000)) as HTMLButtonElement

      if (!confirmSwapButton) {
        throw new Error('Confirm swap button not found')
      }

      clickElement(confirmSwapButton)
      await sleep(1000)

      const resultDialog = await waitForElement('[role="dialog"]')

      if (!resultDialog) {
        throw new Error('Result dialog not found')
      }

      return new Promise((resolve, reject) => {
        const id = setTimeout(() => {
          observer.disconnect()
          reject(new Error('Transaction result not found'))
        }, 20000)

        const observer = new MutationObserver(() => {
          const statusElement = resultDialog.querySelector('.sc-1e14ff52-0.Yckvi')
          if (!statusElement) {
            // can happen when transaction get error
            const errorElement = resultDialog.querySelector('.sc-1e14ff52-0.bICjAm')
            if (errorElement) {
              const message = errorElement.textContent?.trim()
              if (message) {
                observer.disconnect()
                clearTimeout(id)
                reject(new Error(message))
                return
              }
            }
          }

          const txAnchor = statusElement?.nextSibling as HTMLAnchorElement

          if (txAnchor) {
            const url = txAnchor.href
            if (url) {
              clearTimeout(id)
              observer.disconnect()
              console.log({ url })
              resolve(url)
              return
            }
          }
        })

        observer.observe(resultDialog, { childList: true, subtree: true })
      })
    },
    [connector, selectCurrency]
  )

  return useMemo(
    () => ({
      swap
    }),
    [swap]
  )
}
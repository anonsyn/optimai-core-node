import { sleep } from './sleep'

/**
 * Wait for an element to appear in the DOM
 */
export const waitForElement = (selector: string, timeout = 5000): Promise<Element | null> => {
  return new Promise((resolve) => {
    const element = document.querySelector(selector)
    if (element) {
      resolve(element)
      return
    }

    const observer = new MutationObserver((_, obs) => {
      const element = document.querySelector(selector)
      if (element) {
        obs.disconnect()
        resolve(element)
      }
    })

    observer.observe(document.body, {
      childList: true,
      subtree: true
    })

    setTimeout(() => {
      observer.disconnect()
      resolve(null)
    }, timeout)
  })
}

/**
 * Wait for multiple selectors (any one matches)
 */
export const waitForAnyElement = (selectors: string[], timeout = 5000): Promise<Element | null> => {
  return new Promise((resolve) => {
    for (const selector of selectors) {
      const element = document.querySelector(selector)
      if (element) {
        resolve(element)
        return
      }
    }

    const observer = new MutationObserver((_, obs) => {
      for (const selector of selectors) {
        const element = document.querySelector(selector)
        if (element) {
          obs.disconnect()
          resolve(element)
        }
      }
    })

    observer.observe(document.body, {
      childList: true,
      subtree: true
    })

    setTimeout(() => {
      observer.disconnect()
      resolve(null)
    }, timeout)
  })
}

/**
 * Wait for an element to be removed from the DOM
 */
export const waitForElementRemoved = (selector: string, timeout = 5000): Promise<boolean> => {
  return new Promise((resolve) => {
    const element = document.querySelector(selector)
    if (!element) {
      resolve(true)
      return
    }

    const observer = new MutationObserver((_, obs) => {
      const element = document.querySelector(selector)
      if (!element) {
        obs.disconnect()
        resolve(true)
      }
    })

    observer.observe(document.body, {
      childList: true,
      subtree: true
    })

    setTimeout(() => {
      observer.disconnect()
      resolve(false)
    }, timeout)
  })
}

/**
 * Click an element safely
 */
export const clickElement = async (element: Element | null, delay = 100) => {
  if (!element) return false

  element.scrollIntoView({ behavior: 'smooth', block: 'center' })
  await sleep(delay)

  const clickEvent = new MouseEvent('click', {
    view: window,
    bubbles: true,
    cancelable: true
  })

  element.dispatchEvent(clickEvent)
  return true
}

/**
 * Get text content from an element
 */
export const getTextContent = (selector: string): string => {
  const element = document.querySelector(selector)
  return element?.textContent?.trim() || ''
}

/**
 * Focus handling for inputs
 */
export const doubleFocus = async (input: HTMLElement) => {
  input.focus()
  input.blur()
  await sleep(50)
  input.focus()
  if ('setSelectionRange' in input) {
    const inputElement = input as HTMLInputElement
    inputElement.setSelectionRange(inputElement.value.length, inputElement.value.length)
  }
}

/**
 * Insert text into elements (handles React components)
 */
export async function insertTextIntoElement(element: Element, text: string): Promise<boolean> {
  try {
    const _element = element as HTMLElement

    // Handle content-editable
    if (_element.isContentEditable) {
      _element.focus()
      await sleep(100)

      document.execCommand('selectAll', false)
      document.execCommand('delete', false)
      document.execCommand('insertText', false, text)

      const pasteEvent = new ClipboardEvent('paste', {
        bubbles: true,
        cancelable: true,
        clipboardData: new DataTransfer()
      })

      if (pasteEvent.clipboardData) {
        pasteEvent.clipboardData.setData('text/plain', text)
        element.dispatchEvent(pasteEvent)
      }

      _element.dispatchEvent(new Event('input', { bubbles: true }))
      return true
    }

    // Handle standard input/textarea
    if (_element instanceof HTMLInputElement || _element instanceof HTMLTextAreaElement) {
      await doubleFocus(_element)

      const prototype = Object.getPrototypeOf(_element)
      const nativeValueSetter = Object.getOwnPropertyDescriptor(prototype, 'value')?.set

      if (nativeValueSetter) {
        nativeValueSetter.call(_element, text)
      } else {
        _element.value = text
      }

      _element.dispatchEvent(new Event('input', { bubbles: true }))
      _element.dispatchEvent(new Event('change', { bubbles: true }))
      return true
    }

    // Fallback for other elements
    _element.focus()
    _element.textContent = text
    _element.dispatchEvent(new Event('input', { bubbles: true }))
    return true
  } catch (error) {
    console.error('Failed to insert text into element:', error)
    return false
  }
}

/**
 * Get all elements with text content
 */
export const getAllElementsWithOwnText = (root: Element): Element[] => {
  const result: Element[] = []
  const treeWalker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT, null)
  let currentNode: Node | null = treeWalker.currentNode

  while (currentNode) {
    if (currentNode instanceof Element) {
      const hasOwnText = Array.from(currentNode.childNodes).some(
        (node) => node.nodeType === Node.TEXT_NODE && node.textContent?.trim() !== ''
      )

      if (hasOwnText) {
        result.push(currentNode)
      }
    }

    currentNode = treeWalker.nextNode()
  }

  return result
}

/**
 * Simulate typing
 */
export const simulateTyping = async (input: HTMLInputElement, text: string, delay = 50) => {
  input.focus()
  input.value = ''

  for (let i = 0; i < text.length; i++) {
    input.value += text[i]

    const keyEvents = ['keydown', 'keypress', 'keyup'] as const
    for (const eventType of keyEvents) {
      input.dispatchEvent(
        new KeyboardEvent(eventType, {
          key: text[i],
          bubbles: true
        })
      )
    }

    input.dispatchEvent(new Event('input', { bubbles: true }))

    if (delay > 0) {
      await sleep(delay)
    }
  }

  input.dispatchEvent(new Event('change', { bubbles: true }))
}

/**
 * Set React input value
 */
export function setReactInputValue(input: HTMLInputElement, value: string | number) {
  const lastValue = input.value
  input.value = value as any

  const event = new Event('input', { bubbles: true })
  const tracker = (input as any)._valueTracker
  if (tracker) {
    tracker.setValue(lastValue)
  }

  input.dispatchEvent(event)
}

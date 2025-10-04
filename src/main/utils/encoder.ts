type Base64Mode = 'binary' | 'utf8' | 'utf16le'

type AnyTextEncoder = {
  new (): { encode(input?: string): Uint8Array }
}

type AnyTextDecoder = {
  new (): { decode(input?: Uint8Array): string }
}

function getTextEncoder(): { encode(input?: string): Uint8Array } | null {
  const Encoder = (globalThis as unknown as { TextEncoder?: AnyTextEncoder }).TextEncoder
  return Encoder ? new Encoder() : null
}

function getTextDecoder(): { decode(input?: Uint8Array): string } | null {
  const Decoder = (globalThis as unknown as { TextDecoder?: AnyTextDecoder }).TextDecoder
  return Decoder ? new Decoder() : null
}

function stringToBytes(value: string, mode: Base64Mode): Uint8Array {
  if (mode === 'binary') {
    const bytes = new Uint8Array(value.length)
    for (let i = 0; i < value.length; i++) {
      bytes[i] = value.charCodeAt(i) & 0xff
    }
    return bytes
  }

  if (mode === 'utf16le') {
    const bytes = new Uint8Array(value.length * 2)
    for (let i = 0; i < value.length; i++) {
      const code = value.charCodeAt(i)
      bytes[i * 2] = code & 0xff
      bytes[i * 2 + 1] = (code >> 8) & 0xff
    }
    return bytes
  }

  const encoder = getTextEncoder()
  if (encoder) {
    return encoder.encode(value)
  }

  if (typeof Buffer !== 'undefined') {
    return Uint8Array.from(Buffer.from(value, 'utf8'))
  }

  throw new Error('No UTF-8 encoder available in this environment')
}

function bytesToString(bytes: Uint8Array, mode: Base64Mode): string {
  if (mode === 'binary') {
    let result = ''
    for (const byte of bytes) {
      result += String.fromCharCode(byte)
    }
    return result
  }

  if (mode === 'utf16le') {
    if (bytes.length % 2 !== 0) {
      throw new Error('Invalid UTF-16LE byte array length')
    }
    let result = ''
    for (let i = 0; i < bytes.length; i += 2) {
      const code = bytes[i] | (bytes[i + 1] << 8)
      result += String.fromCharCode(code)
    }
    return result
  }

  const decoder = getTextDecoder()
  if (decoder) {
    return decoder.decode(bytes)
  }

  if (typeof Buffer !== 'undefined') {
    return Buffer.from(bytes).toString('utf8')
  }

  throw new Error('No UTF-8 decoder available in this environment')
}

function bytesToBase64(bytes: Uint8Array): string {
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(bytes).toString('base64')
  }

  const g = globalThis as { btoa?: (value: string) => string }
  if (typeof g.btoa === 'function') {
    let binary = ''
    for (const byte of bytes) {
      binary += String.fromCharCode(byte)
    }
    return g.btoa(binary)
  }

  throw new Error('No Base64 encoder available in this environment')
}

function base64ToBytes(value: string): Uint8Array {
  if (typeof Buffer !== 'undefined') {
    return Uint8Array.from(Buffer.from(value, 'base64'))
  }

  const g = globalThis as { atob?: (value: string) => string }
  if (typeof g.atob === 'function') {
    const binary = g.atob(value)
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i)
    }
    return bytes
  }

  throw new Error('No Base64 decoder available in this environment')
}

function base64Encode(value: string, mode: Base64Mode = 'utf8'): string {
  const bytes = stringToBytes(value, mode)
  return bytesToBase64(bytes)
}

function base64Decode(value: string, mode: Base64Mode = 'utf8'): string {
  const bytes = base64ToBytes(value)
  return bytesToString(bytes, mode)
}

function fibonacci(n: number): number {
  let a = 0
  let b = 1
  for (let i = 0; i < n; i++) {
    const next = a + b
    a = b
    b = next
  }
  return a % 20
}

function swapCharacters(str: string): string {
  const arr = str.split('')
  for (let i = 0; i < arr.length - 1; i += 2) {
    const temp = arr[i]
    arr[i] = arr[i + 1]
    arr[i + 1] = temp
  }
  return arr.join('')
}

function bitwiseTransform(str: string): string {
  return str
    .split('')
    .map((char, index) => String.fromCharCode(char.charCodeAt(0) ^ index % 256))
    .join('')
}

function shiftCharacters(str: string): string {
  return str
    .split('')
    .map((char, index) => String.fromCharCode(char.charCodeAt(0) + fibonacci(index)))
    .join('')
}

export function encode(input: string): string {
  const shifted = shiftCharacters(input)
  const bitwise = bitwiseTransform(shifted)
  const swapped = swapCharacters(bitwise)
  return base64Encode(swapped, 'utf16le')
}

export function decode(input: string): string {
  const padded = base64Decode(input).split('')
  const cleaned = padded.filter((_, index) => (index + 1) % 5 !== 0).join('')
  const reversed = cleaned.split('').reverse().join('')

  const key = 7
  const decoded = reversed
    .match(/.{1,2}/g)
    ?.map((hex, index) => String.fromCharCode(parseInt(hex, 16) ^ (key + index)))
    .join('')

  return decoded ?? ''
}

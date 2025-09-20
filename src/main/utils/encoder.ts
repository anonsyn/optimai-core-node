import crypto from 'crypto'

function encodeBase64(text: string): string {
  return Buffer.from(text, 'utf-8').toString('base64')
}

function decodeBase64(encoded: string): string {
  return Buffer.from(encoded, 'base64').toString('utf-8')
}

function randomPrintableChar(): string {
  try {
    return String.fromCharCode(crypto.randomInt(33, 127))
  } catch {
    return String.fromCharCode(33 + Math.floor(Math.random() * 94))
  }
}

export function encode(input: string): string {
  const shifted = input
    .split('')
    .map((char, index) => String.fromCharCode(char.charCodeAt(0) + index * 3))
    .join('')

  const swapped = shifted.split('')
  for (let i = 0; i < swapped.length - 1; i += 2) {
    ;[swapped[i], swapped[i + 1]] = [swapped[i + 1], swapped[i]]
  }

  const reversed = swapped.reverse().join('')

  const noisy = reversed
    .split('')
    .reduce<string[]>((acc, char, index) => {
      acc.push(char)
      if ((index + 1) % 3 === 0) {
        acc.push(randomPrintableChar())
      }
      return acc
    }, [])
    .join('')

  return encodeBase64(noisy)
}

export function decode(input: string): string {
  const padded = decodeBase64(input).split('')
  const cleaned = padded.filter((_, index) => (index + 1) % 5 !== 0).join('')
  const reversed = cleaned.split('').reverse().join('')

  const key = 7
  const decoded = reversed
    .match(/.{1,2}/g)
    ?.map((hex, index) => String.fromCharCode(parseInt(hex, 16) ^ (key + index)))
    .join('')

  return decoded ?? ''
}

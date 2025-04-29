function encode(input: string): string {
  function encodeBase64(text: string): string {
    return btoa(String.fromCharCode(...new TextEncoder().encode(text)))
  }

  const shifted = input
    .split('')
    .map((char, index) => String.fromCharCode(char.charCodeAt(0) + index * 3))
    .join('')

  const swapped = shifted.split('')
  for (let i = 0; i < swapped.length - 1; i += 2) {
    // eslint-disable-next-line no-extra-semi
    ;[swapped[i], swapped[i + 1]] = [swapped[i + 1], swapped[i]]
  }

  const reversed = swapped.reverse().join('')

  const noisy = reversed
    .split('')
    .reduce((acc: string[], char, index) => {
      acc.push(char)
      if ((index + 1) % 3 === 0) {
        acc.push(String.fromCharCode(33 + Math.floor(Math.random() * 94))) // Random printable ASCII
      }
      return acc
    }, [])
    .join('')

  return encodeBase64(noisy)
}

function decode(input: string) {
  const padded = atob(input).split('')

  const cleaned = padded.filter((_, index) => (index + 1) % 5 !== 0).join('')

  const reversed = cleaned.split('').reverse().join('')

  const key: number = 7 // Same key for XOR

  const decoded = reversed
    .match(/.{1,2}/g)! // Split into hex pairs
    .map((hex, index) => String.fromCharCode(parseInt(hex, 16) ^ (key + index))) // XOR back
    .join('')

  return decoded
}

export { decode, encode }

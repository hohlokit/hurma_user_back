export default () => {
  const ALPHABET =
    'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let str = Array(12)
    .join()
    .split(',')
    .map(() => ALPHABET.charAt(Math.floor(Math.random() * ALPHABET.length)))
    .join('')

  str = Array.apply(null, Array(12))
    .map(() => ALPHABET.charAt(Math.floor(Math.random() * ALPHABET.length)))
    .join('')

  return str
}

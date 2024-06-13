export function uuidToNumber(uuid: string) {
  let hash = 0;
  for (let i = 0; i < uuid.length; i += 1) {
    const character = uuid.charCodeAt(i);
    // eslint-disable-next-line no-bitwise
    hash = (hash << 5) - hash + character;
    // eslint-disable-next-line no-bitwise
    hash &= hash; // Convert to 32bit integer
  }
  return hash;
}

import { v4 as uuidv4, v4 } from "uuid";
import seedrandom from "seedrandom";

/**
 * Generate a UUID v4 with an optional seed.
 * @param {string | undefined} seed - Optional seed value, can be a UUID.
 * @returns {string} - Generated UUID v4.
 */
export function v4s(seed?: string): string {
  if (!seed) {
    // If no seed is provided, use the default RNG
    return uuidv4();
  }

  // Create a seeded RNG
  const rng = seedrandom(seed);

  // Custom random number generator function using the seeded RNG
  const customRNG = () => {
    const randomBytes = new Uint8Array(16);

    // Fill the array with random bytes using the seeded RNG
    for (let i = 0; i < randomBytes.length; i++) {
      randomBytes[i] = Math.floor(rng() * 256);
    }

    return randomBytes;
  };

  // Generate a UUID using the custom RNG
  return v4({ random: customRNG() });
}

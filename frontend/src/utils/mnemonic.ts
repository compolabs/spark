import { Mnemonic } from "@fuel-ts/mnemonic";

export function isValidMnemonic(phrase: string): boolean {
  const words = phrase.split(" ");
  const mnemonic = new Mnemonic();
  return (
    words.filter((w) => mnemonic.wordlist.includes(w)).length === Number(12)
  );
}

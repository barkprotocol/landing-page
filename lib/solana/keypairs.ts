import { Keypair } from '@solana/web3.js';
import * as bip39 from 'bip39';
import { derivePath } from 'ed25519-hd-key';

export function generateMnemonic(): string {
  return bip39.generateMnemonic();
}

export function mnemonicToSeed(mnemonic: string): Buffer {
  return bip39.mnemonicToSeedSync(mnemonic);
}

export function seedToKeypair(seed: Buffer, derivationPath: string = "m/44'/501'/0'/0'"): Keypair {
  const derivedSeed = derivePath(derivationPath, seed.toString('hex')).key;
  return Keypair.fromSeed(derivedSeed);
}

export function mnemonicToKeypair(mnemonic: string, derivationPath: string = "m/44'/501'/0'/0'"): Keypair {
  const seed = mnemonicToSeed(mnemonic);
  return seedToKeypair(seed, derivationPath);
}

export function generateKeypair(): Keypair {
  return Keypair.generate();
}

export function keypairToString(keypair: Keypair): string {
  return JSON.stringify(Array.from(keypair.secretKey));
}

export function stringToKeypair(keypairString: string): Keypair {
  const secretKey = new Uint8Array(JSON.parse(keypairString));
  return Keypair.fromSecretKey(secretKey);
}

export function publicKeyToString(keypair: Keypair): string {
  return keypair.publicKey.toBase58();
}

export function validateMnemonic(mnemonic: string): boolean {
  return bip39.validateMnemonic(mnemonic);
}
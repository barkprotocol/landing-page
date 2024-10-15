import { Keypair } from '@solana/web3.js';
import fs from 'fs';
import path from 'path';
import * as crypto from 'crypto';

// Define the path to store keypairs securely
const KEYPAIR_PATH = path.join(process.cwd(), 'keys'); // Adjust the path as needed
const KEYPAIR_FILE = 'user-keypair.json';

// Function to generate a new keypair
export function generateKeypair(): Keypair {
  const keypair = Keypair.generate();
  saveKeypair(keypair);
  return keypair;
}

// Function to save the keypair to a file securely
export function saveKeypair(keypair: Keypair) {
  if (!fs.existsSync(KEYPAIR_PATH)) {
    fs.mkdirSync(KEYPAIR_PATH, { recursive: true });
  }

  // Encrypt the keypair before saving
  const encryptedKeypair = encryptKeypair(keypair.secretKey);
  fs.writeFileSync(path.join(KEYPAIR_PATH, KEYPAIR_FILE), JSON.stringify(encryptedKeypair));
}

// Function to encrypt the keypair
function encryptKeypair(secretKey: Uint8Array): string {
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(process.env.ENCRYPTION_KEY, 'hex'), Buffer.from(process.env.IV, 'hex'));
  let encrypted = cipher.update(secretKey);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return encrypted.toString('hex');
}

// Function to retrieve the keypair from the file
export function getKeypair(userId: string): Keypair | null {
  try {
    const data = fs.readFileSync(path.join(KEYPAIR_PATH, KEYPAIR_FILE), 'utf-8');
    const encryptedKeypair = JSON.parse(data);

    // Decrypt the keypair
    const decryptedKeypair = decryptKeypair(encryptedKeypair);
    return Keypair.fromSecretKey(decryptedKeypair);
  } catch (error) {
    console.error('Error retrieving keypair:', error);
    return null;
  }
}

// Function to decrypt the keypair
function decryptKeypair(encryptedSecretKey: string): Uint8Array {
  const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(process.env.ENCRYPTION_KEY, 'hex'), Buffer.from(process.env.IV, 'hex'));
  let decrypted = decipher.update(Buffer.from(encryptedSecretKey, 'hex'));
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted;
}

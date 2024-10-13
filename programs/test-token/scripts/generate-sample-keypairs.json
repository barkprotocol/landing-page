import { Keypair } from '@solana/web3.js';
import fs from 'fs';
import path from 'path';

// Function to generate a specified number of keypairs
function generateKeypairs(count: number): Keypair[] {
  const keypairs: Keypair[] = [];
  for (let i = 0; i < count; i++) {
    keypairs.push(Keypair.generate());
  }
  return keypairs;
}

// Function to save keypairs to a file
function saveKeypairsToFile(keypairs: Keypair[], filename: string): void {
  const keypairData = keypairs.map((keypair, index) => ({
    index,
    publicKey: keypair.publicKey.toBase58(),
    secretKey: Buffer.from(keypair.secretKey).toString('base64'),
  }));

  const jsonData = JSON.stringify(keypairData, null, 2);
  const filePath = path.join(__dirname, '..', 'keypairs', filename);

  fs.writeFileSync(filePath, jsonData, 'utf-8');
  console.log(`Keypairs saved to ${filePath}`);
}

// Main function to generate and save keypairs
function main() {
  const keypairCount = 5; // Change this number to generate more or fewer keypairs
  const filename = 'milton_keypairs.json';

  console.log(`Generating ${keypairCount} keypairs...`);
  const keypairs = generateKeypairs(keypairCount);

  console.log('Saving keypairs to file...');
  saveKeypairsToFile(keypairs, filename);

  console.log('Keypair generation complete.');
  console.log('WARNING: Keep the generated file secure and do not share it publicly.');
}

// Run the main function
main();
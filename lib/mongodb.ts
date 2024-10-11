// lib/mongodb.ts
import { MongoClient, Db } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'your-mongodb-connection-string';
const MONGODB_DB = process.env.MONGODB_DB || 'your-database-name';

// Validate environment variables
if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

if (!MONGODB_DB) {
  throw new Error('Please define the MONGODB_DB environment variable inside .env.local');
}

// Caching variables for client and database
let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

/**
 * Connect to the MongoDB database
 * @returns {Promise<{ client: MongoClient, db: Db }>} The MongoDB client and database
 */
export async function connectToDatabase() {
  // Check if we have a cached client and database
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  // Create a new MongoClient
  const client = new MongoClient(MONGODB_URI);

  // Connect to the client
  await client.connect();

  // Select the database
  const db = client.db(MONGODB_DB);

  // Cache the client and database for future use
  cachedClient = client;
  cachedDb = db;

  return { client, db };
}

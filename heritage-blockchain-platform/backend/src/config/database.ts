import 'reflect-metadata';
import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { DataSource } from 'typeorm';
// import { User } from '../models/user.model.js';
// import { Organization } from '../models/organization.model.js';
// import { Heritage } from '../models/heritage.model.js';
// import { HeritageVersion } from '../models/heritage-version.model.js';
// import { BlockchainRecord } from '../models/blockchain-record.model.js';
// import { Verification } from '../models/verification.model.js';

const currentFile = fileURLToPath(import.meta.url);
const currentDir = path.dirname(currentFile);
const backendRoot = path.resolve(currentDir, '../..');

dotenv.config({ path: path.join(backendRoot, '.env') });

export const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST ?? 'localhost',
  port: Number(process.env.DB_PORT ?? 3306),
  username: process.env.DB_USER ?? 'root',
  password: process.env.DB_USER_PASSWORD ?? '',
  database: process.env.DB_NAME ?? 'heritage_blockchain',
  entities: ["src/**/*.model.ts"],
  synchronize: true,
  logging: process.env.DB_LOGGING === 'true',
  migrations: ['src/migrations/*.ts'],
  ssl: {
    rejectUnauthorized: true
  }
});

export async function initializeDatabase() {
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
  }
}

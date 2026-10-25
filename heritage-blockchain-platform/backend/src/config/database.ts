import 'reflect-metadata';
import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { DataSource } from 'typeorm';

const currentFile = fileURLToPath(import.meta.url);
const currentDir = path.dirname(currentFile);
const backendRoot = path.resolve(currentDir, '../..');

// Chạy từ dist/ thì đuôi là js, chạy bằng tsx từ src/ thì là ts
const ext = path.extname(currentFile) === '.ts' ? 'ts' : 'js';

// currentDir = .../src/config hoặc .../dist/config -> lùi 1 cấp là src hoặc dist
const baseDir = path.resolve(currentDir, '..');

dotenv.config({ path: path.join(backendRoot, '.env') });

export const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST ?? 'localhost',
  port: Number(process.env.DB_PORT ?? 3306),
  username: process.env.DB_USER ?? 'root',
  password: process.env.DB_USER_PASSWORD ?? '',
  database: process.env.DB_NAME ?? 'heritage_blockchain',
  entities: [path.join(baseDir, '**', `*.model.${ext}`)],
  migrations: [path.join(baseDir, 'migrations', `*.${ext}`)],
  synchronize: true,
  logging: process.env.DB_LOGGING === 'true',
  ssl: {
    rejectUnauthorized: true
  }
});

export async function initializeDatabase() {
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
  }
}

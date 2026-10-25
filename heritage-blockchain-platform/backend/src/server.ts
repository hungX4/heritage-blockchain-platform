import 'reflect-metadata';
import dotenv from 'dotenv';
import { app } from './app.js';
import { initializeDatabase } from './config/database.js';
import './models/index.js';

dotenv.config();

const port = Number(process.env.PORT ?? 3000);

async function bootstrap() {
  await initializeDatabase();

  app.listen(port, '0.0.0.0', () => {
    console.log(`Heritage Blockchain API is running on port ${port}`);
  });
}

bootstrap().catch((error) => {
  console.error('Failed to start Heritage Blockchain API', error);
  process.exit(1);
});

import { Router } from 'express';
import { blockchainRouter } from './blockchain.routes.js';
import { healthRouter } from './health.routes.js';
import { heritageVersionRouter } from './heritage-version.routes.js';
import { heritageRouter } from './heritage.routes.js';
import { verificationRouter } from './verification.routes.js';
import { authRouter } from './auth.routes.js';

export const apiRouter = Router();

apiRouter.use('/health', healthRouter);
apiRouter.use('/heritages', heritageRouter);
apiRouter.use('/heritage-versions', heritageVersionRouter);
apiRouter.use('/verifications', verificationRouter);
apiRouter.use('/blockchain-records', blockchainRouter);
apiRouter.use('/auth', authRouter);

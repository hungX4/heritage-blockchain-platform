import { Router } from 'express';
import { blockchainRouter } from './blockchain.routes.js';
import { healthRouter } from './health.routes.js';
import { heritageRouter } from './heritage.routes.js';
import { authRouter } from './auth.routes.js';
import organizationRoute from './organization.routes.js';
import verificationRoute from './verification.routes.js';
import uploadRouter from './upload.routes.js';
import heritageFieldRoutes from './heritage-field.routes.js';
import specializationRoutes from './specialization.routes.js';
import matrixMappingRoutes from './heritage-field-specialization.routes.js';
import expertRoutes from './expert.routes.js';
import userRoutes from './user.routes.js'
import versionRoute from './heritage-version.route.js'
import integrityRoute from './heritage-integriry.routes.js'

export const apiRouter = Router();

apiRouter.use('/health', healthRouter);
apiRouter.use('/heritages', heritageRouter);
apiRouter.use('/verifications', verificationRoute);
apiRouter.use('/blockchain-records', blockchainRouter);
apiRouter.use('/auth', authRouter);
apiRouter.use('/organization', organizationRoute);
apiRouter.use('/upload', uploadRouter);
apiRouter.use('/heritage-fields', heritageFieldRoutes);
apiRouter.use('/specializations', specializationRoutes);
apiRouter.use('/heritage-field-specializations', matrixMappingRoutes);
apiRouter.use('/experts', expertRoutes);
apiRouter.use('/users', userRoutes);
apiRouter.use('/version', versionRoute);
apiRouter.use('/integrity', integrityRoute);



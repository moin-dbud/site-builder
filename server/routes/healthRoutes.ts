import express from 'express';
import { getHealthCheck } from '../controllers/healthController.js';

const healthRouter = express.Router();

healthRouter.get('/', getHealthCheck);

export default healthRouter;

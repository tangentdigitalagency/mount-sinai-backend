import type { Application } from 'express';
import { Router } from 'express';
import { exampleRoutes } from './example.routes';

const router = Router();

// API info endpoint
router.get('/api', (_req, res) => {
  res.json({
    success: true,
    message: 'Mount Sinai Backend API',
    version: '1.0.0',
    documentation: '/api/docs',
  });
});

export const configureRoutes = (app: Application): void => {
  app.use('/', router);
  
  // Register route modules
  app.use('/api/example', exampleRoutes);
  
  // Add your route modules here
  // Example:
  // app.use('/api/users', userRoutes);
  // app.use('/api/patients', patientRoutes);
};


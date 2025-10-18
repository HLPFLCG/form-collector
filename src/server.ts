import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import { initializeDatabase } from './config/database';
import { AdminUserModel } from './models/AdminUser';
import submissionsRouter from './routes/submissions';
import adminRouter from './routes/admin';
import emailService from './services/emailService';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize database
initializeDatabase();

// Create default admin user if none exists
(async () => {
  const adminCount = AdminUserModel.count();
  if (adminCount === 0) {
    const defaultEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
    const defaultPassword = process.env.ADMIN_PASSWORD || 'changeme123';
    await AdminUserModel.create(defaultEmail, defaultPassword);
    console.log(`✅ Default admin user created: ${defaultEmail}`);
    console.log(`⚠️  Please change the default password immediately!`);
  }
})();

// Test email service
emailService.testConnection();

// Middleware
app.use(helmet({
  contentSecurityPolicy: false, // Allow inline scripts for admin dashboard
}));

// CORS configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['*'];
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  })
);

app.use(morgan('combined'));
app.use(express.json({ limit: process.env.MAX_SUBMISSION_SIZE || '10mb' }));
app.use(express.urlencoded({ extended: true, limit: process.env.MAX_SUBMISSION_SIZE || '10mb' }));

// Serve static files
app.use(express.static(path.join(__dirname, '../public')));

// Routes
app.use('/api', submissionsRouter);
app.use('/api/admin', adminRouter);

// Serve admin dashboard
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/admin.html'));
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'Custom Form Collector',
    version: '1.0.0',
    endpoints: {
      submit: '/api/submit/:apiKey',
      admin: '/admin',
      health: '/health',
    },
  });
});

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║         🚀 Form Collector Server Running                 ║
║                                                           ║
║         Port: ${PORT}                                    ║
║         Environment: ${process.env.NODE_ENV || 'development'}              ║
║         Admin Dashboard: http://localhost:${PORT}/admin     ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
  `);
});

export default app;
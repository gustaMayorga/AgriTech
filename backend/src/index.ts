import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import morgan from 'morgan';
import authRoutes from './routes/authRoutes';
import farmRoutes from './routes/farmRoutes';
import loanRoutes from './routes/loanRoutes';
import initDatabase from './config/initDb';

// Load environment variables
dotenv.config();

// Initialize database
initDatabase();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/farms', farmRoutes);
app.use('/api/loans', loanRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'AgroCredit API is running' });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`🚀 AgroCredit API running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
});

export default app;

// IDSS Backend - Main server entry point
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { runAnalysis } from './services/analysisService.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'IDSS Backend',
    timestamp: new Date().toISOString() 
  });
});

// Main analysis endpoint (called by n8n webhook)
app.post('/run-analysis', async (req, res) => {
  const startTime = Date.now();
  
  try {
    // Optional: Accept data directory path from request
    const dataDir = req.body.dataDir || '../';
    
    // Run the analysis
    const result = await runAnalysis(dataDir);
    
    const duration = Date.now() - startTime;
    
    // Log analysis completion
    console.log(`[${result.trace_id}] Analysis completed in ${duration}ms`);
    
    res.json({
      success: true,
      ...result,
      performance: {
        duration_ms: duration,
      },
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    console.error(`[${Date.now()}] Analysis failed:`, errorMessage);
    
    res.status(500).json({
      success: false,
      error: errorMessage,
      trace_id: `error-${Date.now()}`,
      performance: {
        duration_ms: duration,
      },
    });
  }
});

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`IDSS Backend server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`Analysis endpoint: http://localhost:${PORT}/run-analysis`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  
  // Validate required environment variables
  if (!process.env.OPENAI_API_KEY) {
    console.warn('⚠️  WARNING: OPENAI_API_KEY not set. OpenAI features will not work.');
    console.warn('   Create a .env file in the backend directory with: OPENAI_API_KEY=your-key');
  } else {
    console.log('✅ OpenAI API key configured');
  }
});

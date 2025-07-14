export const config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),
  jwtSecret: process.env.JWT_SECRET || 'your-super-secret-key',
  corsOrigins: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:5173'],
  openaiApiKey: process.env.OPENAI_API_KEY || '',
  database: {
    url: process.env.DATABASE_URL || 'file:./dev.db',
  },
} as const;
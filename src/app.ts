import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import rateLimit from '@fastify/rate-limit';
import swagger from '@fastify/swagger';
import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox';
import { PrismaClient } from '@prisma/client';

import { dreamRoutes } from './routes/dreams.js';
import { userRoutes } from './routes/users.js';
import { authRoutes } from './routes/auth.js';
import { errorHandler } from './middleware/errorHandler.js';
import { authenticate } from './middleware/authenticate.js';
import { config } from './config/index.js';

declare module 'fastify' {
  interface FastifyInstance {
    prisma: PrismaClient;
    authenticate: typeof authenticate;
  }
}

export async function buildServer() {
  const fastify = Fastify({
    logger: {
      transport: {
        target: 'pino-pretty',
      },
    },
  }).withTypeProvider<TypeBoxTypeProvider>();

  // Initialize Prisma
  const prisma = new PrismaClient();
  await prisma.$connect();

  // Add prisma to fastify instance
  fastify.decorate('prisma', prisma);

  // Register plugins
  await fastify.register(cors, {
    origin: config.corsOrigins,
    credentials: true,
  });

  await fastify.register(jwt, {
    secret: config.jwtSecret,
  });

  await fastify.register(rateLimit, {
    max: 100,
    timeWindow: '1 minute',
  });

  await fastify.register(swagger, {
    openapi: {
      info: {
        title: 'Dream Cinema API',
        description: 'API for transforming dreams into animated films',
        version: '1.0.0',
      },
    },
  });

  // Register error handler
  fastify.setErrorHandler(errorHandler);

  // Register authentication decorator
  fastify.decorate('authenticate', authenticate);

  // Register routes
  await fastify.register(authRoutes, { prefix: '/auth' });
  await fastify.register(userRoutes, { prefix: '/users' });
  await fastify.register(dreamRoutes, { prefix: '/dreams' });

  // Cleanup hook
  fastify.addHook('onClose', async () => {
    await prisma.$disconnect();
  });

  return fastify;
}
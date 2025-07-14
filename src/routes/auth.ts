import { FastifyPluginAsync } from 'fastify';
import { Type } from '@sinclair/typebox';
import { signUp, signIn } from '../controllers/auth.js';

export const authRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.post('/signup', {
    schema: {
      body: Type.Object({
        email: Type.String({ format: 'email' }),
        password: Type.String({ minLength: 6 }),
        name: Type.Optional(Type.String()),
      }),
    },
  }, signUp);

  fastify.post('/signin', {
    schema: {
      body: Type.Object({
        email: Type.String({ format: 'email' }),
        password: Type.String(),
      }),
    },
  }, signIn);
};
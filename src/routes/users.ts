import { FastifyPluginAsync } from 'fastify';
import { Type } from '@sinclair/typebox';

export const userRoutes: FastifyPluginAsync = async (fastify) => {
  // Get current user profile
  fastify.get(
    '/me',
    {
      schema: {
        response: {
          200: Type.Object({
            id: Type.String(),
            email: Type.String(),
            name: Type.Optional(Type.String()),
          }),
        },
      },
      onRequest: [fastify.authenticate],
    },
    async (request) => {
      const user = await fastify.prisma.user.findUnique({
        where: { id: request.user.id },
        select: {
          id: true,
          email: true,
          name: true,
        },
      });
      return user;
    }
  );

  // Update user profile
  fastify.patch(
    '/me',
    {
      schema: {
        body: Type.Object({
          name: Type.Optional(Type.String()),
        }),
        response: {
          200: Type.Object({
            id: Type.String(),
            email: Type.String(),
            name: Type.Optional(Type.String()),
          }),
        },
      },
      onRequest: [fastify.authenticate],
    },
    async (request) => {
      const user = await fastify.prisma.user.update({
        where: { id: request.user.id },
        data: request.body,
        select: {
          id: true,
          email: true,
          name: true,
        },
      });
      return user;
    }
  );
};
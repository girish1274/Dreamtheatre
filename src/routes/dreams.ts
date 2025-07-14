import { FastifyPluginAsync } from 'fastify';
import { Type } from '@sinclair/typebox';
import { createDream, getDream, listDreams, updateDream, deleteDream } from '../controllers/dreams.js';
import { DreamSchema, CreateDreamSchema, UpdateDreamSchema } from '../schemas/dreams.js';

export const dreamRoutes: FastifyPluginAsync = async (fastify) => {
  // Create dream
  fastify.post(
    '/',
    {
      schema: {
        body: CreateDreamSchema,
        response: {
          201: DreamSchema,
        },
      },
      onRequest: [fastify.authenticate],
    },
    createDream
  );

  // Get dream by ID
  fastify.get(
    '/:id',
    {
      schema: {
        params: Type.Object({
          id: Type.String(),
        }),
        response: {
          200: DreamSchema,
        },
      },
      onRequest: [fastify.authenticate],
    },
    getDream
  );

  // List dreams
  fastify.get(
    '/',
    {
      schema: {
        querystring: Type.Object({
          page: Type.Optional(Type.Number()),
          limit: Type.Optional(Type.Number()),
        }),
        response: {
          200: Type.Array(DreamSchema),
        },
      },
      onRequest: [fastify.authenticate],
    },
    listDreams
  );

  // Update dream
  fastify.patch(
    '/:id',
    {
      schema: {
        params: Type.Object({
          id: Type.String(),
        }),
        body: UpdateDreamSchema,
        response: {
          200: DreamSchema,
        },
      },
      onRequest: [fastify.authenticate],
    },
    updateDream
  );

  // Delete dream
  fastify.delete(
    '/:id',
    {
      schema: {
        params: Type.Object({
          id: Type.String(),
        }),
      },
      onRequest: [fastify.authenticate],
    },
    deleteDream
  );
};
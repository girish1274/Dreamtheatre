import { FastifyReply, FastifyRequest } from 'fastify';
import { DreamService } from '../services/dreams.js';
import { CreateDreamInput, UpdateDreamInput } from '../schemas/dreams.js';

const dreamService = new DreamService();

export async function createDream(
  request: FastifyRequest<{ Body: CreateDreamInput }>,
  reply: FastifyReply
) {
  const userId = request.user.id;
  const dream = await dreamService.createDream(userId, request.body);
  return reply.code(201).send(dream);
}

export async function getDream(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) {
  const dream = await dreamService.getDream(request.params.id);
  return reply.send(dream);
}

export async function listDreams(
  request: FastifyRequest<{ Querystring: { page?: number; limit?: number } }>,
  reply: FastifyReply
) {
  const userId = request.user.id;
  const { page = 1, limit = 10 } = request.query;
  const dreams = await dreamService.listDreams(userId, { page, limit });
  return reply.send(dreams);
}

export async function updateDream(
  request: FastifyRequest<{ Params: { id: string }; Body: UpdateDreamInput }>,
  reply: FastifyReply
) {
  const dream = await dreamService.updateDream(request.params.id, request.body);
  return reply.send(dream);
}

export async function deleteDream(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) {
  await dreamService.deleteDream(request.params.id);
  return reply.code(204).send();
}
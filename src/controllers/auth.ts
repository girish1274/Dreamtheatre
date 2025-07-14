import { FastifyReply, FastifyRequest } from 'fastify';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

export async function signUp(
  request: FastifyRequest<{
    Body: { email: string; password: string; name?: string };
  }>,
  reply: FastifyReply
) {
  const { email, password, name } = request.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
      },
    });

    const token = await reply.jwtSign({ id: user.id });

    return reply.code(201).send({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    if (error.code === 'P2002') {
      return reply.code(400).send({
        error: 'Email already exists',
      });
    }
    throw error;
  }
}

export async function signIn(
  request: FastifyRequest<{
    Body: { email: string; password: string };
  }>,
  reply: FastifyReply
) {
  const { email, password } = request.body;

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    return reply.code(401).send({
      error: 'Invalid credentials',
    });
  }

  const validPassword = await bcrypt.compare(password, user.password);

  if (!validPassword) {
    return reply.code(401).send({
      error: 'Invalid credentials',
    });
  }

  const token = await reply.jwtSign({ id: user.id });

  return reply.send({
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
    },
  });
}
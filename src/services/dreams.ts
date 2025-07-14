import { PrismaClient } from '@prisma/client';
import { OpenAI } from 'openai';
import { config } from '../config/index.js';
import { CreateDreamInput, UpdateDreamInput } from '../schemas/dreams.js';
import { DreamAnalyzer } from '../utils/dreamAnalyzer.js';
import { AnimationGenerator } from '../utils/animationGenerator.js';

const prisma = new PrismaClient();
const openai = new OpenAI({ apiKey: config.openaiApiKey });
const dreamAnalyzer = new DreamAnalyzer(openai);
const animationGenerator = new AnimationGenerator(openai);

export class DreamService {
  async createDream(userId: string, input: CreateDreamInput) {
    // Analyze dream content
    const analysis = await dreamAnalyzer.analyze(input.content);
    
    // Generate animation
    const animation = await animationGenerator.generate(analysis, input.style);
    
    // Save dream to database
    const dream = await prisma.dream.create({
      data: {
        userId,
        content: input.content,
        title: input.title,
        emotions: input.emotions,
        keywords: input.keywords,
        style: input.style,
        analysis,
        animation,
      },
    });
    
    return dream;
  }

  async getDream(id: string) {
    const dream = await prisma.dream.findUnique({
      where: { id },
    });
    
    if (!dream) {
      throw new Error('Dream not found');
    }
    
    return dream;
  }

  async listDreams(userId: string, { page, limit }: { page: number; limit: number }) {
    const dreams = await prisma.dream.findMany({
      where: { userId },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
    });
    
    return dreams;
  }

  async updateDream(id: string, input: UpdateDreamInput) {
    const dream = await prisma.dream.update({
      where: { id },
      data: input,
    });
    
    return dream;
  }

  async deleteDream(id: string) {
    await prisma.dream.delete({
      where: { id },
    });
  }
}
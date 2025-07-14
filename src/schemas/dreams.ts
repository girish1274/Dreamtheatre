import { Type } from '@sinclair/typebox';

export const DreamSchema = Type.Object({
  id: Type.String(),
  userId: Type.String(),
  title: Type.String(),
  content: Type.String(),
  emotions: Type.Array(Type.String()),
  keywords: Type.Array(Type.String()),
  style: Type.Union([
    Type.Literal('watercolor'),
    Type.Literal('claymation'),
    Type.Literal('cyberpunk'),
    Type.Literal('hand-drawn'),
  ]),
  analysis: Type.Object({
    elements: Type.Array(Type.Object({
      type: Type.String(),
      value: Type.String(),
      prominence: Type.Number(),
    })),
    dominantThemes: Type.Array(Type.String()),
    suggestedPalette: Type.Array(Type.String()),
    moodScore: Type.Number(),
  }),
  animation: Type.Object({
    frames: Type.Array(Type.Any()),
    style: Type.String(),
    duration: Type.Number(),
  }),
  isPublic: Type.Boolean(),
  createdAt: Type.String(),
  updatedAt: Type.String(),
});

export const CreateDreamSchema = Type.Object({
  title: Type.String(),
  content: Type.String(),
  emotions: Type.Array(Type.String()),
  keywords: Type.Array(Type.String()),
  style: Type.Union([
    Type.Literal('watercolor'),
    Type.Literal('claymation'),
    Type.Literal('cyberpunk'),
    Type.Literal('hand-drawn'),
  ]),
});

export const UpdateDreamSchema = Type.Partial(CreateDreamSchema);

export type CreateDreamInput = typeof CreateDreamSchema.static;
export type UpdateDreamInput = typeof UpdateDreamSchema.static;
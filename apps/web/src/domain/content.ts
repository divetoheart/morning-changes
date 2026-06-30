import { z } from 'zod';

export const accessSchema = z.enum(['free', 'premium']);
export const skillLevelSchema = z.enum(['Beginner', 'Intermediate', 'Advanced']);

export const intervalSchema = z.enum(['1', 'b2', '2', '#2', 'b3', '3', '4', '#4', 'b5', '5', '#5', 'b6', '6', 'bb7', 'b7', '7']);
export const modeSchema = z.enum(['major', 'natural-minor', 'harmonic-minor']);

export const routineStepSchema = z.object({
  minutes: z.number().int().positive(),
  instruction: z.string().min(1)
});

export const harmonyExampleSchema = z.object({
  label: z.string().min(1),
  function: z.string().min(1),
  quality: z.enum(['maj7', 'm7', '7', 'm7b5', 'm', 'maj', 'dim']),
  rootDegree: intervalSchema,
  intervals: z.array(intervalSchema).min(1)
});

export const lessonSchema = z.object({
  id: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  title: z.string().min(4),
  level: skillLevelSchema,
  category: z.string().min(2),
  access: accessSchema,
  durationMinutes: z.number().int().min(3).max(60),
  outcome: z.string().min(12),
  dailyEligible: z.boolean(),
  pathIds: z.array(z.string()),
  keyMode: modeSchema.default('major'),
  defaultKeyStrategy: z.literal('random').default('random'),
  concept: z.object({
    summary: z.string().min(12),
    intervals: z.array(intervalSchema).min(1),
    examples: z.array(harmonyExampleSchema).default([]),
    afterHoursHref: z.string().optional(),
    afterHoursCta: z.string().optional()
  }).optional(),
  metronome: z.object({
    bpm: z.number().int().min(35).max(240),
    meter: z.string().default('4/4')
  }),
  routine: z.array(routineStepSchema).min(2),
  reviewPrompt: z.string().min(8)
});

export const pathSchema = z.object({
  id: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  title: z.string().min(4),
  eyebrow: z.string().min(2),
  access: accessSchema,
  description: z.string().min(20),
  lessonIds: z.array(z.string()).min(1),
  estimatedMinutes: z.number().int().positive()
});

export const standardSchema = z.object({
  id: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  title: z.string().min(2),
  subtitle: z.string().min(8),
  status: z.enum(['available', 'coming-soon']),
  access: accessSchema,
  href: z.string().min(1),
  focus: z.string().min(8)
});

export type Access = z.infer<typeof accessSchema>;
export type SkillLevel = z.infer<typeof skillLevelSchema>;
export type MusicInterval = z.infer<typeof intervalSchema>;
export type KeyMode = z.infer<typeof modeSchema>;
export type RoutineStep = z.infer<typeof routineStepSchema>;
export type HarmonyExample = z.infer<typeof harmonyExampleSchema>;
export type Lesson = z.infer<typeof lessonSchema>;
export type LearningPath = z.infer<typeof pathSchema>;
export type Standard = z.infer<typeof standardSchema>;

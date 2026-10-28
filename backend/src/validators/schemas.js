import { z } from 'zod';

export const classifyInputSchema = z.object({
  text: z.string().trim().min(1, 'Please enter a waste item name').max(150, 'Input is too long'),
  saveRecord: z.boolean().optional().default(false),
});

export const categorySchema = z.object({
  name: z.string().trim().min(2, 'Name is required'),
  slug: z.string().trim().min(2).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens'),
  description: z.string().trim().min(10, 'Description must be at least 10 characters'),
  disposal_instructions: z.string().trim().min(10, 'Disposal instructions are required'),
  safety_notes: z.string().trim().optional(),
  color_hex: z.string().trim().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Must be a valid hex color code').default('#10B981'),
  icon_name: z.string().trim().optional().default('trash-2'),
  is_active: z.boolean().optional().default(true),
});

export const itemSchema = z.object({
  name: z.string().trim().min(2, 'Item name is required'),
  normalized_name: z.string().trim().min(2, 'Normalized name is required'),
  aliases: z.array(z.string().trim()).default([]),
  category_id: z.string().uuid('Category ID must be a valid UUID'),
  description: z.string().trim().min(5, 'Description is required'),
  disposal_instructions: z.string().trim().min(5, 'Disposal instructions are required'),
  safety_notes: z.string().trim().optional(),
  classification_rule: z.record(z.any()).optional().default({}),
  is_active: z.boolean().optional().default(true),
});

export const moduleSchema = z.object({
  title: z.string().trim().min(3, 'Title is required'),
  slug: z.string().trim().min(3).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens'),
  summary: z.string().trim().min(10, 'Summary is required'),
  content: z.string().trim().min(20, 'Content is required'),
  difficulty: z.enum(['Beginner', 'Intermediate', 'Advanced']).default('Beginner'),
  estimated_minutes: z.number().int().positive().default(5),
  points_reward: z.number().int().min(0).default(25),
  category_tag: z.string().trim().optional().default('General'),
  is_published: z.boolean().optional().default(true),
});

export const rewardRuleSchema = z.object({
  event_type: z.string().trim().min(3),
  description: z.string().trim().min(5),
  points: z.number().int().min(0, 'Points must be non-negative'),
  is_active: z.boolean().optional().default(true),
});

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().trim().optional(),
  category: z.string().trim().optional(),
});


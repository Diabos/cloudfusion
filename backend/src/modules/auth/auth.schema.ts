import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(1),
});

export const profileSchema = z.object({
  displayName: z.string().trim().min(1).max(80).nullable(),
  avatarDataUrl: z.string().max(2_000_000).nullable(),
});

import { z } from "zod";

export const registerTenantSchema = z.object({
  tenantName: z.string().min(2).max(100),
  slug: z.string().min(2).max(100).regex(/^[a-z0-9-]+$/, "Slug inválido. Use apenas letras minúsculas, números e hifens."),
  adminName: z.string().min(2).max(50),
  adminPhone: z.string().min(8).max(25),
  adminPassword: z.string().min(4),
});

export type iRegisterTenant = z.infer<typeof registerTenantSchema>;

import { z } from 'zod';

export const OrganizationValidator = z.object({
  name: z.string().min(3).max(21),
});

export const OrganizationSubscriptionValidator = z.object({
  organizationId: z.string(),
});

export type CreateOrganizationPayload = z.infer<typeof OrganizationValidator>;
export type SubscribeToOrganizationPayload = z.infer<
  typeof OrganizationSubscriptionValidator
>;

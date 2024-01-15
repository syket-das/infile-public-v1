import { getAuthSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { OrganizationSubscriptionValidator } from '@/lib/validators/organization';
import { z } from 'zod';

export async function POST(req: Request) {
  try {
    const session = await getAuthSession();

    if (!session?.user) {
      return new Response('Unauthorized', { status: 401 });
    }

    const body = await req.json();
    const { organizationId } = OrganizationSubscriptionValidator.parse(body);

    // check if user has already subscribed to organization
    const subscriptionExists = await db.subscription.findFirst({
      where: {
        organizationId,
        userId: session.user.id,
      },
    });

    if (subscriptionExists) {
      return new Response("You've already subscribed to this organization", {
        status: 400,
      });
    }

    // create organization and associate it with the user
    await db.subscription.create({
      data: {
        organizationId,
        userId: session.user.id,
      },
    });

    return new Response(organizationId);
  } catch (error) {
    error;
    if (error instanceof z.ZodError) {
      return new Response(error.message, { status: 400 });
    }

    return new Response(
      'Could not subscribe to this organization at this time. Please try later',
      { status: 500 }
    );
  }
}

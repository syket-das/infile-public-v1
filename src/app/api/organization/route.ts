import { getAuthSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { OrganizationValidator } from '@/lib/validators/organization';
import { z } from 'zod';

export async function POST(req: Request) {
  try {
    const session = await getAuthSession();

    if (!session?.user) {
      return new Response('Unauthorized', { status: 401 });
    }

    const body = await req.json();
    const { name } = OrganizationValidator.parse(body);

    // check if organization already exists
    const organizationExists = await db.organization.findFirst({
      where: {
        name,
      },
    });

    if (organizationExists) {
      return new Response('organization already exists', { status: 409 });
    }

    // create organization and associate it with the user
    const organization = await db.organization.create({
      data: {
        name,
        creatorId: session.user.id,
      },
    });

    // create general topic for organization
    await db.topic.create({
      data: {
        userId: session.user.id,
        organizationId: organization.id,
        name: 'General',
      },
    });

    // creator also has to be subscribed
    await db.subscription.create({
      data: {
        userId: session.user.id,
        organizationId: organization.id,
      },
    });

    return new Response(organization.name);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response(error.message, { status: 422 });
    }

    return new Response('Could not create organization', { status: 500 });
  }
}

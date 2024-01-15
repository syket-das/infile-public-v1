import { getAuthSession } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(
  req: Request,
  {
    params,
  }: {
    params: {
      slug: string;
    };
  }
) {
  const slug = params.slug;

  const session = await getAuthSession();

  if (!session?.user) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const organization = await db.organization.findFirst({
      where: {
        name: slug,
      },
    });

    if (!organization) {
      return new Response('organization not found', { status: 404 });
    }

    const subscriptions = await db.subscription.findMany({
      where: {
        organizationId: organization.id,
      },
      include: {
        user: true,
      },
    });

    return new Response(JSON.stringify(subscriptions));
  } catch (error) {
    return new Response('Could not get subscriptions', { status: 500 });
  }
}

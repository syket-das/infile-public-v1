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

      include: {
        Creator: true,
        posts: {
          include: {
            author: true,
            Topic: true,
            votes: true,
            comments: true,
          },

          orderBy: {
            createdAt: 'desc',
          },
        },
        subscribers: {
          include: {
            user: true,
          },
        },
        topics: true,
      },
    });

    if (!organization) {
      return new Response('organization not found', { status: 404 });
    }

    if (organization.Creator.id !== session.user.id) {
      return new Response('Unauthorized', { status: 401 });
    }

    return new Response(JSON.stringify(organization));
  } catch (error) {
    return new Response('Could not get subscriptions', { status: 500 });
  }
}

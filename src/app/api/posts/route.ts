import { Topic } from '@prisma/client';
import { getAuthSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { z } from 'zod';

export async function GET(req: Request) {
  const url = new URL(req.url);

  const session = await getAuthSession();

  let followedCommunitiesIds: string[] = [];

  if (session) {
    const followedCommunities = await db.subscription.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        organization: true,
      },
    });

    followedCommunitiesIds = followedCommunities.map(
      (sub) => sub.organization.id
    );
  }

  try {
    const { limit, page, organizationName, topicName } = z
      .object({
        limit: z.string(),
        page: z.string(),
        organizationName: z.string().nullish().optional(),
        topicName: z.string().nullish().optional(),
      })
      .parse({
        organizationName: url.searchParams.get('organizationName'),
        topicName: url.searchParams.get('topicName'),
        limit: url.searchParams.get('limit'),
        page: url.searchParams.get('page'),
      });

    if (!session) {
      const posts = await db.post.findMany({
        take: parseInt(limit),
        skip: (parseInt(page) - 1) * parseInt(limit), // skip should start from 0 for page 1
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          organization: true,
          votes: true,
          author: true,
          comments: true,
          Topic: true,
        },
        where: {
          organization: {
            isPrivate: false,
          },
          suspended: false,
        },
      });
      return new Response(JSON.stringify([]));
    } else {
      if (organizationName && topicName) {
        // check user is subscribed to the organization or not

        const isSubscribed = await db.subscription.findFirst({
          where: {
            userId: session.user.id,
            organization: {
              name: organizationName,
            },
          },
        });

        const bolSub = !!isSubscribed;

        if (!bolSub) {
          return new Response(JSON.stringify([]));
        }

        const posts = await db.post.findMany({
          take: parseInt(limit),
          skip: (parseInt(page) - 1) * parseInt(limit), // skip should start from 0 for page 1
          orderBy: {
            createdAt: 'desc',
          },
          include: {
            organization: true,
            votes: true,
            author: true,
            comments: true,
            Topic: true,
          },
          where: {
            organization: {
              name: organizationName,
            },
            Topic: {
              name: topicName,
            },
            suspended: false,
          },
        });

        return new Response(JSON.stringify(posts));
      } else if (organizationName) {
        const isSubscribed = await db.subscription.findFirst({
          where: {
            userId: session.user.id,
            organization: {
              name: organizationName,
            },
          },
        });

        const bolSub = !!isSubscribed;

        if (!bolSub) {
          return new Response(JSON.stringify([]));
        }

        const posts = await db.post.findMany({
          take: parseInt(limit),
          skip: (parseInt(page) - 1) * parseInt(limit), // skip should start from 0 for page 1
          orderBy: {
            createdAt: 'desc',
          },
          include: {
            organization: true,
            votes: true,
            author: true,
            comments: true,
            Topic: true,
          },
          where: {
            organization: {
              name: organizationName,
            },
            suspended: false,
          },
        });

        return new Response(JSON.stringify(posts));
      } else {
        const posts = await db.post.findMany({
          take: parseInt(limit),
          skip: (parseInt(page) - 1) * parseInt(limit), // skip should start from 0 for page 1
          orderBy: {
            createdAt: 'desc',
          },
          include: {
            organization: true,
            votes: true,
            author: true,
            comments: true,
            Topic: true,
          },
          where: {
            organization: {
              id: {
                in: followedCommunitiesIds,
              },
            },
            suspended: false,
          },
        });

        return new Response(JSON.stringify(posts));
      }
    }
  } catch (error) {
    return new Response('Could not fetch posts', { status: 500 });
  }
}

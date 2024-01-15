import { getAuthSession } from '@/lib/auth';
import { db } from '@/lib/db';

export async function POST(req: Request) {
  const body = await req.json();

  const { name, organizationId } = body;

  if (!name || !organizationId) {
    return new Response('Missing required fields', { status: 400 });
  }

  const session = await getAuthSession();

  if (!session?.user) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    // verify user is subscribed to passed organization id
    const subscription = await db.subscription.findFirst({
      where: {
        organizationId,
        userId: session.user.id,
      },
    });

    if (!subscription) {
      return new Response('Subscribe to post', { status: 403 });
    }

    await db.topic.create({
      data: {
        name,
        organizationId,
        userId: session.user.id,
      },
    });
    return new Response('OK');
  } catch (error) {
    return new Response(
      error instanceof Error ? error.message : JSON.stringify(error),
      { status: 500 }
    );
  }
}

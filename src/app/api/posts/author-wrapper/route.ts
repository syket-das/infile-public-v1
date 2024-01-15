import { getAuthSession } from '@/lib/auth';
import { db } from '@/lib/db';
export async function GET(req: Request) {
  const session = await getAuthSession();
  const { searchParams } = new URL(req.url);
  const authorId = searchParams.get('authorId');
  const organizationId = searchParams.get('organizationId');
  const authorActualName = searchParams.get('authorActualName');

  try {
    if (!authorId || !organizationId) {
      return new Response(JSON.stringify({ eauthorName: 'unknown' }), {
        status: 400,
      });
    }

    if (!session?.user.id) {
      return new Response(JSON.stringify({ authorName: 'unknown' }), {
        status: 200,
      });
    }

    const subscription = await db.subscription.findFirst({
      where: {
        userId: authorId,
        organizationId: organizationId,
      },
      select: {
        uname: true,
      },
    });

    const loggedUserSub = await db.subscription.findFirst({
      where: {
        userId: session?.user.id,
        organizationId: organizationId,
      },
      select: {
        role: true,
      },
    });

    if (!subscription) {
      return new Response(JSON.stringify({ authorName: 'unknown' }), {
        status: 200,
      });
    }

    if (authorId === session?.user.id) {
      return new Response(JSON.stringify({ authorName: authorActualName }), {
        status: 200,
      });
    }

    if (loggedUserSub && loggedUserSub.role !== 'USER') {
      return new Response(JSON.stringify({ authorName: authorActualName }), {
        status: 200,
      });
    }

    return new Response(
      JSON.stringify({ authorName: subscription.uname ?? 'unknown' }),
      {
        status: 200,
      }
    );
  } catch (error) {
    return new Response('Error Occured', {
      status: 500,
    });
  }
}

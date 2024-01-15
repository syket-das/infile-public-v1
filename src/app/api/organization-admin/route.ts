import { getAuthSession } from '@/lib/auth';
import { db } from '@/lib/db';
export async function GET() {
  const session = await getAuthSession();

  if (!session) {
    return new Response('Unauthorized', {
      status: 401,
    });
  }

  try {
    const userDetails = await db.user.findFirst({
      where: {
        id: session.user.id,
      },

      include: {
        createdOrganizations: true,
      },
    });

    return new Response(JSON.stringify(userDetails));
  } catch (error) {
    return new Response('Server error', {
      status: 500,
    });
  }
}

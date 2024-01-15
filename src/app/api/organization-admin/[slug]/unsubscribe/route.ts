import { db } from '@/lib/db';

export async function PATCH(
  req: Request,
  { params }: { params: { slug: string } }
) {
  const { userId } = await req.json();
  const slug = params.slug;

  try {
    const organization = await db.organization.findFirst({
      where: {
        name: slug,
      },
      include: {
        Creator: true,
      },
    });

    if (!organization) {
      return new Response('organization not found', { status: 404 });
    }

    if (userId === organization.Creator.id) {
      return new Response('You cannot unsubscribe from your own organization', {
        status: 400,
      });
    }

    const deleteSubscription = await db.subscription.delete({
      where: {
        userId_organizationId: {
          userId: userId,
          organizationId: organization.id,
        },
      },
    });

    return new Response('Unsubscribed', {
      headers: { 'content-type': 'application/json' },
      status: 200,
    });
  } catch (error: any) {
    return new Response('Error occured', {
      headers: { 'content-type': 'application/json' },
      status: 500,
    });
  }
}

import { db } from '@/lib/db';

export async function GET(
  req: Request,
  { params }: { params: { slug: string; postId: string } }
) {
  const { slug, postId } = params;

  try {
    const org = await db.organization.findFirst({
      where: {
        name: slug,
      },
    });

    if (!org) {
      return new Response('Organization not found', { status: 404 });
    }

    const post = await db.post.findFirst({
      where: {
        id: postId,
        organizationId: org.id,
      },
      include: {
        organization: true,
        Topic: true,
        author: true,
        votes: true,
        comments: true,
      },
    });

    if (!post) {
      return new Response('Post not found', { status: 404 });
    }

    return new Response(JSON.stringify(post), {
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

export async function PATCH(
  req: Request,
  { params }: { params: { slug: string; postId: string } }
) {
  const { slug, postId } = params;

  const { title, suspended } = await req.json();

  try {
    const org = await db.organization.findFirst({
      where: {
        name: slug,
      },
    });

    if (!org) {
      return new Response('Organization not found', { status: 404 });
    }

    const post = await db.post.findFirst({
      where: {
        id: postId,
      },
      include: {
        organization: true,
        Topic: true,
        author: true,
        votes: true,
        comments: true,
      },
    });

    if (!post) {
      return new Response('Post not found', { status: 404 });
    }

    const updatedPost = await db.post.update({
      where: {
        id: postId,
      },
      data: {
        title,
        suspended,
      },
    });

    return new Response(JSON.stringify(updatedPost), {
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

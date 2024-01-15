import { db } from '@/lib/db';
import { hash } from 'bcryptjs';

export async function POST(req: Request) {
  const { name, email, password, username, image } = await req.json();

  const userExist = await db.user.findFirst({
    where: {
      OR: [
        {
          email,
        },
        {
          username,
        },
      ],
    },
  });

  if (userExist) {
    return new Response('User already exists', { status: 400 });
  }

  const user = await db.user.create({
    data: {
      name,
      email,
      password: await hash(password, 10),
      username,
      image,
    },
  });

  return new Response(JSON.stringify(user), {
    headers: {
      'content-type': 'application/json',
    },

    status: 201,
  });
}

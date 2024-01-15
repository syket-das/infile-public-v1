import { db } from '@/lib/db';
import { Role } from '@prisma/client';
import { hash } from 'bcryptjs';

type User = {
  name: string;
  email: string;
  password?: string;
  username?: string;
  image?: string;
  organization: {
    name: string;
    role?: Role;
    uid?: string;
    uname?: string;
    position?: string;
    department?: string;
    phone?: string;
  };
};

export async function POST(req: Request) {
  //
  const {
    user,
  }: {
    user: User;
  } = await req.json();

  try {
    if (!user.password) {
      user.password = user.email;
    }

    const hashedPassword = await hash(user.password, 10);

    const organizationExist = await db.organization.findFirst({
      where: { name: user.organization.name },
    });

    if (!organizationExist) {
      return new Response(
        JSON.stringify({ message: 'Organization does not exist' }),
        {
          headers: { 'content-type': 'application/json' },
          status: 400,
        }
      );
    }
    const userExist = await db.user.findFirst({
      where: { email: user.email },
    });
    if (userExist) {
      const subExist = await db.subscription.findFirst({
        where: {
          userId: userExist.id,
          organizationId: organizationExist.id,
        },
      });

      if (subExist) {
        return new Response(
          JSON.stringify({ message: 'User already subscribed' }),
          {
            headers: { 'content-type': 'application/json' },
            status: 400,
          }
        );
      }

      const createSubscription = await db.subscription.create({
        data: {
          userId: userExist.id,
          organizationId: organizationExist.id,
          role: user.organization.role,
          position: user.organization.position,
          department: user.organization.department,
          uid: user.organization.uid,
          uname: user.organization.uname,
        },
      });
    } else {
      const createdUser = await db.user.create({
        data: {
          name: user.name,
          email: user.email,
          password: hashedPassword,
          username: user.username,
          image: user.image,
        },
      });

      const subExist = await db.subscription.findFirst({
        where: { userId: createdUser.id, organizationId: organizationExist.id },
      });

      if (subExist) {
        return new Response(
          JSON.stringify({ message: 'User already subscribed' }),
          {
            headers: { 'content-type': 'application/json' },
            status: 400,
          }
        );
      }

      const createSubscription = await db.subscription.create({
        data: {
          userId: createdUser.id,
          organizationId: organizationExist.id,
          role: user.organization.role,
          position: user.organization.position,
          department: user.organization.department,
          uid: user.organization.uid,
          uname: user.organization.uname,
        },
      });
    }

    return new Response(JSON.stringify({ message: 'success' }), {
      headers: { 'content-type': 'application/json' },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ message: error.message }), {
      headers: { 'content-type': 'application/json' },
    });
  }
}

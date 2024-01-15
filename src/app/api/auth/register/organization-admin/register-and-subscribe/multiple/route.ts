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
    users,
    organizationName,
  }: {
    users: User[];
    organizationName: string;
  } = await req.json();

  async function hashPassword(password: string) {
    return await hash(password, 10);
  }

  try {
    const usersWithPassword = users.map((user) => {
      if (!user.password) {
        user.password = user.email;
      }

      return user;
    });

    const usersWithHashedPassword = await Promise.all(
      usersWithPassword.map(async (user) => {
        const hashedPassword = await hashPassword(user.password as string);
        return { ...user, password: hashedPassword };
      })
    );

    const reqUserData = usersWithHashedPassword.map((user) => {
      return {
        name: user.name,
        email: user.email,
        password: user.password,
        username: user.username,
        image: user.image,
      };
    });

    const createdUsers = await db.user.createMany({
      data: reqUserData,
      skipDuplicates: true,
    });

    const usersdb = await db.user.findMany({
      where: {
        email: {
          in: usersWithHashedPassword.map((user) => user.email),
        },
      },
    });

    const organization = await db.organization.findFirst({
      where: { name: organizationName },
    });

    if (!organization) {
      return new Response('Organization does not exist', {
        status: 400,
      });
    }

    const subscribedUsers = await db.subscription.createMany({
      data: [
        ...usersdb.map((user) => {
          const organizationUser = usersWithHashedPassword.find(
            (u) => u.email === user.email
          );

          return {
            userId: user.id,
            organizationId: organization.id,
            role: organizationUser?.organization.role,
            uid: organizationUser?.organization.uid,
            uname: organizationUser?.organization.uname,
            position: organizationUser?.organization.position,
            department: organizationUser?.organization.department,
            phone: organizationUser?.organization.phone,
          };
        }),
      ],
    });

    return new Response(
      JSON.stringify({ message: 'Users created and subscribed' }),
      {
        headers: { 'content-type': 'application/json' },
        status: 200,
      }
    );
  } catch (error: any) {
    console.log(error);

    return new Response(error.message, {
      status: 500,
    });
  }
}

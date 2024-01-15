import { db } from '@/lib/db';
import { Role } from '@prisma/client';
import axios from 'axios';
import { AnyComponent } from 'styled-components/dist/types';

export async function POST(
  req: Request,
  {
    params,
  }: {
    params: {
      slug: string;
    };
  }
) {
  const { slug } = params;
  const { faculties } = await req.json();

  try {
    const organization = await db.organization.findUnique({
      where: {
        name: slug,
      },
    });

    if (!organization) {
      return new Response('Organization not found', {
        status: 404,
      });
    }

    const subscriptions = await db.subscription.findMany({
      where: {
        organizationId: organization.id,
        role: Role.FACULTY,
      },

      include: {
        user: true,
      },
    });

    const currentFaculties = subscriptions;

    const toRemove = currentFaculties.filter((currentFaculty: any) => {
      const found = faculties.find(
        (faculty: any) => faculty.email === currentFaculty.user.email
      );

      return !found;
    });
    const toAdd = faculties.filter((faculty: any) => {
      const found = currentFaculties.find(
        (currentFaculty) => currentFaculty.user.email === faculty.email
      );

      return !found;
    });

    return new Response(
      JSON.stringify({
        toRemove: toRemove,
        toAdd: toAdd,
        currentFaculties,
      })
    );
  } catch (error: any) {
    return new Response(error.message, {
      status: 500,
    });
  }
}

export async function PATCH(
  req: Request,
  {
    params,
  }: {
    params: {
      slug: string;
    };
  }
) {
  const { slug } = params;
  const { faculties } = await req.json();

  try {
    const organization = await db.organization.findUnique({
      where: {
        name: slug,
      },
    });

    if (!organization) {
      return new Response('Organization not found', {
        status: 404,
      });
    }

    const subscriptions = await db.subscription.findMany({
      where: {
        organizationId: organization.id,
        role: Role.FACULTY,
      },

      include: {
        user: true,
      },
    });

    const currentFaculties = subscriptions;

    const toRemove = currentFaculties.filter((currentFaculty: any) => {
      const found = faculties.find(
        (faculty: any) => faculty.email === currentFaculty.user.email
      );

      return !found;
    });
    const toAdd = faculties.filter((faculty: any) => {
      const found = currentFaculties.find(
        (currentFaculty) => currentFaculty.user.email === faculty.email
      );

      return !found;
    });

    const toRemoveIds = toRemove.map((faculty) => faculty.user.id);

    await db.subscription.deleteMany({
      where: {
        userId: {
          in: toRemoveIds,
        },
        organizationId: organization.id,
      },
    });

    return new Response('success', {
      status: 200,
    });

    // filter faculties if exists on the database and remove it from the list
  } catch (error: any) {
    return new Response(error.message, {
      status: 500,
    });
  }
}

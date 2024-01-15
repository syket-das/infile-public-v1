import { Role } from '@prisma/client';
import { getAuthSession } from '../auth';
import { db } from '../db';

const getAuthorName = async (authorId: string, organizationName: string) => {
  const session = await getAuthSession();

  if (!session?.user) {
    return '';
  }

  const org = await db.organization.findFirst({
    where: {
      name: organizationName,
    },
  });

  if (!org) {
    return null;
  }

  //   get loggedin user role in organization
};

export default getAuthorName;

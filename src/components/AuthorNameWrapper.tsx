import { getAuthSession } from '@/lib/auth';
import { db } from '@/lib/db';
import React from 'react';

const AuthorNameWrapper = async ({
  authorId,
  organizationName,
}: {
  authorId: string;
  organizationName: string;
}) => {
  const session = await getAuthSession();

  if (!session) {
    return null;
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

  return <div>AuthorNameWrapper</div>;
};

export default AuthorNameWrapper;

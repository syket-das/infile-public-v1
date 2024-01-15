import PostFeed from '@/components/PostFeed';
import { INFINITE_SCROLL_PAGINATION_RESULTS } from '@/config';
import { getAuthSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { LockClosedIcon, LockOpen2Icon } from '@radix-ui/react-icons';
import { notFound } from 'next/navigation';
import React, { ReactNode } from 'react';

const layout = async ({
  children,
  params: { slug, topicName },
}: {
  children: ReactNode;
  params: { slug: string; topicName: string };
}) => {
  const session = await getAuthSession();

  const organization = await db.organization.findFirst({
    where: { name: slug },
    include: {
      topics: {
        include: {
          posts: true,
        },
      },
      posts: {
        where: {
          Topic: {
            name: topicName,
          },
        },
        include: {
          author: true,
          votes: true,
          comments: true,
          organization: true,
          Topic: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: INFINITE_SCROLL_PAGINATION_RESULTS,
      },
    },
  });

  const topic = organization?.topics.find((topic) => topic.name === topicName);
  if (!organization) return notFound();
  if (!topic) return notFound();

  return (
    <div>
      <h2 className="mb-4 text-2xl font-bold text-gray-900 flex items-center">
        <span className="">
          {topic.isPrivate ? (
            <LockClosedIcon className="w-5 h-5 mr-1" />
          ) : (
            <LockOpen2Icon className="w-5 h-5 mr-1" />
          )}
        </span>
        <span>
          {organization.name}/{topic.name} ({topic.posts.length})
        </span>
      </h2>

      {children}
      {organization.posts && (
        <PostFeed
          initialPosts={[]}
          organizationName={organization.name}
          topicName={topicName}
        />
      )}
    </div>
  );
};

export default layout;

import SubscribeLeaveToggle from '@/components/SubscribeLeaveToggle';
import ToFeedButton from '@/components/ToFeedButton';
import { Button } from '@/components/ui/Button';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu';
import { getAuthSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { format } from 'date-fns';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'INFILE',
  description: 'INFILE - Enrich your knowledge',
};

const Layout = async ({
  children,
  params: { slug },
}: {
  children: ReactNode;
  params: { slug: string };
}) => {
  const session = await getAuthSession();

  const organization = await db.organization.findFirst({
    where: { name: slug },
    include: {
      posts: {
        include: {
          author: true,
          votes: true,
        },

        where: {
          suspended: false,
        },
      },
    },
  });

  const subscription = !session?.user
    ? undefined
    : await db.subscription.findFirst({
        where: {
          organization: {
            name: slug,
          },
          user: {
            id: session.user.id,
          },
        },
      });

  const isSubscribed = !!subscription;

  if (!organization) return notFound();

  const memberCount = await db.subscription.count({
    where: {
      organization: {
        name: slug,
      },
    },
  });

  if (organization.isPrivate && !isSubscribed) {
    return (
      <div className="sm:container max-w-7xl mx-auto h-full">
        <ToFeedButton />
        <div className="flex flex-col gap-4 justify-center items-center mt-[20%]">
          <span className=" text-2xl font-bold text-red-500">
            Not Allowed!!!
          </span>
          <p>
            This is a private organization. Please request admin to access this
            organization
          </p>

          <Button variant="outline">Access Request</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="sm:container  h-full pt-12">
      <div>
        <ToFeedButton />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-y-4 md:gap-x-4 py-6">
          <ul className="flex flex-col col-span-2 space-y-6">{children}</ul>

          {/* info sidebar */}
          <div className="overflow-hidden h-fit rounded-lg  order-first md:order-last">
            <div className="border border-gray-200">
              <div className="px-6 py-4">
                <p className="font-semibold py-3">
                  About org/{organization.name}
                </p>
              </div>
              <dl className="divide-y divide-gray-100 px-6 py-4 text-sm leading-6 bg-white">
                <div className="flex justify-between gap-x-4 py-3">
                  <dt className="text-gray-500">Created</dt>
                  <dd className="text-gray-700">
                    <time dateTime={organization.createdAt.toDateString()}>
                      {format(organization.createdAt, 'MMMM d, yyyy')}
                    </time>
                  </dd>
                </div>
                <div className="flex justify-between gap-x-4 py-3">
                  <dt className="text-gray-500">Members</dt>
                  <dd className="flex items-start gap-x-2">
                    <div className="text-gray-900">{memberCount}</div>
                  </dd>
                </div>
                {organization.creatorId === session?.user?.id ? (
                  <div className="flex justify-between gap-x-4 py-3">
                    <dt className="text-gray-500">
                      You created this community
                    </dt>
                  </div>
                ) : null}

                {organization.creatorId !== session?.user?.id ? (
                  <SubscribeLeaveToggle
                    isSubscribed={isSubscribed}
                    organizationId={organization.id}
                    organizationName={organization.name}
                  />
                ) : null}

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full">
                      Create
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56">
                    <DropdownMenuItem>
                      <Link href={`organization/${slug}/submit`}>
                        Create Post
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Link href={`organization/${slug}/submit?postType=file`}>
                        Add Resource (File)
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Link
                        href={`organization/${slug}/topic/create?organizationId=${organization.id}`}
                      >
                        Create Topic
                      </Link>{' '}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Layout;

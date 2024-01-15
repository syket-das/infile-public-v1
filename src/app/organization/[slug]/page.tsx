import MiniCreatePost from '@/components/MiniCreatePost';
import PostFeed from '@/components/PostFeed';
import { INFINITE_SCROLL_PAGINATION_RESULTS } from '@/config';
import { getAuthSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { notFound } from 'next/navigation';

interface PageProps {
  params: {
    slug: string;
  };
}

const page = async ({ params }: PageProps) => {
  const { slug } = params;
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
  if (!organization) return notFound();
  return (
    <>
      <div className="flex flex-wrap items-center justify-start w-full mb-4 gap-4">
        {organization.topics.map((topic) => (
          <span
            key={topic.id}
            className="px-2 py-1  text-xs font-bold text-white bg-gray-400 rounded cursor-pointer hover:bg-gray-500"
          >
            <a href={`/organization/${organization.name}/topic/${topic.name}`}>
              {topic.name} ({topic.posts.length})
            </a>
          </span>
        ))}
      </div>
      <h1 className="font-bold text-3xl md:text-4xl h-14 break-all">
        org/{organization.name}
      </h1>
      <MiniCreatePost session={session} />
      <PostFeed initialPosts={[]} organizationName={organization.name} />
    </>
  );
};

export default page;

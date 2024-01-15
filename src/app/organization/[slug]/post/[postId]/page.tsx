import CommentsSection from '@/components/CommentsSection';
import EditorOutput from '@/components/EditorOutput';
import FilePostOutput from '@/components/FilePostOutput';
import PostVoteServer from '@/components/post-vote/PostVoteServer';
import { buttonVariants } from '@/components/ui/Button';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { formatTimeToNow } from '@/lib/utils';
import { Post, Role, User, Vote } from '@prisma/client';
import { ArrowBigDown, ArrowBigUp, Loader2 } from 'lucide-react';
import { getServerSession } from 'next-auth';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';

interface OrganizationPostPageProps {
  params: {
    postId: string;
  };
}

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

const OrganizationPostPage = async ({ params }: OrganizationPostPageProps) => {
  const session = await getServerSession(authOptions);
  let post: (Post & { votes: Vote[]; author: User }) | null = null;

  post = await db.post.findFirst({
    where: {
      id: params.postId,
    },
    include: {
      votes: true,
      author: true,
    },
  });

  if (!post) return notFound();

  const subscription = await db.subscription.findFirst({
    where: {
      userId: post.authorId,
      organizationId: post.organizationId,
    },
    select: {
      uname: true,
    },
  });

  const loggedUserSub = await db.subscription.findFirst({
    where: {
      userId: session?.user.id,
      organizationId: post.organizationId,
    },
    select: {
      role: true,
    },
  });

  const getAuthorName = () => {
    if (!post) return;
    if (session?.user?.id === post.authorId) return post.author.name;
    if (!session?.user?.id) return 'unknown';

    if (loggedUserSub && loggedUserSub.role !== 'USER') {
      return post.author.name;
    }

    return subscription?.uname ?? 'unknown';
  };

  return (
    <div>
      <div className="h-full flex flex-col sm:flex-row items-center sm:items-start justify-between">
        <Suspense fallback={<PostVoteShell />}>
          {/* @ts-expect-error server component */}
          <PostVoteServer
            postId={post?.id}
            getData={async () => {
              return await db.post.findUnique({
                where: {
                  id: params.postId,
                },
                include: {
                  votes: true,
                },
              });
            }}
          />
        </Suspense>

        <div className="sm:w-0 w-full flex-1 bg-white p-4 rounded-sm">
          <p className="max-h-40 mt-1 truncate text-xs text-gray-500">
            Posted by u/{getAuthorName()}{' '}
            {formatTimeToNow(new Date(post?.createdAt))}
          </p>
          <h1 className="text-xl font-semibold py-2 leading-6 text-gray-900 break-all break-words">
            {post?.title}
          </h1>

          {post?.content ? (
            <EditorOutput content={post?.content} />
          ) : (
            <FilePostOutput files={post?.files as []} />
          )}
          <Suspense
            fallback={
              <Loader2 className="h-5 w-5 animate-spin text-zinc-500" />
            }
          >
            {/* @ts-expect-error Server Component */}
            <CommentsSection postId={post?.id ?? cachedPost.id} />
          </Suspense>
        </div>
      </div>
    </div>
  );
};

function PostVoteShell() {
  return (
    <div className="flex items-center flex-col pr-6 w-20">
      {/* upvote */}
      <div className={buttonVariants({ variant: 'ghost' })}>
        <ArrowBigUp className="h-5 w-5 text-zinc-700" />
      </div>

      {/* score */}
      <div className="text-center py-2 font-medium text-sm text-zinc-900">
        <Loader2 className="h-3 w-3 animate-spin" />
      </div>

      {/* downvote */}
      <div className={buttonVariants({ variant: 'ghost' })}>
        <ArrowBigDown className="h-5 w-5 text-zinc-700" />
      </div>
    </div>
  );
}

export default OrganizationPostPage;

import { db } from '@/lib/db';
import PostFeed from '../PostFeed';
import { INFINITE_SCROLL_PAGINATION_RESULTS } from '@/config';

const GeneralFeed = async () => {
  const posts = await db.post.findMany({
    where: {
      Topic: {
        isPrivate: false,
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      votes: true,
      author: true,
      comments: true,
      organization: true,
      Topic: true,
    },
    take: INFINITE_SCROLL_PAGINATION_RESULTS, // 4 to demonstrate infinite scroll, should be higher in production
  });

  return <PostFeed initialPosts={[]} />;
};

export default GeneralFeed;

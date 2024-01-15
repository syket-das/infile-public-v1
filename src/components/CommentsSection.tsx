import { getAuthSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { Comment, CommentVote, User } from '@prisma/client';
import CreateComment from './CreateComment';
import PostComment from './comments/PostComment';

type ExtendedComment = Comment & {
  votes: CommentVote[];
  author: User;
};

interface CommentsSectionProps {
  postId: string;
  comments: ExtendedComment[];
}

const CommentsSection = async ({ postId }: CommentsSectionProps) => {
  const session = await getAuthSession();

  const comments = await db.comment.findMany({
    where: {
      postId: postId,
    },
    include: {
      author: true,
      votes: true,
    },
  });

  return (
    <div className="flex flex-col gap-y-4 mt-4">
      <hr className="w-full h-px my-6" />

      <CreateComment postId={postId} />

      <div className="flex flex-col gap-y-6 mt-4">
        {comments.map((topLevelComment) => {
          const topLevelCommentVotesAmt = topLevelComment.votes.reduce(
            (acc, vote) => {
              if (vote.type === 'UP') return acc + 1;
              if (vote.type === 'DOWN') return acc - 1;
              return acc;
            },
            0
          );

          const topLevelCommentVote = topLevelComment.votes.find(
            (vote) => vote.userId === session?.user.id
          );

          return (
            <div key={topLevelComment.id} className="flex flex-col">
              <div className="mb-2">
                <PostComment
                  comment={topLevelComment}
                  currentVote={topLevelCommentVote}
                  votesAmt={topLevelCommentVotesAmt}
                  postId={postId}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CommentsSection;

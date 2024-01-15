'use client';

import { formatTimeToNow } from '@/lib/utils';
import { Post, Role, Topic, User, Vote } from '@prisma/client';
import { MessageSquare } from 'lucide-react';
import Link from 'next/link';
import { FC, useEffect, useRef, useState } from 'react';
import EditorOutput from './EditorOutput';
import PostVoteClient from './post-vote/PostVoteClient';
import ClientOnly from './ClientOnly';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import axios from 'axios';

type PartialVote = Pick<Vote, 'type'>;

interface PostProps {
  post: Post & {
    author: User;
    votes: Vote[];
    Topic: Topic;
    files: any;
  };
  votesAmt: number;
  organizationName: string;
  currentVote?: PartialVote;
  commentAmt: number;
}

const Post: FC<PostProps> = ({
  post,
  votesAmt: _votesAmt,
  currentVote: _currentVote,
  organizationName,
  commentAmt,
}) => {
  const pRef = useRef<HTMLParagraphElement>(null);

  const router = useRouter();

  const session = useSession();
  const [authorName, setAuthorName] = useState<string>('unknown');

  useEffect(() => {
    const getAuthorName = async () => {
      try {
        const res = await axios.get(
          `/api/posts/author-wrapper?authorId=${post.authorId}&organizationId=${post.organizationId}&authorActualName=${post.author.name}`
        );

        setAuthorName(res.data.authorName);

        return res.data.authorName;
      } catch (error) {
        return 'unknown';
      }
    };

    getAuthorName();
  }, [
    post.authorId,
    post.organizationId,
    post.author.name,
    session?.data?.user?.id,
  ]);

  return (
    <ClientOnly>
      <div className="rounded-md bg-white shadow">
        <div className="px-6 py-4 flex justify-between">
          {/* {post.content ? ( */}
          <PostVoteClient
            postId={post.id}
            initialVotesAmt={_votesAmt}
            initialVote={_currentVote?.type}
          />
          {/* ) : null} */}

          <div className="w-0 flex-1">
            <div className="max-h-40 mt-1 text-xs text-gray-500  ">
              {organizationName ? (
                <>
                  <a
                    className="underline text-zinc-900 text-sm underline-offset-2 break-words"
                    href={`/organization/${organizationName}`}
                  >
                    organization/{organizationName}/
                  </a>
                  {post?.Topic?.name}
                  <span className="px-1">•</span>
                </>
              ) : null}
              <span>Posted by u/{authorName}</span>{' '}
              <span className="px-1">•</span>
              {formatTimeToNow(new Date(post.createdAt))}
            </div>
            {post.content && (
              <a href={`/organization/${organizationName}/post/${post.id}`}>
                <h1 className="text-lg font-semibold py-2 leading-6 text-gray-900 flex gap-2 items-center break-all break-words ">
                  {post.title}{' '}
                </h1>
              </a>
            )}

            <div
              className="relative text-sm  h-72 w-full overflow-clip"
              ref={pRef}
            >
              {post?.content ? (
                <EditorOutput content={post.content} />
              ) : (
                <>
                  {post.files ? (
                    <div className="h-[300px] w-full border">
                      {/* <iframe
                        allowFullScreen={false}
                        // hide all controls
                        // ts-ignore
                        src={`https://docs.google.com/gview?url=${post?.files[0]?.fileUrl}&embedded=true&controls=0&disablekb=1&hl=en&authuser=0`}
                        className="h-full w-full"
                      ></iframe> */}

                      <div
                        className={`h-full w-full bg-center bg-cover relative  flex flex-col gap-4  justify-center p-4 cursor-pointer`}
                        onClick={() => {
                          router.push(
                            `/organization/${organizationName}/post/${post.id}`
                          );
                        }}
                      >
                        <h2 className="text-xl text-center">{post.title}</h2>
                        <p className="text-right mr-20 ">{authorName}</p>

                        <div className="absolute bottom-5 left-[40%]">
                          {post.content
                            ? null
                            : post.files && (
                                <p className="flex gap-2 text-xs">
                                  {post?.files?.length} files attached
                                </p>
                              )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    'No content'
                  )}
                </>
              )}

              {post.content &&
              pRef?.current &&
              pRef?.current?.clientHeight >= 160 ? (
                // blur bottom if content is too long
                <div className="absolute bottom-0 left-0 h-24 w-full bg-gradient-to-t from-white to-transparent"></div>
              ) : null}
            </div>
          </div>
        </div>

        {post.content ? (
          <div className="bg-gray-50 z-20 text-sm px-4 py-4 sm:px-6">
            <Link
              href={`/organization/${organizationName}/post/${post.id}`}
              className="w-fit flex items-center gap-2"
            >
              <MessageSquare className="h-4 w-4" /> {commentAmt} comments
            </Link>
          </div>
        ) : null}
      </div>
    </ClientOnly>
  );
};
export default Post;

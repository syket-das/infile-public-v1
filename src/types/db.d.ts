import type {
  Post,
  Organization,
  User,
  Vote,
  Comment,
  Topic,
} from '@prisma/client';

export type ExtendedPost = Post & {
  organization: Organization;
  votes: Vote[];
  author: User;
  comments: Comment[];
  Topic: Topic;
};

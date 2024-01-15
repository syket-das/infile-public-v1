'use client';
import { Input } from '@/components/ui/Input';
import { useMutation, useQuery } from '@tanstack/react-query';
import axios from 'axios';
import React from 'react';
import { Button } from '@/components/ui/Button';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
const PostDetails = ({
  postId,
  organizationName,
}: {
  postId: string;
  organizationName: string;
}) => {
  const router = useRouter();
  const { toast } = useToast();
  const [initPost, setInitPost] = React.useState<any>({
    title: '',
    suspended: '',
  });

  const { data: post, isLoading } = useQuery({
    queryKey: ['postdetails'],
    queryFn: async () => {
      const { data } = await axios.get(
        `/api/organization-admin/${organizationName}/posts/${postId}`
      );

      setInitPost({
        title: data.title,
        suspended: data.suspended === true ? 'true' : 'false',
      });
      return data;
    },
  });

  const updatePost = useMutation({
    mutationFn: async (postId) => {
      const { data } = await axios.patch(
        `/api/organization-admin/${organizationName}/posts/${postId}`,
        {
          title: initPost.title,
          suspended: initPost.suspended === 'true' ? true : false,
        }
      );

      return data;
    },

    onSuccess() {
      toast({
        title: 'Post updated successfully',
        variant: 'default',
      });

      router.refresh();
    },

    onError(err: any) {
      toast({
        title: 'Post update failed',

        variant: 'destructive',
      });
    },
  });

  return (
    <div className="flex flex-col gap-4">
      <Input
        placeholder="Title"
        value={initPost.title}
        onChange={(e) =>
          setInitPost((prev: any) => ({ ...prev, title: e.target.value }))
        }
      />

      <select
        value={initPost.suspended}
        onChange={(e) =>
          setInitPost((prev: any) => ({
            ...prev,
            suspended: e.target.value,
          }))
        }
        className="w-full h-10 rounded-md border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-transparent "
      >
        <option value="true">Yes</option>
        <option value="false">No</option>
      </select>

      <Button
        variant="default"
        onClick={() => {
          updatePost.mutate(postId as any);
        }}
      >
        Update
      </Button>
    </div>
  );
};

export default PostDetails;

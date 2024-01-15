'use client';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { toast } from '@/hooks/use-toast';
import axios from 'axios';
import { useParams, useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation';
import React from 'react';

const Page = () => {
  const params = useParams();

  const searchParams = useSearchParams();
  const router = useRouter();

  const [input, setInput] = React.useState<string>('');
  const [isLoading, setIsLoading] = React.useState<boolean>(false);

  //   get organizationId from query params

  const organizationId = searchParams.get('organizationId');

  const createTopic = async () => {
    try {
      const { data } = await axios.post('/api/organization/topic/create', {
        name: input,
        organizationId,
      });
      router.push(`/organization/${params.slug}`);

      return toast({
        title: 'Success',
        description: 'Topic created.',
        variant: 'default',
      });
    } catch (error) {
      return toast({
        title: 'Error',
        description: 'Could not create topic.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="container flex items-center h-full max-w-3xl mx-auto">
      <div className="relative bg-white w-full h-fit p-4 rounded-lg space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-semibold">Create a Topic</h1>
        </div>

        <hr className="bg-red-500 h-px" />

        <div>
          <p className="text-lg font-medium">Name</p>
          <p className="text-xs pb-2">
            Topic names including capitalization cannot be changed. (no spaces)
          </p>
          <div className="relative">
            <p className="absolute text-sm left-2 w-8 inset-y-0 grid place-items-center text-zinc-400">
              organization/
            </p>
            <Input
              value={input}
              onChange={(e) => {
                // // dont count space
                const inputValue = e.target.value;
                // Remove all spaces from the input value
                const newValue = inputValue.replace(/\s/g, '');
                setInput(newValue);
              }}
              className="pl-24"
            />
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <Button variant="subtle" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button
            isLoading={isLoading}
            disabled={input.length === 0}
            onClick={() => createTopic()}
          >
            Create Topic
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Page;

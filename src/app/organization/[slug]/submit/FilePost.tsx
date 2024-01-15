'use client';
import { Input } from '@/components/ui/Input';
import { toast } from '@/hooks/use-toast';
import supabase from '@/supabase/supabaseConfig';
import { Topic } from '@prisma/client';
import axios from 'axios';
import { nanoid } from 'nanoid';
import React, { useState } from 'react';

interface FilePostProps {
  organizationId: string;
  topics: Topic[];
}

const FilePost = ({ organizationId, topics }: FilePostProps) => {
  const [selectedTopic, setSelectedTopic] = useState<string>('');
  const [files, setFiles] = useState<FileList | null>(null);
  const [title, setTitle] = useState<string>('');

  let list: any = [];

  const upload = async () => {
    if (!files) return;

    for (let i = 0; i < files.length; i++) {
      const { data: fData, error } = await supabase.storage
        .from('hyper0')
        .upload(
          `${organizationId}/resources/${nanoid(10) + files[i].name}`,
          files[i]
        );

      if (error) {
        toast({
          title: 'Something went wrong.',
          description: 'Your file was not published. Please try again.',
          variant: 'destructive',
        });
        return;
      } else {
        list.push({
          fileKey: fData.path,
          fileUrl: `${process.env.NEXT_PUBLIC_SUPABASE_OBJECT_STORAGE_URL}/${fData.path}`,
        });
      }
    }
  };

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFiles(e.target.files);
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    await upload();

    if (!selectedTopic) return;

    if (!list || list.length === 0) {
      toast({
        title: 'No File Uploaded',
        description: 'Your file was not published. Please try again.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const { data } = await axios.post('/api/organization/post/create', {
        title,
        organizationId,
        topicId: selectedTopic,
        files: list,
      });

      if (data.error) {
        toast({
          title: 'Something went wrong.',
          description: data.error,
          variant: 'destructive',
        });
        return;
      }

      toast({
        title: 'Success!',
        description: 'Your file was published.',
      });
    } catch (error) {
      toast({
        title: 'Something went wrong.',
        description: 'Your file was not published. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="w-full">
      <form onSubmit={onSubmit} id="organization-post-form" className="w-full">
        <div className="flex flex-col items-start gap-6 ">
          <select
            onChange={(e) => setSelectedTopic(e.target.value)}
            className="w-[180px] py-2 px-2 rounded-md border border-zinc-200 bg-zinc-50 text-zinc-900 dark:bg-zinc-900 dark:text-zinc-50"
          >
            <option value="">Select a topic</option>
            {topics.map((topic) => (
              <option key={topic.id} value={topic.id}>
                {topic.name}
              </option>
            ))}
          </select>
          <Input
            onChange={(e) => setTitle(e.target.value)}
            name="title"
            placeholder="Title"
            type="text"
            className="min-w-full"
          />
          <Input
            onChange={onChange}
            name="file"
            type="file"
            className="min-w-full"
            multiple
            draggable
          />{' '}
        </div>
      </form>
    </div>
  );
};

export default FilePost;

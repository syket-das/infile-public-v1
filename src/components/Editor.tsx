'use client';

import EditorJS from '@editorjs/editorjs';
import { zodResolver } from '@hookform/resolvers/zod';
import { usePathname, useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import TextareaAutosize from 'react-textarea-autosize';
import { z } from 'zod';

import { toast } from '@/hooks/use-toast';
import { PostCreationRequest, PostValidator } from '@/lib/validators/post';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';

import '@/styles/editor.css';
import { Topic } from '@prisma/client';
import supabase from '@/supabase/supabaseConfig';
import { nanoid } from 'nanoid';
type FormData = z.infer<typeof PostValidator>;

interface EditorProps {
  organizationId: string;
  topics: Topic[];
}

export const Editor: React.FC<EditorProps> = ({ organizationId, topics }) => {
  const [selectedTopic, setSelectedTopic] = useState<string>('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(PostValidator),
    defaultValues: {
      organizationId,
      title: '',
      content: null,
      topicId: '',
    },
  });

  const ref = useRef<EditorJS>();
  const _titleRef = useRef<HTMLTextAreaElement>(null);
  const router = useRouter();
  const [isMounted, setIsMounted] = useState<boolean>(false);
  const pathname = usePathname();

  const { mutate: createPost } = useMutation({
    mutationFn: async ({
      title,
      content,
      organizationId,
      topicId,
    }: PostCreationRequest) => {
      const payload: PostCreationRequest = {
        title,
        content,
        organizationId,
        topicId,
      };
      const { data } = await axios.post(
        '/api/organization/post/create',
        payload
      );
      return data;
    },
    onError: () => {
      return toast({
        title: 'Something went wrong.',
        description: 'Your post was not published. Please try again.',
        variant: 'destructive',
      });
    },
    onSuccess: () => {
      // turn pathname /organization/mycommunity/submit into /organization/mycommunity
      const newPathname = pathname.split('/').slice(0, -1).join('/');
      router.push(newPathname);

      router.refresh();

      return toast({
        description: 'Your post has been published.',
      });
    },
  });

  const initializeEditor = useCallback(async () => {
    const EditorJS = (await import('@editorjs/editorjs')).default;
    const Header = (await import('@editorjs/header')).default;
    const Embed = (await import('@editorjs/embed')).default;
    const Table = (await import('@editorjs/table')).default;
    const List = (await import('@editorjs/list')).default;
    const Code = (await import('@editorjs/code')).default;
    const LinkTool = (await import('@editorjs/link')).default;
    const InlineCode = (await import('@editorjs/inline-code')).default;
    const ImageTool = (await import('@editorjs/image')).default;

    if (!ref.current) {
      const editor = new EditorJS({
        holder: 'editor',
        onReady() {
          ref.current = editor;
        },
        placeholder: 'Type here to write your post...',
        inlineToolbar: true,
        data: { blocks: [] },
        tools: {
          header: Header,
          linkTool: {
            class: LinkTool,
            config: {
              endpoint: '/api/link',
            },
          },
          image: {
            class: ImageTool,
            config: {
              uploader: {
                async uploadByFile(file: File) {
                  const { data: fData, error } = await supabase.storage
                    .from('hyper0')
                    .upload(
                      `${organizationId}/posts/${nanoid(10) + file.name}`,
                      file
                    );

                  if (error) {
                    throw error;
                  } else {
                    return {
                      success: 1,
                      file: {
                        url: `${process.env.NEXT_PUBLIC_SUPABASE_OBJECT_STORAGE_URL}/${fData.path}`,
                      },
                    };
                  }
                },
              },
            },
          },
          list: List,
          code: Code,
          inlineCode: InlineCode,
          table: Table,
          embed: Embed,
        },
      });
    }
  }, []);

  useEffect(() => {
    if (Object.keys(errors).length) {
      for (const [_key, value] of Object.entries(errors)) {
        value;
        toast({
          title: 'Something went wrong.',
          description: (value as { message: string }).message,
          variant: 'destructive',
        });
      }
    }
  }, [errors]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsMounted(true);
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      await initializeEditor();

      setTimeout(() => {
        _titleRef?.current?.focus();
      }, 0);
    };

    if (isMounted) {
      init();

      return () => {
        ref.current?.destroy();
        ref.current = undefined;
      };
    }
  }, [isMounted, initializeEditor]);

  async function onSubmit(data: FormData) {
    const blocks = await ref.current?.save();

    const payload: PostCreationRequest = {
      title: data.title,
      content: blocks,
      organizationId,
      topicId: selectedTopic,
    };

    createPost(payload);
  }

  if (!isMounted) {
    return null;
  }

  const { ref: titleRef, ...rest } = register('title');

  return (
    <>
      <form
        id="organization-post-form"
        className="w-fit"
        onSubmit={handleSubmit(onSubmit)}
      >
        <div className="mb-8">
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
        </div>
        <div className="w-full p-4 bg-zinc-50 rounded-lg border border-zinc-200">
          <div className="prose prose-stone dark:prose-invert">
            <TextareaAutosize
              ref={(e) => {
                titleRef(e);
                // @ts-ignore
                _titleRef.current = e;
              }}
              {...rest}
              placeholder="Title"
              className="w-full resize-none appearance-none overflow-hidden bg-transparent text-5xl font-bold focus:outline-none"
            />
            <div id="editor" className="min-h-[500px]" />
            <p className="text-sm text-gray-500">
              Use{' '}
              <kbd className="rounded-md border bg-muted px-1 text-xs uppercase">
                Tab
              </kbd>{' '}
              to open the command menu.
            </p>
          </div>
        </div>
      </form>
    </>
  );
};

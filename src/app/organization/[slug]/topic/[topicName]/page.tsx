'use client';
import { useRouter } from 'next/navigation';
import React, { useEffect } from 'react';

interface PageProps {
  params: {
    slug: string;
    topicName: string;
  };
}

const Page = ({ params: { slug, topicName } }: PageProps) => {
  const router = useRouter();
  useEffect(() => {
    setTimeout(() => {
      router.refresh();
    }, 2000);
  }, []);

  return <></>;
};

export default Page;

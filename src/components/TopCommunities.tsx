import { db } from '@/lib/db';
import Image from 'next/image';
import React from 'react';

const TopCommunities = async () => {
  const orgs = await db.organization.findMany({
    take: 5,
    include: {
      posts: true,
      subscribers: true,
    },
  });

  return (
    <div className="flex gap-8 flex-col w-full ">
      <h2 className="text-2xl font-bold">Top Communities</h2>

      <div className="flex gap-4 overflow-auto " id="no-scrollbar">
        {orgs.map((item, index) => (
          <div
            key={index}
            className=" min-w-[250px] overflow-hidden h-fit rounded-lg border border-gray-200 order-first md:order-last cursor-pointer"
          >
            <a href={`/organization/${item.name}`}>
              <div className="bg-emerald-100 px-6 py-4">
                <p className="font-semibold py-3 flex items-center gap-1.5">
                  <Image
                    src="/assets/reactjs.svg"
                    width={24}
                    height={24}
                    className=" border rounded-full"
                    alt="reactjs"
                  />{' '}
                  <span className="text-emerald-500">org/</span>
                  {item.name}
                </p>

                <div className="flex items-center gap-1.5">
                  <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                  <p className="text-sm text-zinc-500">
                    {item.subscribers.length} members
                  </p>
                </div>
              </div>
            </a>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TopCommunities;

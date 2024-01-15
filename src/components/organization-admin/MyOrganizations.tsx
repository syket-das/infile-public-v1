'use client';
import { Organization } from '@prisma/client';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/Tabs';

import Basic from './basic';
import Users from './users';
import Posts from './posts';
import { Loader } from 'lucide-react';

const MyOrganizations = () => {
  const [selectedOrganization, setSelectedOrganization] =
    React.useState<any>('');

  const [organizationDetails, setOrganizationDetails] =
    React.useState<any>(null);

  const { isLoading, error, data } = useQuery({
    queryKey: ['userDetails'],
    queryFn: async () => {
      const { data } = await axios.get('/api/organization-admin');
      return data;
    },
  });

  if (isLoading)
    return (
      <div className="w-full flex justify-center mt-[25%]">
        <Loader className="animate-spin " height={30} width={30} />
      </div>
    );

  return (
    <div className="min-w-full">
      <div className="flex overflow-auto gap-4">
        {data?.createdOrganizations?.map((organization: Organization) => (
          <div
            key={organization.id}
            className={` border border-green-200 rounded-lg shadow-lg p-4 cursor-pointer hover:shadow-xl transition duration-200  ${
              selectedOrganization === organization.name ? 'bg-green-100' : ''
            }`}
            onClick={() => setSelectedOrganization(organization.name)}
          >
            <span>{organization.name}</span>
          </div>
        ))}
      </div>

      {selectedOrganization ? (
        <div className="mt-4 min-w-full ">
          <Tabs defaultValue="basic" className="">
            <TabsList className="ml-[30%]">
              <TabsTrigger value="basic">Basic</TabsTrigger>
              <TabsTrigger value="users">Members</TabsTrigger>
              <TabsTrigger value="posts">Posts</TabsTrigger>
            </TabsList>
            <TabsContent value="basic">
              <Basic />
            </TabsContent>
            <TabsContent value="users">
              <Users organizationName={selectedOrganization} />
            </TabsContent>

            <TabsContent value="posts">
              <Posts organizationName={selectedOrganization} />
            </TabsContent>
          </Tabs>
        </div>
      ) : (
        <div className="text-center mt-4 text-2xl text-red-500">
          No Organization selected
        </div>
      )}
    </div>
  );
};

export default MyOrganizations;

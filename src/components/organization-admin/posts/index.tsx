'use client';
import React from 'react';
import Select from 'react-select';
import { DataGrid, GridColDef, GridValueGetterParams } from '@mui/x-data-grid';
import DataGridCustomToolbar from '@/components/data-grid/DataGridCustomToolbar';
import { Button } from '@/components/ui/Button';
import { useMutation, useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/Dialog';
import PostDetails from './PostDetails';

const Posts = ({ organizationName }: { organizationName: string }) => {
  const [posts, setPosts] = React.useState<any[]>([]);
  const router = useRouter();
  const { toast } = useToast();
  const columns: GridColDef[] = [
    {
      field: 'title',
      headerName: 'Title',
      width: 250,
      renderCell(params) {
        return <p className="break-all overflow-clip">{params.row.title}</p>;
      },
    },
    {
      field: 'author',
      headerName: 'Author',
      width: 150,
      valueGetter(params) {
        return params.row?.author?.name;
      },
    },
    {
      field: 'topic',
      headerName: 'Topic',
      width: 200,
      valueGetter(params) {
        return params.row?.Topic?.name;
      },
    },

    {
      field: 'createdAt',
      headerName: 'Created At',
      width: 200,
      valueGetter(params) {
        return new Date(params.row.createdAt).toLocaleDateString();
      },
    },
    {
      field: 'suspended',
      headerName: 'Suspended',
      width: 200,
      valueGetter(params) {
        return params.row.suspended === true ? 'Yes' : 'No';
      },
    },

    {
      field: 'actions',
      headerName: 'Actions',
      width: 200,
      renderCell(params) {
        return (
          <div className="flex gap-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">Edit</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px] ">
                <DialogHeader>
                  <DialogTitle>Post Details</DialogTitle>
                  <DialogDescription>
                    Post Details. You can view and edit the post details here.
                  </DialogDescription>
                </DialogHeader>
                <PostDetails
                  postId={params.row.id}
                  organizationName={organizationName}
                />
              </DialogContent>
            </Dialog>{' '}
            <Button className="bg-red-500 hover:bg-red-600">Disable</Button>
          </div>
        );
      },
    },
  ];

  const { isLoading, error, data } = useQuery({
    queryKey: ['organizationAdminOrgFetch'],
    queryFn: async () => {
      const { data } = await axios.get(
        `/api/organization-admin/${organizationName}`
      );

      return data;
    },
  });

  const updatePost = useMutation({
    mutationFn: async (postId) => {
      const { data } = await axios.patch(
        `/api/organization-admin/${organizationName}/posts/${postId}`
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
  });

  React.useEffect(() => {
    if (data?.posts) {
      setPosts(data.posts);
    }
  }, [data]);

  return (
    <div>
      <div className="mt-8">
        <DataGrid
          loading={isLoading}
          style={{
            minHeight: '500px',
            maxHeight: '1000px',
          }}
          rowHeight={100}
          rows={posts}
          columns={columns}
          checkboxSelection
          components={{
            Toolbar: DataGridCustomToolbar,
          }}
          getRowClassName={(params) => {
            return params.row.suspended === true ? 'bg-red-100' : '';
          }}
        />
      </div>
    </div>
  );
};

export default Posts;

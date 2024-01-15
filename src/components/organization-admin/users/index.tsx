'use client';
import React, { useEffect, useState } from 'react';
import { DataGrid, GridColDef, GridValueGetterParams } from '@mui/x-data-grid';
import DataGridCustomToolbar from '@/components/data-grid/DataGridCustomToolbar';
import { useMutation, useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Button } from '@/components/ui/Button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/Label';
import { Role } from '@prisma/client';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/Dialog';
import RegisterUsers from './RegisterUsers';
import { useToast } from '@/hooks/use-toast';
import ManageUsers from './ManageUsers';

const Users = ({ organizationName }: { organizationName: string }) => {
  const [users, setUsers] = useState([]);

  const { toast } = useToast();

  const { isLoading, error, data } = useQuery({
    queryKey: ['organizationAdminOrgFetch'],
    queryFn: async () => {
      const { data } = await axios.get(
        `/api/organization-admin/${organizationName}`
      );

      return data;
    },
  });

  const unsubscribe = useMutation({
    mutationFn: async (userId) => {
      alert(userId);
      const { data } = await axios.patch(
        `/api/organization-admin/${organizationName}/unsubscribe`,
        {
          userId,
        }
      );

      return data;
    },

    onSuccess: () => {
      toast({
        title: 'Unsubscribed',
        description: 'User has been unsubscribed',
        variant: 'default',
      });
    },
  });

  useEffect(() => {
    if (data) {
      const subs = data.subscribers;
      setUsers(subs);
    }
  }, [data]);

  const columns: GridColDef[] = [
    {
      field: 'name',
      headerName: 'Name',

      valueGetter: (params: GridValueGetterParams) => params.row.user?.name,
      width: 200,
    },
    {
      field: 'email',
      headerName: 'Email',

      valueGetter: (params: GridValueGetterParams) => params.row.user.email,
      width: 200,
    },
    {
      field: 'department',
      headerName: 'Department',
      width: 200,
    },
    {
      field: 'uid',
      headerName: 'UID',
      width: 150,
    },
    {
      field: 'uname',
      headerName: 'Uname',
      width: 250,
    },

    {
      field: 'role',
      headerName: 'Role',
      width: 100,
    },

    {
      field: 'action',
      headerName: 'Action',
      width: 200,

      renderCell: (params) => (
        <div className="flex gap-2">
          <Button className="bg-green-500 hover:bg-green-600">Edit</Button>
          <Button
            className="bg-red-500 hover:bg-red-600"
            onClick={() => {
              unsubscribe.mutate(params.row.user.id);
            }}
          >
            Remove
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className=" max-w-full ">
      <div className="flex justify-between items-center my-4">
        <RadioGroup
          defaultValue="ALL"
          orientation="horizontal"
          className="flex my-4 gap-2"
        >
          {['ALL', Role.ADMIN, Role.FACULTY, Role.MODERATOR, Role.USER].map(
            (role, i) => (
              <div
                key={i}
                className="flex items-center space-x-2"
                onClick={(e) => {
                  const target = e.target as HTMLInputElement;
                  if (target.value === 'ALL') {
                    return setUsers(data.subscribers);
                  }

                  setUsers(
                    data.subscribers.filter(
                      (user: any) => user.role === target.value
                    )
                  );
                }}
              >
                <RadioGroupItem value={role} id={role} />
                <Label htmlFor={role}>{role}</Label>
              </div>
            )
          )}
        </RadioGroup>

        <div className="flex gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">Manage Users</Button>
            </DialogTrigger>
            <DialogContent className="min-w-[90vw] max-h-[80vh] ">
              <DialogHeader>
                <DialogTitle>Remove Or Add Users</DialogTitle>
                <DialogDescription>
                  Remove or add users to your organization.
                </DialogDescription>
              </DialogHeader>
              <ManageUsers organizationName={organizationName} />
            </DialogContent>
          </Dialog>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">Add Members</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] ">
              <DialogHeader>
                <DialogTitle>Create & Add</DialogTitle>
                <DialogDescription>
                  Create new members and add them to your organization.
                </DialogDescription>
              </DialogHeader>
              <RegisterUsers organizationName={organizationName} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <DataGrid
        style={{
          minHeight: '500px',
          maxHeight: '800px',
        }}
        loading={isLoading}
        rows={users}
        columns={columns}
        checkboxSelection
        components={{
          Toolbar: DataGridCustomToolbar,
        }}
        getRowId={
          //@ts-ignore
          (row) => row.user.id
        }
        scrollbarSize={10}
      />
    </div>
  );
};

export default Users;

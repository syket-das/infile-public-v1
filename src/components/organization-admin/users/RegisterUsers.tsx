'use client';
import React, { useEffect, useState } from 'react';
import { Input } from '@/components/ui/Input';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select';
import { Role } from '@prisma/client';
import { Button } from '@/components/ui/Button';
import axios from 'axios';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';

type User = {
  name: string;
  email: string;
  password?: string;
  username?: string;
  image?: string;
  organization: {
    name: string;
    role?: Role;
    uid?: string;
    position?: string;
    department?: string;
    phone?: string;
    uname?: string;
  };
};

interface Props {
  organizationName: string;
}

const RegisterUsers = ({ organizationName }: Props) => {
  const router = useRouter();
  const { toast } = useToast();
  const [jsonValue, setJsonValue] = useState([]);

  const [file, setFile] = useState<any>(null);

  useEffect(() => {
    if (file as any) {
      //  check valid json

      if (file === null) return;

      const json = JSON.parse(file);
      // now find users array
      const users = json.users;
      // now set json value
      setJsonValue(users);
    }
  }, [file]);

  const [user, setUser] = useState<User>({
    name: '',
    email: '',
    organization: {
      name: organizationName,
      phone: '',
      department: '',
      position: '',
    },
  });

  const onsubmitJson = async () => {
    try {
      const { data } = await axios.post(
        '/api/auth/register/organization-admin/register-and-subscribe/multiple',
        {
          users: jsonValue,
          organizationName,
        }
      );

      toast({
        title: 'Success',
        description: data.message || 'Users Registered and Subscribed',
        variant: 'default',
      });
      router.refresh();
    } catch (error: any) {
      toast({
        title: 'Error',
        description:
          error.response.data.message || error.message || 'Error Occured',
        variant: 'destructive',
      });
    }
  };

  const onsubmit = async () => {
    try {
      const { data } = await axios.post(
        '/api/auth/register/organization-admin/register-and-subscribe',
        {
          user,
        }
      );

      toast({
        title: 'Success',
        description: data.message || 'User Registered',
        variant: 'default',
      });
      router.refresh();
    } catch (error: any) {
      toast({
        title: 'Error',
        description:
          error.response.data.message || error.message || 'Error Occured',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="w-full">
      {' '}
      <div className="w-full h-full ">
        <Tabs defaultValue="single">
          <TabsList>
            <TabsTrigger value="single">Single</TabsTrigger>
            <TabsTrigger value="multiple">Multiple</TabsTrigger>
          </TabsList>
          <TabsContent value="single">
            <div className="flex flex-col gap-4 ">
              <Input
                placeholder="Name"
                onChange={(e) => setUser({ ...user, name: e.target.value })}
                value={user.name}
                required
              />
              <Input
                placeholder="Email"
                onChange={(e) => setUser({ ...user, email: e.target.value })}
                value={user.email}
                required
              />
              <Input
                placeholder="UID"
                onChange={(e) =>
                  setUser({
                    ...user,
                    organization: { ...user.organization, uid: e.target.value },
                  })
                }
                value={user.organization.uid}
              />
              <Input
                placeholder="UName"
                onChange={(e) =>
                  setUser({
                    ...user,
                    organization: {
                      ...user.organization,
                      uname: e.target.value,
                    },
                  })
                }
                value={user.organization.uname}
              />

              <Input
                placeholder="Department"
                onChange={(e) =>
                  setUser({
                    ...user,
                    organization: {
                      ...user.organization,
                      department: e.target.value,
                    },
                  })
                }
                value={user.organization.department}
              />
              <Input
                placeholder="Position"
                onChange={(e) =>
                  setUser({
                    ...user,
                    organization: {
                      ...user.organization,
                      position: e.target.value,
                    },
                  })
                }
                value={user.organization.position}
              />
              <Select
                onValueChange={(value) =>
                  setUser({
                    ...user,
                    organization: { ...user.organization, role: value as Role },
                  })
                }
              >
                <SelectTrigger className="">
                  <SelectValue placeholder="Select a Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Roles</SelectLabel>
                    <SelectItem value={Role.USER}>User</SelectItem>
                    <SelectItem value={Role.FACULTY}>Faculty</SelectItem>
                    <SelectItem value={Role.MODERATOR}>Moderator</SelectItem>
                    <SelectItem value={Role.ADMIN}>Admin</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>

              <div className="flex">
                <Button
                  onClick={onsubmit}
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
                >
                  Register
                </Button>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="multiple">
            <div className="flex flex-col gap-4 ">
              <input
                type="file"
                onChange={(e: any) => {
                  const file = e.target.files[0];
                  // check its a json file or not

                  if (file.type !== 'application/json') {
                    toast({
                      title: 'Error',
                      description: 'Please upload a valid JSON file',
                      variant: 'destructive',
                    });

                    setFile(null);
                    return;
                  }

                  const reader = new FileReader();

                  reader.readAsText(file);
                  reader.onload = () => {
                    setFile(reader.result as any);
                  };
                  reader.onerror = () => {
                    toast({
                      title: 'Error',
                      description: 'Error Occured',
                      variant: 'destructive',
                    });
                    setFile(null);
                  };
                }}
              />

              <textarea
                placeholder="JSON"
                onChange={(e: any) => setJsonValue(e.target.value)}
                value={JSON.stringify(jsonValue, null, 2)}
                required
                rows={10}
                className="w-full h-full resize-none border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              <div className="flex">
                <Button
                  onClick={onsubmitJson}
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
                >
                  Register
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default RegisterUsers;

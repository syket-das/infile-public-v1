'use client';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';
import React, { useEffect, useState } from 'react';

const ManageUsers = ({ organizationName }: { organizationName: string }) => {
  const { toast } = useToast();
  const [faculties, setFaculties] = useState([]);
  const [jsonValue, setJsonValue] = useState<any>([]);

  const [file, setFile] = useState<any>(null);

  const [data, setData] = useState<any>(null);

  console.log(data);

  useEffect(() => {
    if (file as any) {
      if (file === null) return;

      const json = JSON.parse(file);
      const faculties = json.faculties;
      setJsonValue(faculties);
    }
  }, [file]);

  const onCheck = async () => {
    try {
      const { data } = await axios.post(
        `/api/organization-admin/${organizationName}/verify/faculties`,
        {
          faculties: jsonValue,
        }
      );

      setData(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Error Occured',
        variant: 'destructive',
      });
    }
  };

  const onProceed = async () => {
    try {
      const { data: d } = await axios.post(
        '/api/auth/register/organization-admin/register-and-subscribe/multiple',
        {
          users: data.toAdd,
          organizationName,
        }
      );

      toast({
        title: 'Success',
        description: 'Faculties added',
        variant: 'default',
      });
    } catch (error: any) {
      console.log(error);

      toast({
        title: 'Error',
        description:
          error.response.data.message || error.message || 'Error Occured',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-w-[80vw]">
      <div className="my-6 flex gap-4">
        <Input
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
          placeholder="file"
          type="file"
          multiple={false}
        />
        <Button variant={'outline'} onClick={onCheck}>
          Import
        </Button>
      </div>

      <div className="my-4">
        <div className="flex justify-between gap-4">
          <div className="w-1/3">
            <h2>Current</h2>
            <ul>
              {data &&
                data.currentFaculties.map((faculty: any, i: number) => (
                  <li key={i}>{faculty.user.email}</li>
                ))}
            </ul>
          </div>
          <div className="w-1/3">
            <h2>To Add</h2>
            <ul>
              {data &&
                data.toAdd.map((faculty: any, i: number) => (
                  <li key={i}>{faculty.email}</li>
                ))}
            </ul>
          </div>
          <div className="w-1/3">
            <h2>To remove</h2>
            <ul>
              {data &&
                data.toRemove.map((faculty: any, i: number) => (
                  <li key={i}>{faculty.user.email}</li>
                ))}
            </ul>
          </div>
        </div>

        {data && (
          <Button onClick={onProceed} className="ml-auto my-4">
            Proceed now
          </Button>
        )}
      </div>
    </div>
  );
};

export default ManageUsers;

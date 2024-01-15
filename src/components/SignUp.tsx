'use client';
import { Icons } from '@/components/Icons';
import UserAuthForm from '@/components/UserAuthForm';
import Link from 'next/link';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { Separator } from './ui/Separator';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';

const SignUp = () => {
  const { toast } = useToast();
  const [data, setData] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
  });

  async function handleFormAction(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (data.password.length < 6) {
      return toast({
        title: 'Password must be at least 6 characters long',
        variant: 'destructive',
      });
    }

    if (data.password !== data.password_confirmation) {
      return toast({
        title: 'Passwords do not match',
        variant: 'destructive',
      });
    }

    try {
      const res = await axios.post('/api/auth/register', data);

      if (res.status === 201) {
        toast({
          title: 'Account created successfully',
          description: 'You can now sign in to your account',
          variant: 'default',
        });
      }
    } catch (error: any) {
      toast({
        title: 'Something went wrong',
        description: 'Please try again later',
        variant: 'destructive',
      });
    }
  }

  return (
    <div className="container mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[400px]">
      <div className="flex flex-col space-y-2 text-center">
        <Icons.logo className="mx-auto h-6 w-6" />
        <h1 className="text-2xl font-semibold tracking-tight">Sign Up</h1>
        <p className="text-sm max-w-xs mx-auto">
          By continuing, you are setting up a INFILE account and agree to our
          User Agreement and Privacy Policy..
        </p>
      </div>

      <form onSubmit={handleFormAction}>
        <div className="flex flex-col gap-4">
          <Input
            placeholder="Full Name"
            type="text"
            name="name"
            onChange={(e) => setData({ ...data, name: e.target.value })}
            value={data.name}
            required
          />
          <Input
            placeholder="Email"
            type="email"
            name="email"
            onChange={(e) => setData({ ...data, email: e.target.value })}
            value={data.email}
            required
          />
          <div className="flex gap-2">
            <Input
              placeholder="Password"
              type="password"
              name="password"
              onChange={(e) => setData({ ...data, password: e.target.value })}
              value={data.password}
              required
            />
            <Input
              placeholder="Confirm Password"
              type="password"
              name="password_confirmation"
              onChange={(e) =>
                setData({ ...data, password_confirmation: e.target.value })
              }
              value={data.password_confirmation}
              required
            />
          </div>

          <Button type="submit" variant="subtle" className="w-full">
            Sign up
          </Button>
        </div>
      </form>
      <Separator></Separator>
      <UserAuthForm />
      <p className="px-8 text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link
          href="/sign-in"
          className="hover:text-brand text-sm underline underline-offset-4"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
};

export default SignUp;

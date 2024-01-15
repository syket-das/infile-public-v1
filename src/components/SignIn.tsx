'use client';
import { Icons } from '@/components/Icons';
import UserAuthForm from '@/components/UserAuthForm';
import Link from 'next/link';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { Separator } from './ui/Separator';
import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { signIn, useSession } from 'next-auth/react';
import { redirect, useRouter } from 'next/navigation';

const SignIn = () => {
  const session = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session.data) {
      redirect('/');
    }
  }, [session.data]);

  const { toast } = useToast();
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSubmit = async () => {
    try {
      setIsLoading(true);

      const response = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      // if (!response?.ok) {
      //   toast({
      //     title: 'Error',
      //     description: response?.error || 'Something went wrong',
      //     variant: 'destructive',
      //   });
      // }
    } catch (error: any) {
      // toast({
      //   title: 'Error',
      //   description: error.message,
      //   variant: 'destructive',
      // });
    } finally {
      setIsLoading(false);
      window.location.reload();
    }
  };

  return (
    <div className="container mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[400px]">
      <div className="flex flex-col space-y-2 text-center">
        <Icons.logo className="mx-auto h-6 w-6" />
        <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
        <p className="text-sm max-w-xs mx-auto">
          By continuing, you are setting up a INFILE account and agree to our
          User Agreement and Privacy Policy.
        </p>
      </div>
      <div className="flex flex-col gap-4">
        <Input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          type="email"
        />
        <Input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          type="password"
        />

        <Button
          isLoading={isLoading}
          onClick={handleSubmit}
          variant="subtle"
          className="w-full"
        >
          {isLoading ? 'Loading...' : 'Sign In'}
        </Button>
      </div>
      <Separator></Separator>
      <UserAuthForm />
      <p className="px-8 text-center text-sm text-muted-foreground">
        New to INFILE?{' '}
        <Link
          href="/sign-up"
          className="hover:text-brand text-sm underline underline-offset-4"
        >
          Sign Up
        </Link>
      </p>
    </div>
  );
};

export default SignIn;

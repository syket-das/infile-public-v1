'use client';
import { Button } from '@/components/ui/Button';
import { SubscribeToOrganizationPayload } from '@/lib/validators/organization';
import { useMutation } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import { useRouter } from 'next/navigation';
import { startTransition } from 'react';
import { useToast } from '../hooks/use-toast';
import { useCustomToasts } from '@/hooks/use-custom-toasts';

interface SubscribeLeaveToggleProps {
  isSubscribed: boolean;
  organizationId: string;
  organizationName: string;
}

const SubscribeLeaveToggle = ({
  isSubscribed,
  organizationId,
  organizationName,
}: SubscribeLeaveToggleProps) => {
  const { toast } = useToast();
  const { loginToast } = useCustomToasts();
  const router = useRouter();

  const { mutate: subscribe, isLoading: isSubLoading } = useMutation({
    mutationFn: async () => {
      const payload: SubscribeToOrganizationPayload = {
        organizationId,
      };

      const { data } = await axios.post('/api/organization/subscribe', payload);
      return data as string;
    },
    onError: (err) => {
      if (err instanceof AxiosError) {
        if (err.response?.status === 401) {
          return loginToast();
        }
      }

      return toast({
        title: 'There was a problem.',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    },
    onSuccess: () => {
      startTransition(() => {
        // Refresh the current route and fetch new data from the server without
        // losing client-side browser or React state.
        router.refresh();
      });
      toast({
        title: 'Subscribed!',
        description: `You are now subscribed to organization/${organizationName}`,
      });
    },
  });

  const { mutate: unsubscribe, isLoading: isUnsubLoading } = useMutation({
    mutationFn: async () => {
      const payload: SubscribeToOrganizationPayload = {
        organizationId,
      };

      const { data } = await axios.post(
        '/api/organization/unsubscribe',
        payload
      );
      return data as string;
    },
    onError: (err: AxiosError) => {
      toast({
        title: 'Error',
        description: err.response?.data as string,
        variant: 'destructive',
      });
    },
    onSuccess: () => {
      startTransition(() => {
        // Refresh the current route and fetch new data from the server without
        // losing client-side browser or React state.
        router.refresh();
      });
      toast({
        title: 'Unsubscribed!',
        description: `You are now unsubscribed from/${organizationName}`,
      });
    },
  });

  return isSubscribed ? (
    <Button
      className="w-full mt-1 mb-4"
      isLoading={isUnsubLoading}
      onClick={() => unsubscribe()}
    >
      Leave community
    </Button>
  ) : (
    <Button
      className="w-full mt-1 mb-4"
      isLoading={isSubLoading}
      onClick={() => subscribe()}
    >
      Join to post
    </Button>
  );
};

export default SubscribeLeaveToggle;

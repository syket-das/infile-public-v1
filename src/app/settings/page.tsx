import { redirect } from 'next/navigation';

import { UserNameForm } from '@/components/UserNameForm';
import { authOptions, getAuthSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import MyOrganizations from '@/components/organization-admin/MyOrganizations';

export const metadata = {
  title: 'Settings',
  description: 'Manage account and website settings.',
};

export default async function SettingsPage() {
  const session = await getAuthSession();

  if (!session?.user) {
    redirect(authOptions?.pages?.signIn || '/login');
  }

  const userDetails = await db.user.findFirst({
    where: {
      id: session.user.id,
    },
  });

  if (!userDetails) {
    redirect('/login');
  }

  return (
    <div className="max-w-screen mx-auto py-12">
      <div className="grid items-start gap-8">
        <Tabs defaultValue="account" className="w-full flex gap-4">
          <TabsList className="flex-col min-h-[300px] justify-start gap-y-6 pt-2">
            <TabsTrigger value="account">Account</TabsTrigger>
            <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
            <TabsTrigger value="organization">My Organizations</TabsTrigger>
          </TabsList>
          <TabsContent value="account">
            <div className="grid gap-10">
              <UserNameForm
                user={{
                  id: session.user.id,
                  username: session.user.username || '',
                }}
              />
            </div>
          </TabsContent>
          <TabsContent value="organization" className="w-full">
            <MyOrganizations />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

/*eslint-disable*/
'use client';

import DashboardLayout from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { User } from '@/lib/api';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Notifications from './components/notification-settings';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/auth';
import { toast } from 'sonner';

interface Props {
  user: User | null | undefined;
  userDetails: { [x: string]: any } | null;
}

export default function Settings(props: Props) {
  const { user, refreshUser } = useAuth();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitName = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const formData = new FormData(e.currentTarget);
      const fullName = formData.get('fullName') as string;
      
      // TODO: Implement API call to update user name
      toast.success('Name update feature coming soon!');
      
    } catch (error) {
      toast.error('Failed to update name');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitEmail = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const formData = new FormData(e.currentTarget);
      const newEmail = formData.get('newEmail') as string;
      
      // TODO: Implement API call to update user email
      toast.success('Email update feature coming soon!');
      
    } catch (error) {
      toast.error('Failed to update email');
    } finally {
      setIsSubmitting(false);
    }
  };

  const notifications = [
    { message: 'Your call has been confirmed.', time: '1 hour ago' },
    { message: 'You have a new message!', time: '1 hour ago' },
    { message: 'Your subscription is expiring soon!', time: '2 hours ago' }
  ];

  const currentUser = user || props.user;

  return (
    <DashboardLayout
      user={currentUser}
      userDetails={props.userDetails}
      title="Account Settings"
      description="Profile settings."
    >
      <div className="relative mx-auto flex w-max max-w-full flex-col md:pt-[unset] lg:pt-[100px] lg:pb-[100px]">
        <div className="maw-w-full mx-auto w-full flex-col justify-center md:w-full md:flex-row xl:w-full">
          <Card
            className={
              'mb-5 h-min flex items-center aligh-center max-w-full py-8 px-4 dark:border-zinc-800'
            }
          >
            <Avatar className="min-h-[68px] min-w-[68px]">
              <AvatarImage src="" />
              <AvatarFallback className="text-2xl font-bold dark:text-zinc-950">
                {currentUser?.username ? currentUser.username[0].toUpperCase() : 'U'}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-xl font-extrabold text-zinc-950 leading-[100%] dark:text-white pl-4 md:text-3xl">
                {currentUser?.username || 'User'}
              </p>
              <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 md:mt-2 pl-4 md:text-base">
                Insurance Member
              </p>
            </div>
          </Card>
          <Card
            className={
              'mb-5 h-min max-w-full pt-8 pb-6 px-6 dark:border-zinc-800'
            }
          >
            <p className="text-xl font-extrabold text-zinc-950 dark:text-white md:text-3xl">
              Account Details
            </p>
            <p className="mb-6 mt-1 text-sm font-medium text-zinc-500 dark:text-zinc-400 md:mt-4 md:text-base">
              Here you can change your account information
            </p>
            <label
              className="mb-3 flex cursor-pointer px-2.5 font-bold leading-none text-zinc-950 dark:text-white"
              htmlFor={'name'}
            >
              Your Username
              <p className="ml-1 mt-[1px] text-sm font-medium leading-none text-zinc-500 dark:text-zinc-400">
                (30 characters maximum)
              </p>
            </label>
            <div className="mb-8 flex flex-col md:flex-row">
              <form
                className="w-full"
                id="nameForm"
                onSubmit={handleSubmitName}
              >
                <Input
                  type="text"
                  name="fullName"
                  defaultValue={currentUser?.username || ''}
                  placeholder="Please enter your username"
                  className={`mb-2 mr-4 flex h-full w-full px-4 py-4 outline-none md:mb-0`}
                  disabled={isSubmitting}
                />
              </form>
              <Button
                className="flex h-full max-h-full w-full items-center justify-center rounded-lg px-4 py-4 text-base font-medium md:ms-4 md:w-[300px]"
                form="nameForm"
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Updating...' : 'Update name'}
              </Button>
            </div>

            <label
              className="mb-3 ml-2.5 flex cursor-pointer px-2.5 font-bold leading-none text-zinc-950 dark:text-white"
              htmlFor={'email'}
            >
              Your Email
              <p className="ml-1 mt-[1px] text-sm font-medium leading-none text-zinc-500 dark:text-zinc-400">
                (We will email you to verify the change)
              </p>
            </label>

            <div className="mb-8 flex flex-col md:flex-row">
              <form
                className="w-full"
                id="emailForm"
                onSubmit={handleSubmitEmail}
              >
                <Input
                  placeholder="Please enter your email"
                  defaultValue={currentUser?.email || ''}
                  type="email"
                  name="newEmail"
                  className={`mr-4 flex h-full max-w-full w-full items-center justify-center px-4 py-4 outline-none`}
                  disabled={isSubmitting}
                />
              </form>
              <Button
                className="flex h-full max-h-full w-full items-center justify-center rounded-lg px-4 py-4 text-base md:ms-4 font-medium md:w-[300px]"
                type="submit"
                form="emailForm"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Updating...' : 'Update email'}
              </Button>
            </div>
          </Card>
          <Notifications notifications={notifications} />
        </div>
      </div>
    </DashboardLayout>
  );
}
'use client';

import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import {
  renderThumb,
  renderTrack,
  renderView
} from '@/components/scrollbar/Scrollbar';
import Links from '@/components/sidebar/components/Links';
import SidebarCard from '@/components/sidebar/components/SidebarCard';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { IRoute } from '@/types/types';
import { useRouter } from 'next/navigation';
import React, { PropsWithChildren, useContext } from 'react';
import { Scrollbars } from 'react-custom-scrollbars-2';
import { HiX } from 'react-icons/hi';
import { HiBolt } from 'react-icons/hi2';
import { HiOutlineArrowRightOnRectangle } from 'react-icons/hi2';
import { OpenContext } from '@/contexts/layout';
import { useAuth } from '@/contexts/auth';

export interface SidebarProps extends PropsWithChildren {
  routes: IRoute[];
  [x: string]: any;
}

function Sidebar(props: SidebarProps) {
  const router = useRouter();
  const { routes } = props;
  const { open, setOpen } = useContext(OpenContext);
  const { user, logout } = useAuth();
  
  const handleSignOut = (e: React.MouseEvent) => {
    e.preventDefault();
    logout();
    router.push('/auth');
  };
  // SIDEBAR
  return (
    <div
      className={`lg:!z-99 fixed !z-[99] min-h-full w-[300px] transition-all md:!z-[99] xl:!z-0 ${
        props.variant === 'auth' ? 'xl:hidden' : 'xl:block'
      } ${open ? '' : '-translate-x-[120%] xl:translate-x-[unset]'}`}
    >
      <Card
        className={`m-3 ml-3 h-[96.5vh] w-full overflow-hidden rounded-xl border-blue-200 pe-4 bg-white/95 shadow-lg backdrop-blur-sm dark:bg-slate-800/95 dark:border-slate-600 sm:my-4 sm:mr-4 md:m-5 md:mr-[-50px]`}
      >
        <Scrollbars
          autoHide
          renderTrackVertical={renderTrack}
          renderThumbVertical={renderThumb}
          renderView={renderView}
          universal={true}
        >
          <div className="flex h-full flex-col justify-between">
            <div>
              <span
                className="absolute top-4 block cursor-pointer text-zinc-200 dark:text-white/40 xl:hidden"
                onClick={() => setOpen(false)}
              >
                <HiX />
              </span>
              <div className={`mt-8 flex items-center justify-center animate-fade-in-up animate-delay-200`}>
                <div className="me-2 flex h-[40px] w-[40px] items-center justify-center rounded-xl professional-gradient shadow-lg">
                  <HiBolt className="h-5 w-5 text-white" />
                </div>
                <h5 className="me-2 text-2xl font-bold leading-5 text-display bg-gradient-to-r from-primary to-trust bg-clip-text text-transparent">
                  Insurance RAG
                </h5>
                <Badge
                  variant="outline"
                  className="my-auto w-max px-2 py-0.5 text-xs border-primary/20 bg-primary-soft/20 text-primary-foreground"
                >
                  v1.0
                </Badge>
              </div>
              <div className="mb-8 mt-8 h-px bg-gradient-to-r from-transparent via-border to-transparent animate-fade-in-up animate-delay-300" />
              {/* Nav item */}
              <ul>
                <Links routes={routes} />
              </ul>
            </div>
            {/* Free Horizon Card    */}
            <div className="mb-9 mt-7">
              <div className="flex justify-center">
                <SidebarCard />
              </div>

              {/* Sidebar profile info */}
              <div className="mt-5 flex w-full items-center rounded-xl glass-card border-primary/10 p-4 interactive-lift animate-fade-in-up animate-delay-500">
                <a href="/dashboard/profile" className="transition-transform hover:scale-110">
                  <Avatar className="min-h-10 min-w-10 ring-2 ring-primary/20 ring-offset-2">
                    <AvatarFallback className="font-bold bg-gradient-to-br from-primary to-trust text-white">
                      {user?.username ? user.username[0].toUpperCase() : 'U'}
                    </AvatarFallback>
                  </Avatar>
                </a>
                <a href="/dashboard/profile" className="flex-1">
                  <p className="ml-2 mr-3 flex items-center text-sm font-semibold leading-none text-professional">
                    {user?.username || 'User'}
                  </p>
                  <p className="ml-2 mr-3 text-xs text-muted-foreground mt-1">
                    Insurance Professional
                  </p>
                </a>
                <Button
                  onClick={(e) => handleSignOut(e)}
                  variant="ghost"
                  size="icon-sm"
                  className="ml-auto hover:bg-destructive/10 hover:text-destructive transition-all duration-200"
                  type="submit"
                >
                  <HiOutlineArrowRightOnRectangle className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </Scrollbars>
      </Card>
    </div>
  );
}

// PROPS

export default Sidebar;

'use client';

/* eslint-disable */
import AdminNavbarLinks from './NavbarLinksAdmin';
import NavLink from '@/components/link/NavLink';
import { usePathname } from 'next/navigation';

const getPageTitle = (pathname: string) => {
  switch (pathname) {
    case '/dashboard':
      return 'Dashboard';
    case '/dashboard/documents':
      return 'Documents';
    case '/dashboard/chat':
      return 'Insurance Chat';
    case '/dashboard/profile':
      return 'Profile';
    default:
      return 'Dashboard';
  }
};

export default function AdminNavbar() {
  const pathname = usePathname();
  const brandText = getPageTitle(pathname);

  return (
    <nav
      className={`fixed right-3 top-3 z-[0] flex w-[calc(100vw_-_6%)] flex-row items-center justify-between rounded-lg bg-white/30 py-2 backdrop-blur-xl transition-all dark:bg-transparent md:right-[30px] md:top-4 md:w-[calc(100vw_-_8%)] md:p-2 lg:w-[calc(100vw_-_6%)] xl:top-[20px] xl:w-[calc(100vw_-_365px)] 2xl:w-[calc(100vw_-_380px)]`}
    >
      <div className="ml-[6px]">
        <div className="h-6 md:mb-2 md:w-[224px] md:pt-1">
          <a
            className="hidden text-xs font-normal text-muted-foreground hover:text-primary hover:underline transition-colors duration-200 md:inline"
            href="/dashboard"
          >
            Insurance RAG
            <span className="mx-1 text-xs text-muted-foreground">
              {' '}
              /{' '}
            </span>
          </a>
          <NavLink
            className="text-xs font-normal capitalize text-muted-foreground hover:text-primary hover:underline transition-colors duration-200"
            href="#"
          >
            {brandText}
          </NavLink>
        </div>
        <p className="text-md shrink capitalize md:text-3xl">
          <NavLink
            href="#"
            className="font-bold capitalize text-display bg-gradient-to-r from-primary to-trust bg-clip-text text-transparent hover:from-trust hover:to-primary transition-all duration-300"
          >
            {brandText}
          </NavLink>
        </p>
      </div>
      <div className="w-[154px] min-w-max md:ml-auto md:w-[unset]">
        <AdminNavbarLinks />
      </div>
    </nav>
  );
}

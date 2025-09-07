// Navigation Routes
import { IRoute } from '@/types/types';
import {
  HiOutlineHome,
  HiOutlineChatBubbleLeftRight,
  HiOutlineDocumentText,
  HiOutlineUser,
  HiOutlineCog8Tooth,
  HiOutlineFolderOpen
} from 'react-icons/hi2';

export const routes: IRoute[] = [
  {
    name: 'Dashboard',
    path: '/dashboard',
    icon: <HiOutlineHome className="-mt-[7px] h-4 w-4 stroke-2 text-inherit" />,
    collapse: false
  },
  {
    name: 'Documents',
    path: '/dashboard/documents',
    icon: (
      <HiOutlineFolderOpen className="-mt-[7px] h-4 w-4 stroke-2 text-inherit" />
    ),
    collapse: false
  },
  {
    name: 'Insurance Chat',
    path: '/dashboard/chat',
    icon: (
      <HiOutlineChatBubbleLeftRight className="-mt-[7px] h-4 w-4 stroke-2 text-inherit" />
    ),
    collapse: false
  },
  {
    name: 'Profile',
    path: '/dashboard/profile',
    icon: (
      <HiOutlineUser className="-mt-[7px] h-4 w-4 stroke-2 text-inherit" />
    ),
    collapse: false
  }
];

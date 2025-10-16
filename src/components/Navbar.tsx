"use client"

import Image from 'next/image';
import Link from 'next/link';
import MobileNav from './MobileNav';
import UserButton from '@/components/User-button';
import {SessionProvider} from "next-auth/react"

const Navbar = () => {
  return (
    <nav className="flex-between fixed z-50 w-full bg-dark-1 px-4 sm:px-6 lg:px-10 py-2 lg:py-3">
      <Link href="/" className="flex items-center gap-1">
        <Image
          src="/icons/logo.png"
          width={60}
          height={60}
          alt="Logo"
          className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 xl:w-16 xl:h-16 object-contain"
        />
        <span className="hidden sm:block text-white font-bold text-lg md:text-xl lg:text-2xl ml-2">
          TôIndo
        </span>
      </Link>
      <div className="flex-between gap-3 sm:gap-5">
        
       <SessionProvider>
         <UserButton />
       </SessionProvider>
      
        <MobileNav />
      </div>
    </nav>


  );
};

export default Navbar;

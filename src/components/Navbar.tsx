"use client"

import Image from 'next/image';
import Link from 'next/link';
import MobileNav from './MobileNav';
import UserButton from '@/components/User-button';
import {SessionProvider} from "next-auth/react"

//import MobileNav from './MobileNav';

const Navbar = () => {
  return (
    <nav className="flex-between fixed z-50 w-full bg-dark-1 px-6 py-2 lg:px-10">
      <Link href="/" className="flex items-center gap-1">
        <Image
          src="/icons/logo.png"
          width={70}
          height={70}
          alt="Logo"
          className="max-sm:size-10"
        />
      </Link>
      <div className="flex-between gap-5">
        
       <SessionProvider>
         <UserButton />
       </SessionProvider>
      
        <MobileNav />
      </div>
    </nav>


  );
};

export default Navbar;

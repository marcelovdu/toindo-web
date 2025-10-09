import React, { ReactNode } from 'react'
import Sidebar from '@/components/Sidebar';

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

const RootLayout = async ({children}: {children: ReactNode}) => {

  const session = await getServerSession(authOptions);

  return (
    <main className="relative">
      <div>{/* <Navbar/> */}</div>;

      <div className="flex">
        {session && <Sidebar />}
        
        <section className="flex min-h-screen flex-1 flex-col px-6 pb-6 pt-28 max-md:pb-14 sm:px-14">
          <div className="w-full">{children}</div>
        </section>
      </div>
    </main>
  );
};


export default RootLayout
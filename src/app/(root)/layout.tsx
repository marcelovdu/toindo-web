import React, { ReactNode } from 'react'
import Sidebar from '@/components/Sidebar';

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

const RootLayout = async ({children}: {children: ReactNode}) => {

  const session = await getServerSession(authOptions);

  return (
    <main className="relative min-h-screen">
      <div>{/* <Navbar/> */}</div>;

      <div className="flex flex-col lg:flex-row">
        {session && (
          <div className="lg:sticky lg:top-0 lg:h-screen lg:overflow-y-auto">
            <Sidebar />
          </div>
        )}
        
        <section className="flex min-h-screen flex-1 flex-col px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 pb-6 pt-20 sm:pt-24 md:pt-28 max-md:pb-14">
          <div className="w-full max-w-full">{children}</div>
        </section>
      </div>
    </main>
  );
};


export default RootLayout
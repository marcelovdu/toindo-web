import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Collection from '@/components/Collection'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { getServerSession } from 'next-auth/next'
import { getEventsByUser, getRegisteredEvents } from '@/lib/actions/event.actions'
import { SearchParamProps } from '@/types'
import { redirect } from 'next/navigation'
import React from 'react'

export default async function MyEventsPage({ searchParams }: SearchParamProps) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  if (!userId) {
    redirect('/api/auth/signin'); 
  }

  const organizedPage = Number(searchParams?.organized_page) || 1;
  const registeredPage = Number(searchParams?.registered_page) || 1;

  const organizedEvents = await getEventsByUser({ userId, page: organizedPage, limit: 6 });
  const registeredEvents = await getRegisteredEvents({ userId, page: registeredPage, limit: 6 });
  
  return (
    <>
      <section className="bg-primary-50 bg-dotted-pattern bg-cover bg-center -mt-10 md:py-10">
        <div className="wrapper flex items-center justify-center sm:justify-between">
          <h1 className="text-center text-3xl font-bold text-white sm:text-left">Meus Eventos</h1>
        </div>
      </section>

      <section className="wrapper -mt-12 py-8 md:py-12">
        <Tabs defaultValue="organizando" className="w-full">
          
          <TabsList className="flex w-full rounded-xl bg-gray-800 p-1">
            <TabsTrigger 
              value="organizando" 
              className="w-full rounded-lg py-4 text-sm font-medium text-gray-400 transition-all hover:text-white data-[state=active]:bg-yellow-500 data-[state=active]:text-black data-[state=active]:shadow-sm">
              Organizando
            </TabsTrigger>
            <TabsTrigger 
              value="participando"
              className="w-full rounded-lg py-4 text-sm font-medium text-gray-400 transition-all hover:text-white data-[state=active]:bg-yellow-500 data-[state=active]:text-black data-[state=active]:shadow-sm">
              Participando
            </TabsTrigger>
          </TabsList>

          <TabsContent value="organizando" className="mt-8">
            <Collection 
              data={organizedEvents?.data}
              emptyTitle="Você não organizou nenhum evento ainda"
              emptyStateSubtext="Não se preocupe, comece a criar um agora!"
              collectionType="Events_Organized"
              limit={6}
              page={organizedPage}
              urlParamName="organized_page"
              totalPages={organizedEvents?.totalPages}
              userId={userId}
            />
          </TabsContent>

          <TabsContent value="participando" className="mt-8">
            <Collection 
              data={registeredEvents?.data}
              emptyTitle="Nenhuma inscrição encontrada"
              emptyStateSubtext="Explore os eventos e encontre sua próxima experiência!"
              collectionType="Events_Participated"
              limit={6}
              page={registeredPage}
              urlParamName="registered_page"
              totalPages={registeredEvents?.totalPages}
              userId={userId}
            />
          </TabsContent>
        </Tabs>
      </section>
    </>
  )
}
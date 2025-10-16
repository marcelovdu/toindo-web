import CategoryFilter from '@/components/CategoryFilter';
import Collection from '@/components/Collection'
import Search from '@/components/Search';
import { getAllEvents } from '@/lib/actions/event.actions';
import { SearchParamProps } from '@/types';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export default async function Home({ searchParams }: SearchParamProps) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  
  const resolvedSearchParams = await searchParams;

  const page = Number(resolvedSearchParams?.page) || 1;
  const searchText = (resolvedSearchParams?.query as string) || '';
  const category = (resolvedSearchParams?.category as string) || '';

  const events = await getAllEvents({
    query: searchText,
    category,
    page,
    limit: 9 // Para mudar a quantidade de cards na pagina
  })

  return (
    <>
      <section id="events" className="wrapper my-0 px-4 sm:px-6 lg:px-8 flex flex-col gap-6 sm:gap-8 md:gap-12">
        <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white text-center sm:text-left">
          Eventos Disponíveis
        </h1>

        <div className="flex w-full flex-col gap-4 sm:gap-5 lg:flex-row">
          <div className="w-full lg:flex-1">
            <Search />
          </div>
          <div className="w-full lg:w-auto lg:min-w-[200px]">
            <CategoryFilter />
          </div>
        </div>

        <Collection 
          data={events?.data}
          emptyTitle="Sem eventos encontrados"
          emptyStateSubtext="Tente novamente mais tarde"
          collectionType="All_Events"
          limit={9}  // Para mudar a quantidade de cards na pagina
          page={page}
          totalPages={events?.totalPages}
          userId={userId}
        />
      </section>
    </>
  )
}

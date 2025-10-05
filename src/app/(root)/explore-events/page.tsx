import CategoryFilter from '@/components/CategoryFilter';
import Collection from '@/components/Collection'
import Search from '@/components/Search';
import { getAllEvents } from '@/lib/actions/event.actions';
import { SearchParamProps } from '@/types';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

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
      <section id="events" className="wrapper my-0 flex flex-col gap-8 md:gap-12">
        <h1 className="text-3xl font-bold text-white">Eventos Disponíveis</h1>

        <div className="flex w-full flex-col gap-5 md:flex-row">
          <Search />
          <CategoryFilter />
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

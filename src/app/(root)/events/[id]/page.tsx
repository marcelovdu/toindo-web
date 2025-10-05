import { notFound } from 'next/navigation';
import { getEventById, getRelatedEventsByCategory } from '@/lib/actions/event.actions';
import { SearchParamProps } from '@/types';
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import Registration from "@/models/registration";

import { OrganizerEventView } from '@/components/OrganizerEventView';
import { VisitorEventView } from '@/components/VisitorEventView';


const EventDetailsPage = async ({ params, searchParams }: SearchParamProps) => {
    const id = params.id;
  
  
  // Busca todos os dados
  const eventPromise = getEventById(id);
  const sessionPromise = getServerSession(authOptions);
  const [event, session] = await Promise.all([eventPromise, sessionPromise]);
  
  if (!event) {
    notFound();
  }
  
  const userId = session?.user?.id;
  const isEventCreator = userId ? userId === event.organizer._id.toString() : false;
  const existingRegistration = userId ? await Registration.findOne({ event: id, user: userId }) : null;
  const initialIsJoined = !!existingRegistration;

  const relatedEvents = await getRelatedEventsByCategory({
    categoryId: event.category._id,
    eventId: event._id,
    page: (Array.isArray(searchParams.page) 
            ? searchParams.page[0] 
            : searchParams.page) || '1',
  }) || { data: [], totalPages: 0 };

  const viewProps = {
    event,
    userId,
    isEventCreator,
    initialIsJoined,
    relatedEvents,
    searchParams,
  };

  // Renderiza um componente ou outro
  return (
    <>
      {isEventCreator ? (
        <OrganizerEventView {...viewProps} />
      ) : (
        <VisitorEventView {...viewProps} />
      )}
    </>
  )
}

export default EventDetailsPage;
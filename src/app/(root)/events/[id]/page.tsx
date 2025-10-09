import { notFound } from 'next/navigation';
import { getEventById, getRelatedEventsByCategory } from '@/lib/actions/event.actions';
import { SearchParamProps } from '@/types';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Registration from "@/models/registration";
import { OrganizerEventView } from '@/components/OrganizerEventView';
import { VisitorEventView } from '@/components/VisitorEventView';
import { getEventRegistrationsAndInvitations, getInvitationsByEvent, getInvitationByToken } from '@/lib/actions/invitation.actions';


const EventDetailsPage = async ({ params, searchParams }: SearchParamProps) => {

  const { id } = await params;
  const resolvedSearchParams = await searchParams;
  
  const page = (Array.isArray(resolvedSearchParams.page) 
                    ? resolvedSearchParams.page[0] 
                    : resolvedSearchParams.page) || '1';
  const inviteToken = resolvedSearchParams.invite_token as string;
  
  
  // Busca todos os dados
  const eventPromise = getEventById(id);
  const sessionPromise = getServerSession(authOptions);
  const [eventData, session] = await Promise.all([eventPromise, sessionPromise]);
  let event = eventData;
  
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
    page: (Array.isArray(resolvedSearchParams.page) 
            ? resolvedSearchParams.page[0] 
            : resolvedSearchParams.page) || '1',
  }) || { data: [], totalPages: 0 };

const invitationsResult = (isEventCreator && userId)
    ? await getInvitationsByEvent({ eventId: event._id, organizerId: userId })
    : null;
  
  const invitations = invitationsResult?.invitations || [];

  if (invitationsResult?.cleanupPerformed) {
    event = await getEventById(id);
    if (!event) notFound();
  }

    let invitation = null;
    let inviteError = null;
    
    // Usando a variável local 'inviteToken'
    if (inviteToken) {
        const invitationResult = await getInvitationByToken(inviteToken);
        invitation = invitationResult?.data;
        inviteError = invitationResult?.error;
    }

  const participantsList = await getEventRegistrationsAndInvitations(id);  

  const organizerViewProps = {
    event,
    userId,
    isEventCreator,
    initialIsJoined,
    relatedEvents,
    invitations,
    participantsList,
    page: page,
  };

  const visitorViewProps = {
    event,
    userId,
    isEventCreator,
    initialIsJoined,
    relatedEvents,
    searchParams: resolvedSearchParams,
    invitation,
    inviteError,
  };

  // Renderiza um componente ou outro
  return (
    <>
      {isEventCreator ? (
        <OrganizerEventView {...organizerViewProps} />
      ) : (
        <VisitorEventView {...visitorViewProps} />
      )}
    </>
  )
}

export default EventDetailsPage;
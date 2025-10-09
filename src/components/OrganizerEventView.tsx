import React from 'react';

// Imports
import Collection from '@/components/Collection';
import { ActionCard } from "@/components/ActionCard";
import { OrganizerActionCard } from "@/components/OrganizerActionCard";
import { formatEventStatus, formatOrganizerName, formatFullDateTime } from '@/lib/utils';
import Image from 'next/image';
import { MapPin, Ticket, ExternalLink, Crown, CalendarDays  } from 'lucide-react'; 

// Tipos necessários
import { IEvent } from '@/models/event';
import { ParticipantsModal } from './ParticipantsModal';
import { IInvitation } from '@/models/invitation';
import { InvitationsModal } from './InvitationsModal';

type UnifiedParticipant = { _id: string; name: string; status: 'confirmed' | 'pending'; };


const DEFAULT_EVENT_IMAGE = '/images/default-event.png'; 

// Definindo as props que este componente de visualização receberá
type OrganizerEventViewProps = {
  event: IEvent & { participantCount: number };
  userId?: string;
  isEventCreator: boolean;
  initialIsJoined: boolean;
  relatedEvents: { data: IEvent[], totalPages: number };
  invitations: IInvitation[];
  participantsList: UnifiedParticipant[];
  page: string; 
}

export const OrganizerEventView = ({
  event,
  userId,
  isEventCreator,
  initialIsJoined,
  relatedEvents,
  invitations,
  participantsList,
  page
}: OrganizerEventViewProps) => {

  // Toda a lógica de formatação de dados
  const participantCount = event.participantCount ?? 0;
  const capacity = event.capacity ?? 0;
  const hasCapacity = capacity > 0;
  const attendancePercentage = hasCapacity ? (participantCount / capacity) * 100 : 0;

  const eventStatus = formatEventStatus(event.startDateTime);

  return (
    <>
      <section className="bg-dark-1 rounded-3xl p-10 text-white bg-dotted-pattern bg-contain">
        <div className="container -mt-4 mx-auto px-4 py-8 md:py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12">

            {/* --- COLUNA DA ESQUERDA (Conteúdo Principal) --- */}
            <div className="lg:col-span-2 space-y-8">
              <div className="aspect-video relative rounded-2xl overflow-hidden">
                <Image src={event.imageUrl ?? DEFAULT_EVENT_IMAGE} alt="Banner do evento" fill className="object-cover" />
              </div>
              {/* --- Cabeçalho --- */}
               <div>
                <p className={`font-bold text-xl ${eventStatus.color}`}>{eventStatus.text}</p>
                <h1 className="text-4xl md:text-5xl font-bold text-white mt-2">{event.title}</h1>
                <p className="flex items-center gap-2 text-lg text-gray-300 mt-4">
                  Por 
                  <span className="flex items-center gap-1 font-bold">
                    <Crown className="h-5 w-5 text-yellow-400" />
                    {formatOrganizerName(event.organizer.name)}
                  </span>
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Bloco de Data */}
                  <div className="bg-gray-800 p-4 rounded-lg space-y-2 border border-gray-700 flex flex-col">
                      <CalendarDays className="h-8 w-8 text-yellow-500" />
                      <h4 className="font-bold text-white">Data e Horário</h4>
                      <p className="text-sm text-gray-300">{formatFullDateTime(event.startDateTime)}</p>
                  </div>
                  {/* Bloco de Localização */}
                  <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.location || '')}`} target="_blank" rel="noopener noreferrer" className="bg-gray-800 p-4 rounded-lg space-y-2 border border-gray-700 hover:border-yellow-500 transition-colors flex flex-col">
                      <MapPin className="h-8 w-8 text-yellow-500" />
                      <h4 className="font-bold text-white flex items-center gap-1.5">Localização <ExternalLink className="h-3 w-3" /></h4>
                      <p className="text-sm text-gray-300">{event.location || 'Online'}</p>
                  </a>
                  {/* Bloco de Custo */}
                  <div className="bg-gray-800 p-4 rounded-lg space-y-2 border border-gray-700 flex flex-col">
                      <Ticket className="h-8 w-8 text-yellow-500" />
                      <h4 className="font-bold text-white">Custo</h4>
                      <p className="text-sm text-gray-300">{event.isFree ? 'Gratuito' : `R$${event.price}`}</p>
                  </div>
              </div>

            {/* Bloco de Sobre o evento */}
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <h2 className="text-2xl font-semibold text-white">Sobre o evento</h2>
                  <div className="text-sm font-semibold rounded-full bg-gray-700 px-4 py-1.5 text-gray-300 whitespace-nowrap">
                    {event.category.name}
                  </div>
                </div>
                <p className="text-gray-300 leading-relaxed">{event.description}</p>
              </div>
            </div>

            {/* --- COLUNA DA DIREITA (Sidebar) --- */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-6">
                {isEventCreator ? (
                  <OrganizerActionCard event={event} userId={userId} />
                ) : (
                  userId && (
                    <ActionCard 
                      event={event} 
                      userId={userId} 
                      initialIsJoined={initialIsJoined} 
                    />
                  )
                )}

                {hasCapacity && (
                  <ParticipantsModal
                      eventId={event._id}
                      title={event.title}
                      participantCount={participantCount}
                      attendancePercentage={attendancePercentage}
                      capacity={capacity}
                      participantsList={participantsList}
                  />
                )}

                 {isEventCreator && userId && (
                 <InvitationsModal eventId={event._id} invitations={invitations} />
                )}

              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- Seção de Eventos Relacionados --- */}
      <section className="wrapper my-8 flex flex-col gap-8 md:gap-12">
        <h2 className="text-3xl font-bold text-white">Eventos Relacionados</h2>
        <Collection 
          data={relatedEvents?.data}
          emptyTitle="Nenhum evento relacionado encontrado"
          emptyStateSubtext="Verifique novamente mais tarde"
          collectionType="All_Events"
          limit={3}
          page={page}
          totalPages={relatedEvents?.totalPages}
        />
      </section>
    </>
  )
}
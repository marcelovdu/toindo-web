'use client';

// Imports
import React, { useState, useTransition, useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import Collection from '@/components/Collection';
import { ActionCard } from "@/components/ActionCard";
import { OrganizerActionCard } from "@/components/OrganizerActionCard";
import { formatEventStatus, formatOrganizerName, formatFullDateTime } from '@/lib/utils';
import { MapPin, Ticket, ExternalLink, Crown, CalendarDays, Check, XCircle } from 'lucide-react'; 
import { IEvent } from '@/models/event';
import { IInvitation } from '@/models/invitation';
import { respondToInvitation } from '@/lib/actions/invitation.actions';
import { toast } from 'sonner';


const DEFAULT_EVENT_IMAGE = '/images/default-event.png'; 

// Definindo as props que este componente de visualização receberá
type VisitorEventViewProps = {
  event: IEvent & { participantCount: number };
  userId?: string;
  isEventCreator: boolean;
  initialIsJoined: boolean;
  relatedEvents: { data: IEvent[], totalPages: number };
  searchParams: { [key: string]: string | string[] | undefined };
  invitation?: IInvitation | null;
  inviteError?: string | null;
}

export const VisitorEventView = ({
  event,
  userId,
  isEventCreator,
  initialIsJoined,
  relatedEvents,
  searchParams,
  invitation,
  inviteError 
}: VisitorEventViewProps) => {

  const [isPending, startTransition] = useTransition();
  const pathname = usePathname();
  const router = useRouter();
  const [invitationStatus, setInvitationStatus] = useState(invitation?.status);

  const currentPage = searchParams.page; 

  // Toda a lógica de formatação de dados
  const participantCount = event.participantCount ?? 0;
  const capacity = event.capacity ?? 0;
  const hasCapacity = capacity > 0;
  const attendancePercentage = hasCapacity ? (participantCount / capacity) * 100 : 0;

  const eventStatus = formatEventStatus(event.startDateTime);

  const handleRespond = (response: 'accepted' | 'denied') => {
    startTransition(async () => {
      if (!invitation?.token) return;
      const result = await respondToInvitation({
        token: invitation.token,
        response,
        path: pathname,
      });

    if (result.success) {
        toast.success(result.message);
        if (response === 'accepted') {
          setInvitationStatus('accepted');
        } else {
          setInvitationStatus('denied');
        }
      } else {
        toast.error(result.message || 'Ocorreu um erro.');
        router.replace(`/events/${event._id}`);
      }
    });
  };

   const toastShownRef = useRef(false);

  useEffect(() => {
    if (inviteError && !toastShownRef.current) {
      toast.error(inviteError);
      toastShownRef.current = true;
    }
  }, [inviteError]);

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


                {invitation && invitationStatus === 'pending' ? (
                  // Se for um CONVIDADO com um convite pendente, mostra o card de convite
                  <Card className="bg-gray-800 border-yellow-500 rounded-2xl">
                    <CardHeader>
                      <CardTitle className="text-lg text-white">Você foi convidado(a)!</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-4">
                      <p className="text-sm text-gray-300">
                        {formatOrganizerName(invitation.event.organizer.name)} te convidou para este evento.
                      </p>
                      <div className="flex flex-col gap-3">
                        <Button onClick={() => handleRespond('accepted')} disabled={isPending} className="bg-green-600 hover:bg-green-700">
                          {isPending ? 'Processando...' : 'Aceitar Convite'}
                        </Button>
                        <Button onClick={() => handleRespond('denied')} disabled={isPending} variant="destructive">
                          Recusar
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  // Se for a VISÃO NORMAL (usuário logado, visitante comum, ou convite já respondido)
                  <>
                    {invitationStatus === 'accepted' ? (
                      <div className="flex items-center justify-center gap-2 p-4 rounded-xl bg-green-900/50 border border-green-500 text-green-400 font-bold">
                        <Check className="h-5 w-5" />
                        <span>Convite Aceito!</span>
                      </div>
                    ) : invitationStatus === 'denied' ? (
                      <div className="flex items-center justify-center gap-2 p-4 rounded-xl bg-red-900/50 border border-red-500 text-red-400 font-bold">
                        <XCircle className="h-5 w-5" />
                        <span>Convite Recusado</span>
                      </div>
                    ) : (
                      isEventCreator ? ( <OrganizerActionCard event={event} /> ) 
                      : ( userId && <ActionCard event={event} userId={userId} initialIsJoined={initialIsJoined} /> )
                    )}
                </>
                )}


                {hasCapacity && (
                  <Card className="bg-gray-800 border-gray-700 rounded-2xl">
                    <CardHeader>
                      <CardTitle className="text-lg text-white">
                        Participantes: {participantCount} / {capacity}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <Progress value={attendancePercentage} className="h-2 bg-gray-700 [&>*]:bg-yellow-500" />
                      <p className="text-sm text-gray-400">Junte-se a outros participantes e faça parte deste evento!</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Seção de Eventos Relacionados */}
      {!invitation && (
        <section className="wrapper my-8 flex flex-col gap-8 md:gap-12">
          <h2 className="text-3xl font-bold text-white">Eventos Relacionados</h2>
          <Collection data={relatedEvents?.data} emptyTitle="Nenhum evento relacionado encontrado" emptyStateSubtext="Verifique novamente mais tarde" collectionType="All_Events" limit={3} page={currentPage as string} totalPages={relatedEvents?.totalPages} />
        </section>
      )}
    </>
  )
}
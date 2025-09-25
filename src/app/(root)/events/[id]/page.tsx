// Imports dos componentes de UI
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import Collection from '@/components/Collection';
import { ActionCard } from "@/components/ActionCard";
import { OrganizerActionCard } from "@/components/OrganizerActionCard";
import { notFound } from 'next/navigation'; 

// Lógica e outros imports
import { getEventById, getRelatedEventsByCategory } from '@/lib/actions/event.actions'
import { formatDateTime } from '@/lib/utils';
import { SearchParamProps } from '@/types'
import Image from 'next/image';
import { Calendar, MapPin, Ticket, ExternalLink } from 'lucide-react'; 
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import Registration from "@/models/registration";

const DEFAULT_EVENT_IMAGE = '/images/default-event.png'; 

const EventDetails = async ({ params: { id }, searchParams }: SearchParamProps) => {
  const event = await getEventById(id);
  if (!event) {
    notFound();
  }

  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  const existingRegistration = userId ? await Registration.findOne({ event: id, user: userId }) : null;
  const initialIsJoined = !!existingRegistration;
  const isEventCreator = userId === event.organizer._id.toString();
  const relatedEvents = await getRelatedEventsByCategory({
    categoryId: event.category._id,
    eventId: event._id,
    page: searchParams.page as string,
  });

  const startDate = formatDateTime(event.startDateTime);
  const endDate = event.endDateTime ? formatDateTime(event.endDateTime) : null;
  const isSameDay = endDate ? startDate.dateOnly === endDate.dateOnly : true;
  const organizerInitials = event.organizer.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase();
  
  // -> 1. SUBSTITUÍMOS O PLACEHOLDER PELOS DADOS REAIS E CÁLCULOS SEGUROS
  const participantCount = event.participantCount ?? 0;
  const capacity = event.capacity ?? 0;
  const hasCapacity = capacity > 0;
  const attendancePercentage = hasCapacity ? (participantCount / capacity) * 100 : 0;

  return (
    <>
      <section className="bg-gray-900 text-white bg-dotted-pattern bg-contain">
        <div className="container mx-auto px-4 py-8 md:py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12">

            {/* --- COLUNA DA ESQUERDA (Conteúdo Principal) --- */}
            <div className="lg:col-span-2 space-y-8">
              {/* ... (Conteúdo da coluna esquerda permanece o mesmo) ... */}
              <div className="aspect-video relative rounded-2xl overflow-hidden">
                <Image src={event.imageUrl ?? DEFAULT_EVENT_IMAGE} alt="Banner do evento" fill className="object-cover" />
              </div>

              <h1 className="text-5xl font-bold text-white">{event.title}</h1>

              <div className="space-y-4">
                <div className="flex items-center gap-3 text-gray-300">
                  <Calendar className="h-5 w-5 text-yellow-500" />
                  <span className="text-lg">
                    {isSameDay ? `${startDate.dateOnly}, das ${startDate.timeOnly}` : `${startDate.dateTime}`}
                    {endDate && isSameDay && ` às ${endDate.timeOnly}`}
                    {endDate && !isSameDay && ` - ${endDate.dateTime}`}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-gray-300">
                  <MapPin className="h-5 w-5 text-yellow-500" />
                  <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.location || '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:text-yellow-400 hover:underline">
                    <span className="text-lg">{event.location || 'Local a definir'}</span>
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
                <div className="flex items-center gap-3 text-gray-300">
                  <Ticket className="h-5 w-5 text-yellow-500" />
                  <span className="text-lg">{event.isFree ? 'Gratuito' : `R$${event.price}`}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-sm font-semibold rounded-full bg-gray-700 px-4 py-1.5 text-gray-300">
                    {event.category.name}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h2 className="text-2xl font-semibold text-white">Sobre o evento</h2>
                <p className="text-gray-300 leading-relaxed">{event.description}</p>
              </div>
            </div>

            {/* --- COLUNA DA DIREITA (Sidebar) --- */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-6">
                {isEventCreator ? (
                  <OrganizerActionCard event={event} />
                ) : (
                  userId && (
                    <ActionCard 
                      event={event} 
                      userId={userId} 
                      initialIsJoined={initialIsJoined} 
                    />
                  )
                )}
                
                <Card className="bg-gray-800 border-gray-700 rounded-2xl">
                  <CardHeader><CardTitle className="text-lg text-white">Organizado por</CardTitle></CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12"><AvatarImage src={''} /><AvatarFallback className="bg-gray-600 text-white">{organizerInitials}</AvatarFallback></Avatar>
                      <div>
                        <p className="font-medium text-white">{event.organizer.name}</p>
                        <p className="text-sm text-gray-400">Organizador</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                {/* -> 2. ATUALIZAMOS O CARD DE PARTICIPANTES */}
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

      {/* --- Seção de Eventos Relacionados --- */}
      <section className="wrapper my-8 flex flex-col gap-8 md:gap-12">
        <h2 className="text-3xl font-bold text-white">Eventos Relacionados</h2>
        <Collection 
          data={relatedEvents?.data}
          emptyTitle="Nenhum evento relacionado encontrado"
          emptyStateSubtext="Verifique novamente mais tarde"
          collectionType="All_Events"
          limit={3}
          page={searchParams.page as string}
          totalPages={relatedEvents?.totalPages}
        />
      </section>
    </>
  )
}

export default EventDetails;
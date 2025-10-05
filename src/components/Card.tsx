'use client';

import { IEvent } from '@/models/event'
import { formatDateTime, formatOrganizerName, formatEventStatus } from '@/lib/utils'
import Image from 'next/image'
import Link from 'next/link'
import React, { useState, useTransition } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Edit, CalendarDays, MapPin, Crown, Users, LayoutGrid } from 'lucide-react'
import { Progress } from './ui/progress' 
import { usePathname } from 'next/navigation'
import { deleteRegistration } from '@/lib/actions/registration.actions'
import { useRouter } from 'next/navigation';
import { Share2, Trash } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Button } from './ui/button';
import { deleteEvent } from '@/lib/actions/event.actions';

const DEFAULT_EVENT_IMAGE = '/images/default-event.png'; 

interface IEventWithCount extends IEvent {
  participantCount: number;
}

type CardProps = {
  event: IEventWithCount,
  hidePrice?: boolean,
  collectionType?: 'Events_Organized' | 'Events_Participated' | 'All_Events',
  userId?: string | null;
}

const Card = ({ event, collectionType = 'All_Events', userId }: CardProps) => {
  const isEventCreator = userId ? userId === event.organizer._id.toString() : false;
  const [isHovered, setIsHovered] = useState(false);
  const participantCount = event.participantCount || 0;
  const progressValue = event.capacity ? (participantCount / event.capacity) * 100 : 0;
  const hidePrice = collectionType === 'Events_Organized';
  
  const [isPending, startTransition] = useTransition();
  const pathname = usePathname();
  const eventStatus = formatEventStatus(event.startDateTime);
  const isEventPast = new Date(event.startDateTime) < new Date();

  const router = useRouter();

   // Função para compartilhar
  const handleShare = () => {
    navigator.clipboard.writeText(`${window.location.origin}/events/${event._id}`);
    alert('Link do evento copiado!');
  };

  // Função para chamar a server action de deletar evento
  const handleDeleteEvent = () => {
    startTransition(async () => {
      await deleteEvent({ eventId: event._id });
      router.refresh();
    });
  };

  const handleCancelRegistration = () => {
    if (!userId) return;
    startTransition(async () => {
      await deleteRegistration({ eventId: event._id, userId, path: pathname });
    });
  };

  return (
    <Dialog>
      <AlertDialog>
    <div 
      className="group relative flex w-full max-w-[400px] flex-col overflow-hidden rounded-xl bg-gray-800 shadow-lg transition-all hover:-translate-y-2 hover:shadow-yellow-500/30"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link href={`/events/${event._id}`} className="relative block h-[160px] w-full">
        <Image
          src={event.imageUrl ?? DEFAULT_EVENT_IMAGE}
          alt={event.title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        
        <div className="absolute bottom-2 left-2 rounded-lg bg-gray-900/80 p-2 backdrop-blur-sm">
            <p className="text-xs font-semibold text-yellow-400">{event.category.name}</p>
        </div>

        {!hidePrice && (
          <div className="absolute top-2 right-2 rounded-lg bg-gray-900/80 p-2 backdrop-blur-sm">
            <p className="text-xs font-semibold text-yellow-400">
              {event.isFree ? 'GRÁTIS' : `R$ ${event.price}`}
            </p>
          </div>
        )}
      </Link>
      
      <div className="flex flex-1 flex-col gap-3 p-4">
        <Link href={`/events/${event._id}`}>
          <p className="text-lg font-medium line-clamp-2 flex-1 text-white">{event.title}</p>
        </Link>
        
        <div className="flex flex-col gap-2 text-sm text-gray-400">
            <div className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4" />
                <p>{formatDateTime(event.startDateTime).dateTime}</p>
            </div>
            <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <p className="truncate">{event.location || 'Online'}</p>
            </div>
        </div>

        <div className="mt-auto pt-3 border-t border-gray-700">
          
          {collectionType === 'Events_Organized' && isEventCreator && (
             <div className="relative h-12 flex items-center justify-center overflow-hidden">
              <AnimatePresence>
                {!isHovered ? (
                  <motion.div
                    key="progress"
                    className="w-full"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -20, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="flex justify-between text-sm text-gray-300 mb-2">
                      <p>Inscritos: {participantCount} / {event.capacity}</p>
                      <p className="font-bold">{Math.round(progressValue)}%</p>
                    </div>
                    <Progress value={progressValue} className="w-full h-2 [&>div]:bg-yellow-400" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="org-actions"
                    className="absolute flex w-full justify-around"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -20, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <button onClick={handleShare} className="flex flex-col items-center gap-1 text-white hover:text-yellow-400">
                      <Share2 className="h-5 w-5" />
                      <span className="text-xs font-semibold">Compartilhar</span>
                    </button>
                    <DialogTrigger asChild>
                      <button className="flex flex-col items-center gap-1 text-white hover:text-yellow-400">
                        <LayoutGrid className="h-5 w-5" />
                        <span className="text-xs font-semibold">Gerenciar</span>
                      </button>
                    </DialogTrigger>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {collectionType === 'Events_Participated' && (
            <div className="flex items-center justify-between">
              <p className="flex items-center gap-2 text-sm text-gray-300 truncate">
                <Crown className="h-4 w-4 text-yellow-400" />
                {formatOrganizerName(event.organizer.name)}
              </p>
              <div className="relative h-8 flex items-center justify-end min-w-[140px]">
                <AnimatePresence>
                  {!isHovered ? (
                    <motion.p
                      key="status"
                      className={`absolute text-sm font-semibold ${eventStatus.color}`}
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: -20, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      {eventStatus.text}
                    </motion.p>
                  ) : (
                    <motion.button
                      key="cancel"
                      className="absolute bg-red-600 text-white px-3 py-1 rounded-md text-sm font-bold disabled:bg-red-900 disabled:cursor-not-allowed"
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: -20, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      onClick={handleCancelRegistration}
                      disabled={isPending}
                    >
                      {isPending ? 'Aguarde...' : (isEventPast ? 'Remover partic.' : 'Cancelar partic.')}
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>
            </div>
          )}

          {collectionType === 'All_Events' && (
            <div className="flex items-center justify-between">
              <p className="flex items-center gap-2 text-sm text-gray-300 truncate">
                <Crown className="h-4 w-4 text-yellow-400" />
                {formatOrganizerName(event.organizer.name)}
              </p>
              <div className="relative h-8 flex items-center justify-end min-w-[120px]">
                <AnimatePresence>
                  {!isHovered ? (
                    <motion.div
                      key="participants"
                      className="absolute flex items-center gap-2 text-white"
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: -20, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Users className="h-4 w-4" />
                      <span className="text-sm font-semibold">{participantCount} {participantCount === 1 ? 'participante' : 'participantes'}</span>
                    </motion.div>
                  ) : (
                    <Link href={`/events/${event._id}`} className="absolute">
                      <motion.div
                        key="learn-more"
                        className="flex items-center justify-center bg-yellow-500 text-black px-3 py-1 rounded-md text-sm font-bold"
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -20, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        Saiba mais
                      </motion.div>
                    </Link>
                  )}
                </AnimatePresence>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>

        <DialogContent className="bg-gray-800 border-slate-700 text-white">
          <DialogHeader>
            <DialogTitle>Gerenciar Evento</DialogTitle>
            <DialogDescription>{`Ações rápidas para o evento "${event.title}".`}</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-4">
            <Button asChild variant="secondary" className="justify-start gap-3">
              <Link href={`/events/${event._id}/edit`}>
                <Edit className="h-4 w-4" /> Editar Informações
              </Link>
            </Button>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="justify-start gap-3">
                <Trash className="h-4 w-4" /> Cancelar Evento
              </Button>
            </AlertDialogTrigger>
          </div>
        </DialogContent>


        <AlertDialogContent className="bg-gray-800 border-gray-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Você tem certeza absoluta?</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              Esta ação não pode ser desfeita. Isso cancelará permanentemente o seu evento.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Voltar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteEvent} 
              disabled={isPending}
              className="bg-red-600 hover:bg-red-700"
            >
              {isPending ? 'Cancelando...' : 'Sim, cancelar este evento'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
    </Dialog>
  ) 
}

export default Card;
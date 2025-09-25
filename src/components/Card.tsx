import { IEvent } from '@/models/event'
import { formatDateTime } from '@/lib/utils'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

const DEFAULT_EVENT_IMAGE = '/images/default-event.png'; 

type CardProps = {
  event: IEvent,
  hidePrice?: boolean
}

const Card = async ({ event, hidePrice }: CardProps) => {
  const session = await getServerSession(authOptions);
  
  const userId = session?.user?.id;
  const isEventCreator = userId ? userId === event.organizer._id.toString() : false;

  return (
    <div className="group relative flex min-h-[380px] w-full max-w-[400px] flex-col overflow-hidden rounded-xl bg-gray-800 shadow-lg transition-all hover:shadow-yellow-500/20 md:min-h-[438px]">
      
      <Link href={`/events/${event._id}`} className="relative block h-[200px] w-full">
        <Image
          src={event.imageUrl ?? DEFAULT_EVENT_IMAGE}
          alt={event.title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </Link>
      
      {isEventCreator && !hidePrice && (
        <div className="absolute right-2 top-2 rounded-xl bg-gray-900/80 p-3 backdrop-blur-sm transition-all">
          <Link href={`/events/${event._id}/edit`} aria-label="Editar evento">
            <Image src="/icons/edit.svg" alt="edit" width={20} height={20} />
          </Link>
        </div>
      )}

      <div className="flex flex-1 flex-col gap-3 p-5"> 
        {!hidePrice && <div className="flex gap-2">
          <span className="text-sm font-semibold w-min rounded-full bg-yellow-500 px-4 py-1 text-black">
            {event.isFree ? 'GRÁTIS' : `R$${event.price}`}
          </span>
          <p className="text-sm font-semibold w-fit whitespace-nowrap rounded-full bg-gray-700 px-4 py-1 text-gray-300"> 
            {event.category.name}
          </p>
        </div>}

        <div className="flex flex-col gap-2">
            
            <div className="flex items-center gap-2">
                <Image src="/icons/calendar-days.svg" alt="data" width={16} height={16} />
                <p className="text-base font-medium text-gray-400">
                    {formatDateTime(event.startDateTime).dateTime}
                </p>
            </div>

            <div className="flex items-center gap-2">
                <Image src="/icons/map-pin.svg" alt="localização" width={16} height={16} />
                <p className="text-sm text-gray-400 truncate">{event.location || 'Online'}</p>
            </div>
        </div>

        <Link href={`/events/${event._id}`}>
          <p className="text-lg font-medium md:text-xl line-clamp-2 flex-1 text-white">{event.title}</p>
        </Link>

        <div className="flex-between mt-auto w-full">
          <p className="text-base font-medium text-gray-300 truncate">
            {event.organizer.name}
          </p>
          <div className="flex items-center gap-2 text-sm text-yellow-400">
            <Image src="/icons/users.svg" alt="capacidade" width={16} height={16} />
            <span>{event.capacity} Vagas</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Card;
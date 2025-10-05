import { IEvent } from '@/models/event'
import React from 'react'
import Card from './Card'
import Pagination from './Pagination'

type CollectionProps = {
  data: IEvent[],
  emptyTitle: string,
  emptyStateSubtext: string,
  limit: number,
  page: number | string,
  totalPages?: number,
  urlParamName?: string,
  collectionType?: 'Events_Organized' | 'Events_Participated' | 'All_Events'
  userId?: string | null
}

const Collection = ({
  data,
  emptyTitle,
  emptyStateSubtext,
  page,
  totalPages = 0,
  collectionType,
  urlParamName,
  userId,
}: CollectionProps) => {
  return (
    <>
      {data && data.length > 0 ? (
        <div className="flex flex-col items-center gap-10">
          <ul className="grid w-full grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:gap-10">
            
            {data.map((event, index) => {
              if (!event || !event._id) {
                return null;
              }

              const hidePrice = collectionType === 'Events_Participated';

              return (
                <li key={`${event._id}-${index}`} className="flex justify-center">
                  <Card event={event} hidePrice={hidePrice} userId={userId} collectionType={collectionType}/>
                </li>
              )
            })}

          </ul>

          {totalPages > 1 && (
            <Pagination urlParamName={urlParamName} page={page} totalPages={totalPages} />
          )}
        </div>
      ) : (
        <div className="flex-center wrapper min-h-[200px] w-full flex-col gap-3 rounded-[14px] bg-gray-800 py-28 text-center">
          <h3 className="text-2xl font-bold text-white md:text-3xl">{emptyTitle}</h3>
          <p className="text-base text-white">{emptyStateSubtext}</p>
        </div>
      )} 
    </>
  )
}

export default Collection
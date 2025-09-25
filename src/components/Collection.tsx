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
  collectionType?: 'Events_Organized' | 'My_Tickets' | 'All_Events'
}

const Collection = ({
  data,
  emptyTitle,
  emptyStateSubtext,
  page,
  totalPages = 0,
  collectionType,
  urlParamName,
}: CollectionProps) => {
  return (
    <>
      {data && data.length > 0 ? (
        <div className="flex flex-col items-center gap-10">
          <ul className="grid w-full grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:gap-10">
            
            {/* -> CORREÇÃO DEFINITIVA APLICADA AQUI <- */}
            {data.map((event, index) => {
              // 1. Verificação de segurança: Só renderiza se o evento e seu ID existirem
              if (!event || !event._id) {
                return null; // Pula a renderização deste item inválido
              }

              const hidePrice = collectionType === 'My_Tickets';

              return (
                // 2. Chave mais robusta: Combina o ID com o índice para garantir unicidade
                <li key={`${event._id}-${index}`} className="flex justify-center">
                  <Card event={event} hidePrice={hidePrice} />
                </li>
              )
            })}

          </ul>

          {totalPages > 1 && (
            <Pagination urlParamName={urlParamName} page={page} totalPages={totalPages} />
          )}
        </div>
      ) : (
        // Bónus: Corrigi o fundo da mensagem de "vazio" para o tema escuro
        <div className="flex-center wrapper min-h-[200px] w-full flex-col gap-3 rounded-[14px] bg-gray-800 py-28 text-center">
          <h3 className="text-2xl font-bold text-white md:text-3xl">{emptyTitle}</h3>
          <p className="text-base text-white">{emptyStateSubtext}</p>
        </div>
      )} 
    </>
  )
}

export default Collection
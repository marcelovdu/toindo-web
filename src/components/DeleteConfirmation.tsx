// src/components/DeleteConfirmation.tsx

'use client'

import { useTransition } from 'react'
import { usePathname } from 'next/navigation'
import { useRouter } from 'next/navigation'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

import { deleteEvent } from '@/lib/actions/event.actions'
import { Trash2 } from 'lucide-react'

export const DeleteConfirmation = ({ eventId }: { eventId: string }) => {
  const pathname = usePathname()
  const router = useRouter() // -> 2. Inicializamos o router
  const [isPending, startTransition] = useTransition()

  return (
    <AlertDialog>
      <AlertDialogTrigger 
        className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 flex-1 bg-red-600 hover:bg-red-700 text-white border-red-600 hover:border-red-700 h-10 px-4 py-2"
        disabled={isPending}
      >
        <Trash2 className="h-4 w-4 mr-2" />
        {isPending ? 'Deletando...' : 'Deletar'}
      </AlertDialogTrigger>

      <AlertDialogContent className="bg-white">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-gray-900">Tem certeza que quer apagar?</AlertDialogTitle>
          <AlertDialogDescription className="p-regular-16 text-gray-600">
            Isso vai deletar permanentemente esse evento.
            Esta ação não pode ser desfeita.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel className="bg-gray-100 text-gray-800 hover:bg-gray-200 border-none">Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={() =>
              startTransition(async () => {
                // A Server Action é executada primeiro
                await deleteEvent({ eventId }) 

                // -> 3. Após o sucesso, redirecionamos o usuário
                router.push('/explore-events')
              })
            }
            className="bg-red-600 hover:bg-red-700 text-white"
            disabled={isPending}
          >
            {isPending ? 'Deletando...' : 'Deletar'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
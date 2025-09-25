// src/components/ActionCard.tsx

"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Check, Share2 } from "lucide-react";
import { IEvent } from "@/models/event";
import { toggleRegistration } from "@/lib/actions/registration.actions";
import { usePathname } from "next/navigation";
import { toast } from "sonner";

type ActionCardProps = {
  event: IEvent;
  userId: string;
  initialIsJoined: boolean;
}

export const ActionCard = ({ event, userId, initialIsJoined }: ActionCardProps) => {
  // useTransition é um hook do React para gerenciar estados de carregamento de ações
  const [isPending, startTransition] = useTransition();
  const pathname = usePathname();

  const handleJoin = () => {
    if (!userId) {
      // Redirecionar para o login ou mostrar um aviso
      toast.error("Você precisa estar logado para se inscrever em um evento.");
      return;
    }

    startTransition(async () => {
      const result = await toggleRegistration({
        eventId: event._id,
        userId: userId,
        path: pathname, // Usado para revalidar a página
      });
      if (result?.message) {
        toast.success(result.message);
      }
    });
  };
  
  // A lógica de compartilhamento permanece a mesma
  const handleShare = async () => { /* ... */ };

  return (
    <Card className="bg-gray-800 border-gray-700 rounded-2xl">
      <CardContent className="p-4 md:p-6">
        <div className="flex items-center gap-3">
          {/* O botão agora usa o estado `initialIsJoined` e o `isPending` */}
          {!initialIsJoined ? (
            <Button 
              className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-black font-bold" 
              onClick={handleJoin}
              disabled={isPending}
            >
              {isPending ? 'Processando...' : 'Participar do Evento'}
            </Button>
          ) : (
            <Button
              variant="outline"
              className="flex-1 text-yellow-500 border-yellow-500 bg-transparent hover:bg-yellow-500/10 hover:text-yellow-400"
              onClick={handleJoin}
              disabled={isPending}
            >
              <Check className="h-4 w-4 mr-2" />
              {isPending ? 'Cancelando...' : 'Participação Confirmada'}
            </Button>
          )}
          <Button variant="outline" size="icon" onClick={handleShare} className="border-gray-600 hover:bg-gray-700">
            <Share2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
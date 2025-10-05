"use client";

import { useTransition, useState } from "react";
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
  const [isPending, startTransition] = useTransition();
  const pathname = usePathname();
  
  const [isSharing, setIsSharing] = useState(false);

  const handleJoin = () => {
    if (!userId) {
      toast.error("Você precisa estar logado para se inscrever em um evento.");
      return;
    }
    startTransition(async () => {
      const result = await toggleRegistration({
        eventId: event._id,
        userId: userId,
        path: pathname,
      });
      if (result?.message) {
        toast.success(result.message);
      }
    });
  };
  
  const handleShare = async () => {
    if (isSharing) return;
    setIsSharing(true);

    if (navigator.share) {
      try {
        await navigator.share({
          title: event.title,
          text: `Confira este evento: ${event.title}`,
          url: `${window.location.origin}/events/${event._id}`,
        });
      } catch (error) {
        console.error("Erro ao compartilhar:", error);
      } finally {
        setIsSharing(false);
      }
    } else {
      navigator.clipboard.writeText(`${window.location.origin}/events/${event._id}`);
      toast.success("Link do evento copiado para a área de transferência!");
      setIsSharing(false);
    }
  };

  return (
     <Card className="bg-gray-800 border-gray-700 rounded-2xl">
      <CardContent className="p-4 md:p-6 flex flex-col gap-4">

        {!initialIsJoined ? (
          <Button 
            className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-bold" 
            onClick={handleJoin}
            disabled={isPending}
          >
            {isPending ? 'Processando...' : 'Participar do Evento'}
          </Button>
        ) : (
          <Button
            variant="outline"
            className="w-full text-yellow-500 border-yellow-500 bg-transparent hover:bg-yellow-500/10 hover:text-yellow-400"
            onClick={handleJoin}
            disabled={isPending}
          >
            <Check className="h-4 w-4 mr-2" />
            {isPending ? 'Cancelando...' : 'Participação Confirmada'}
          </Button>
        )}
        
        <Button 
          variant="outline" 
          onClick={handleShare} 
          className="w-full border-gray-600 hover:bg-gray-700" 
          disabled={isSharing}
        >
          <Share2 className="h-4 w-4 mr-2" />
          {isSharing ? 'Aguarde...' : 'Compartilhar'}
        </Button>
        
      </CardContent>
    </Card>
  );
};
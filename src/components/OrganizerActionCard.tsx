"use client";

import { Card, CardContent } from "@/components/ui/card";
import { IEvent } from "@/models/event";
import { Edit, Share2 } from "lucide-react";
import Link from "next/link";
import { Button } from "./ui/button";
import { DeleteConfirmation } from "./DeleteConfirmation";
import { useState } from "react";

export const OrganizerActionCard = ({ event }: { event: IEvent }) => {
  const [isSharing, setIsSharing] = useState(false);

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
      alert("Link do evento copiado para a área de transferência!");
      setIsSharing(false);
    }
  };

  return (
    <Card className="bg-gray-800 border-gray-700 rounded-2xl">
      <CardContent className="p-4 md:p-6 flex flex-col gap-4">
        
        <p className="text-base font-semibold text-center text-gray-300 p-2 bg-gray-900/50 rounded-lg">
          Você é o organizador deste evento.
        </p>
        
        <Button onClick={handleShare} variant="outline" className="w-full border-gray-600 hover:bg-gray-700" disabled={isSharing}>
          <Share2 className="h-4 w-4 mr-2" />
          {isSharing ? 'Aguarde...' : 'Compartilhar'}
        </Button>

        <div className="flex items-center gap-3">
          <Button asChild className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-black font-bold">
            <Link href={`/events/${event._id}/edit`}>
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </Link>
          </Button>
          
          <DeleteConfirmation eventId={event._id} />
        </div>
        
      </CardContent>
    </Card>
  );
};
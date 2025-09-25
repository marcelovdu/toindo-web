// src/components/OrganizerActionCard.tsx

"use client";

import { Card, CardContent } from "@/components/ui/card";
import { IEvent } from "@/models/event";
import { Edit, Share2 } from "lucide-react";
import Link from "next/link";
import { Button } from "./ui/button";
import { DeleteConfirmation } from "./DeleteConfirmation";

export const OrganizerActionCard = ({ event }: { event: IEvent }) => {
  const handleShare = async () => {
    // Lógica de compartilhamento
    if (navigator.share) {
      try {
        await navigator.share({
          title: event.title,
          text: `Confira este evento: ${event.title}`,
          url: window.location.href,
        });
      } catch (error) {
        console.error("Erro ao compartilhar:", error);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Link do evento copiado para a área de transferência!");
    }
  };

  return (
    <Card className="bg-gray-800 border-gray-700 rounded-2xl">
      {/* -> Container principal agora é flex-col com gap para espaçamento uniforme */}
      <CardContent className="p-4 md:p-6 flex flex-col gap-4">
        
        {/* -> 1. Mensagem de destaque para o organizador */}
        <p className="text-base font-semibold text-center text-gray-300 p-2 bg-gray-900/50 rounded-lg">
          Você é o organizador deste evento.
        </p>
        
        {/* -> 2. Botão de compartilhar sozinho no topo */}
        <Button onClick={handleShare} variant="outline" className="w-full border-gray-600 hover:bg-gray-700">
          <Share2 className="h-4 w-4 mr-2" />
          Compartilhar
        </Button>

        {/* -> 3. Botões de Editar e Deletar agrupados embaixo */}
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
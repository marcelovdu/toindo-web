"use client";

import { Card, CardContent } from "@/components/ui/card";
import { IEvent } from "@/models/event";
import { Edit, Share2 } from "lucide-react";
import Link from "next/link";
import { Button } from "./ui/button";
import { DeleteConfirmation } from "./DeleteConfirmation";
import { useState } from "react";

import { useTransition } from "react";
import { usePathname, useRouter  } from "next/navigation";
import { toast } from "sonner";
import { UserPlus, Copy } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { createInvitation } from "@/lib/actions/invitation.actions";

type OrganizerActionCardProps = {
  event: IEvent;
  userId?: string;
}

export const OrganizerActionCard = ({ event, userId }: OrganizerActionCardProps) => {
  const [isSharing, setIsSharing] = useState(false);

  const [isPending, startTransition] = useTransition();
  const [guestName, setGuestName] = useState('');
  const [invitationLink, setInvitationLink] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

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

  const handleCreateInvitation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !guestName.trim()) return;

    startTransition(async () => {
      const result = await createInvitation({
        eventId: event._id,
        organizerId: userId,
        guestIdentifier: guestName.trim(),
        path: pathname,
      });

      if (result?.success && result.link) {
        setInvitationLink(result.link);
        toast.success(`Convite criado para ${guestName.trim()}!`);
        router.refresh();
      } else {
        toast.error(result?.message || 'Ocorreu um erro ao criar o convite.');
      }
    });
  };

  // Reseta o formulário quando o modal fecha
  const onModalOpenChange = (open: boolean) => {
    setIsModalOpen(open);
    if (!open) {
      setGuestName('');
      setInvitationLink('');
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(invitationLink);
    toast.success('Link do convite copiado!');
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={onModalOpenChange}>
    <Card className="bg-gray-800 border-gray-700 rounded-2xl">
      <CardContent className="p-4 md:p-6 flex flex-col gap-4">
        
        <p className="text-base font-semibold text-center text-gray-300 p-2 bg-gray-900/50 rounded-lg">
          Você é o organizador deste evento.
        </p>
        
        <Button onClick={handleShare} variant="outline" className="w-full border-gray-600 hover:bg-gray-400" disabled={isSharing}>
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

          <DialogTrigger asChild>
            <Button className="w-full bg-green-600 text-white hover:bg-green-700 hover:text-white font">
              <UserPlus className="h-4 w-4 mr-2" />
              Convidar
            </Button>
          </DialogTrigger>
      </CardContent>
    </Card>

    <DialogContent className="bg-gray-800 border-gray-700 text-white">
        <DialogHeader>
          <DialogTitle>Criar Convite</DialogTitle>
          <DialogDescription>
            Gere um link especial para convidar alguém para o seu evento.
          </DialogDescription>
        </DialogHeader>
        
        {!invitationLink ? (
          <form onSubmit={handleCreateInvitation} className="flex flex-col gap-4 py-4">
            <Input
              type="text"
              placeholder="Digite o nome e sobrenome do convidado"
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              className="bg-gray-700 border-gray-600"
              required
            />
            <Button type="submit" disabled={isPending} className="bg-yellow-500 text-black hover:bg-yellow-600">
              {isPending ? 'Gerando link...' : 'Gerar Link de Convite'}
            </Button>
          </form>
        ) : (
          <div className="flex flex-col gap-4 py-4">
            <p className="text-sm text-gray-400">Link gerado com sucesso! Envie para seu convidado.</p>
            <div className="flex items-center gap-2">
              <Input
                type="text"
                value={invitationLink}
                readOnly
                className="bg-gray-900 border-gray-700 text-gray-300"
              />
              <Button size="icon" onClick={copyToClipboard}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
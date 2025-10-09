"use client";

import React, { useState, useTransition } from 'react';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Copy, Users, X, Loader2 } from 'lucide-react';
import { IInvitation } from '@/models/invitation';
import { toast } from 'sonner';
import { Button } from './ui/button';
import { usePathname } from 'next/navigation';
import { deleteInvitation } from '@/lib/actions/invitation.actions';
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
} from "@/components/ui/alert-dialog"

// Helper para estilizar os badges de status
const StatusBadge = ({ status }: { status: string }) => {
  const baseClasses = "text-xs font-bold px-2 py-1 rounded-full whitespace-nowrap";
  switch (status) {
    case 'pending':
      return <span className={`${baseClasses} bg-yellow-500/20 text-yellow-400`}>Pendente</span>;
    case 'accepted':
      return <span className={`${baseClasses} bg-green-500/20 text-green-400`}>Aceito</span>;
    case 'denied':
      return <span className={`${baseClasses} bg-red-500/20 text-red-400`}>Recusado</span>;
    case 'expired':
      return <span className={`${baseClasses} bg-gray-500/20 text-gray-400`}>Vencido</span>;
    default:
      return null;
  }
};

type InvitationsModalProps = {
  eventId: string;
  invitations: IInvitation[];
}

export const InvitationsModal = ({ eventId, invitations }: InvitationsModalProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const pathname = usePathname();

  if (!invitations || invitations.length === 0) {
    return (
      <Card className="bg-gray-800 border-gray-700 rounded-2xl opacity-60">
        <CardHeader><CardTitle className="text-lg text-white">Convites:</CardTitle></CardHeader>
        <CardContent><p className="text-gray-400 text-sm">Nenhum convite enviado.</p></CardContent>
      </Card>
    );
  }

// Cálculos para as estatísticas
  const totalCount = invitations.length;
  const pendingCount = invitations.filter(inv => inv.status === 'pending').length;
  const acceptedCount = invitations.filter(inv => inv.status === 'accepted').length;
  const deniedCount = invitations.filter(inv => inv.status === 'denied').length;
  const expiredCount = invitations.filter(inv => inv.status === 'expired').length;
  const respondedCount = acceptedCount + deniedCount;

  const handleCopyLink = (token: string) => {
    const invitationLink = `${window.location.origin}/events/${eventId}?invite_token=${token}`;
    navigator.clipboard.writeText(invitationLink);
    toast.success('Link do convite copiado!');
  };

    // Função para deletar um convite
  const handleDelete = (invitationId: string) => {
    startTransition(async () => {
      const result = await deleteInvitation({ invitationId, path: pathname });
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message || 'Erro ao excluir convite.');
      }
    });
  };

  const TriggerCard = (
    <Card className="bg-gray-800 border-gray-700 rounded-2xl cursor-pointer transition-colors hover:border-yellow-500">
      <CardHeader>
        <CardTitle className="text-lg text-white">Convites:</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-gray-300">
          <span className="font-bold text-yellow-500">{totalCount}</span> {totalCount === 1 ? 'criado' : 'criados'}. 
          <span className="font-bold text-yellow-500"> {respondedCount}</span> {respondedCount === 1 || respondedCount === 0 ? 'respondido' : 'respondidos'}.
        </p>
        <p className="text-sm text-gray-400 mt-4">Clique para ver os detalhes.</p>
      </CardContent>
    </Card>
  );

  return (
   <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {TriggerCard}
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-2x1 bg-gray-900/90 border-gray-700 text-white backdrop-blur-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-6 w-6 text-yellow-500" />
            Lista de Convites
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Acompanhe o status de todos os convites enviados.          
          </DialogDescription>
        </DialogHeader>

 
        <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-gray-300 p-4 bg-gray-800 rounded-lg">
          <div className="flex items-center gap-1.5 font-semibold"><span className="h-2 w-2 rounded-full bg-white"></span>Total: <strong>{totalCount}</strong></div>
          <div className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-yellow-500"></span>Pendentes: <strong>{pendingCount}</strong></div>
          <div className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-green-500"></span>Aceitos: <strong>{acceptedCount}</strong></div>
          <div className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-red-500"></span>Recusados: <strong>{deniedCount}</strong></div>
          <div className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-purple-700"></span>Expirados: <strong>{expiredCount}</strong></div>
        </div>

        <div className="max-h-80 overflow-y-auto space-y-3 p-1 pr-4 custom-scrollbar">
          {invitations.map(invitation => (
            <div key={invitation._id} className="flex items-center justify-between gap-3 p-3 bg-gray-800 rounded-lg">
              <span className="font-semibold truncate">{invitation.guestIdentifier}</span>
              <div className="flex items-center gap-3 ml-auto">
                <StatusBadge status={invitation.status} />

                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={() => handleCopyLink(invitation.token)}
                  disabled={invitation.status !== 'pending'}
                  className="h-8 gap-1.5 disabled:opacity-30"
                >
                  <Copy className="h-4 w-4" />
                  <span className="text-xs">Link</span>
                </Button>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      size="icon"
                      variant="destructive"
                      className="h-8 w-8 rounded-full bg-red-900/50 text-red-500 hover:bg-red-900"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="bg-gray-800 border-gray-700">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-white">Excluir Convite?</AlertDialogTitle>
                      <AlertDialogDescription className="text-gray-400">
                        Isso excluirá permanentemente o convite para <strong>{invitation.guestIdentifier}</strong>. Se a vaga estava reservada, ela será liberada.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Voltar</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={() => handleDelete(invitation._id)}
                        disabled={isPending}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Sim, excluir'}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>

              </div>
            </div>
          ))}
        </div>

        <Button onClick={() => setIsOpen(false)} variant="secondary" className="mt-4 w-full bg-yellow-500 hover:bg-gray-500">
          Fechar
        </Button>
      </DialogContent>
    </Dialog>
  );
};
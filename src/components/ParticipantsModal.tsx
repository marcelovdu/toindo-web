"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2, Users, User, X, Mail, Clock } from 'lucide-react';
import { Progress } from './ui/progress' 
import { getEventParticipants } from '@/lib/actions/event.actions';
import { ParticipantInfoParams } from '@/types/index'; 
import { getEventRegistrationsAndInvitations } from '@/lib/actions/invitation.actions';


// Tipagem de Props
type ParticipantsModalProps = {
    eventId: string;
    title: string;
    participantCount: number;
    attendancePercentage: number;
    capacity: number;
    participantsList: UnifiedParticipant[];
}

type UnifiedParticipant = {
  _id: string;
  name: string;
  status: 'confirmed' | 'pending';
};

export const ParticipantsModal = ({ 
    eventId, 
    title, 
    participantCount,
    attendancePercentage,
    capacity,
    participantsList
}: ParticipantsModalProps) => {

    const [isOpen, setIsOpen] = useState(false);

    // Armazena a lista de usuários
     const [list, setList] = useState<UnifiedParticipant[] | null>(null);
    const [participants, setParticipants] = useState<ParticipantInfoParams[] | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [hasLoaded, setHasLoaded] = useState(false);
    
    // Calcula quantos usuários mostrar na descrição
    const descriptionCount = participants ? participants.length : participantCount;

    // Função para buscar os dados
    const handleOpenChange = (open: boolean) => {
        setIsOpen(open);

        if (open && !hasLoaded) {
            setIsLoading(true);
            getEventRegistrationsAndInvitations(eventId)
                .then((data) => {
                    setList(data);
                    setHasLoaded(true);
                })
                .catch(error => {
                    console.error("Erro ao carregar participantes:", error);
                    setParticipants([]);
                })
                .finally(() => {
                    setIsLoading(false);
                });
        }
    };

    // --- Componente Card/Botão
    const TriggerCard = (
        <Card className="bg-gray-800 border-gray-700 rounded-2xl cursor-pointer transition-colors hover:border-yellow-500 hover:shadow-lg">
            <CardHeader>
                <CardTitle className="text-lg text-white">
                    Participantes: {participantCount} / {capacity}
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <Progress value={attendancePercentage} className="h-2 bg-gray-700 [&>*]:bg-yellow-500" />
                <p className="text-sm text-gray-400">Clique para ver todos os inscritos!</p>
            </CardContent>
        </Card>
    );

    return (
 <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <div onClick={() => setIsOpen(true)}> 
                {TriggerCard}
            </div>
            
            <DialogContent className="sm:max-w-md bg-gray-900/90 border-gray-700 text-white backdrop-blur-sm">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Users className="h-6 w-6 text-yellow-500" />
                        Lista de Participantes
                    </DialogTitle>
                    <DialogDescription className="text-gray-400">
                        {`${participantCount} vaga(s) ocupada(s) para "${title}".`}
                    </DialogDescription>
                </DialogHeader>

                <div className="max-h-80 overflow-y-auto space-y-3 p-2 pr-4 custom-scrollbar">
                    {participantsList && participantsList.length > 0 ? (
                        participantsList.map(item => (
                            <div key={item._id} className={`flex items-center gap-3 p-3 bg-gray-800 rounded-lg ${item.status === 'pending' && 'opacity-50'}`}>
                                <div className="h-10 w-10 flex items-center justify-center rounded-full bg-gray-700 flex-shrink-0">
                                    {item.status === 'confirmed' ? (
                                      <User className="h-5 w-5 text-green-400" />
                                    ) : (
                                      <Clock className="h-5 w-5 text-yellow-400" />
                                    )}
                                </div>
                                <span className="font-semibold">{item.name}</span>
                                {item.status === 'pending' && <span className="ml-auto text-xs text-yellow-400 font-bold">Pendente</span>}
                            </div>
                        ))
                    ) : (
                        <p className="text-center text-gray-500 py-4">Nenhum participante ou convite pendente.</p>
                    )}
                </div>

                <Button onClick={() => setIsOpen(false)} variant="secondary" className="mt-4 w-full">
                    <X className="h-4 w-4 mr-2" /> Fechar
                </Button>
            </DialogContent>
        </Dialog>
    );
};
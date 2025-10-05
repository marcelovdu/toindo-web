"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2, Users, User, X } from 'lucide-react';
import { Progress } from './ui/progress' 
import { getEventParticipants } from '@/lib/actions/event.actions';
import { ParticipantInfoParams } from '@/types/index'; 

// Tipagem de Props
type ParticipantsModalProps = {
    eventId: string;
    title: string;
    participantCount: number;
    attendancePercentage: number;
    capacity: number;
}

export const ParticipantsModal = ({ 
    eventId, 
    title, 
    participantCount,
    attendancePercentage,
    capacity,
}: ParticipantsModalProps) => {

    const [isOpen, setIsOpen] = useState(false);

    // Armazena a lista de usuários
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
            getEventParticipants(eventId)
                .then((data) => {
                    setParticipants(data);
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
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <div onClick={() => handleOpenChange(true)}> 
                {TriggerCard}
            </div>
            
            <DialogContent className="sm:max-w-md bg-gray-900/90 border-gray-700 text-white backdrop-blur-sm">
                
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Users className="h-6 w-6 text-yellow-500" />
                        Lista de Participantes
                    </DialogTitle>
                    <DialogDescription className="text-gray-400">
                        {isLoading 
                            ? "Carregando lista de inscritos..."
                            : `${descriptionCount} pessoa(s) ${descriptionCount === 1 ? 'está' : 'estão'} confirmada(s) para "${title}".`
                        }
                    </DialogDescription>
                </DialogHeader>

                {/* Área de rolagem para a lista de usuários */}
                <div className="max-h-80 overflow-y-auto space-y-3 p-2 pr-4 custom-scrollbar">
                    {isLoading && (
                        <div className="flex justify-center py-8">
                            <Loader2 className="h-8 w-8 animate-spin text-yellow-500" />
                        </div>
                    )}

                    {/* Exibição da lista, após o carregamento */}
                    {!isLoading && participants && participants.length > 0 && (
                        participants.map(user => (
                            <div key={user._id} className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg">
                                <div className="h-10 w-10 flex items-center justify-center rounded-full bg-gray-700 flex-shrink-0">
                                    <User className="h-5 w-5 text-gray-400" />
                                </div>
                                <span className="font-semibold">{user.name}</span>
                            </div>
                        ))
                    )}
                    
                    {!isLoading && participants && participants.length === 0 && (
                        <p className="text-center text-gray-500 py-4">Nenhum participante encontrado (por enquanto!).</p>
                    )}
                </div>

                {/* Botão de fechar customizado */}
                <Button onClick={() => setIsOpen(false)} variant="secondary" className="mt-4 w-full bg-yellow-500 hover:bg-gray-500">
                    <X className="h-4 w-4 mr-2" /> Fechar
                </Button>
            </DialogContent>
        </Dialog>
    );
};
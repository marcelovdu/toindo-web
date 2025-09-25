// src/lib/actions/registration.actions.ts

"use server";

import { connectToDatabase } from '@/lib/mongodb';
import Registration from '@/models/registration';
import Event from '@/models/event'; // Precisamos do modelo Event para checar a capacidade
import { handleError } from '@/lib/utils';
import { revalidatePath } from 'next/cache';

type ToggleRegistrationParams = {
  eventId: string;
  userId: string;
  path: string; // O caminho da página para ser revalidado (ex: /events/123)
}

export const toggleRegistration = async ({ eventId, userId, path }: ToggleRegistrationParams) => {
  try {
    await connectToDatabase();

    // 1. Verifica se o usuário já está inscrito no evento
    const existingRegistration = await Registration.findOne({ event: eventId, user: userId });

    if (existingRegistration) {
      // 2. Se já estiver inscrito, cancela a inscrição (deleta o documento)
      await Registration.findByIdAndDelete(existingRegistration._id);
      
      revalidatePath(path); // Atualiza a página para refletir a mudança
      return { message: 'Inscrição cancelada com sucesso.' };
    } else {
      // 3. Se não estiver inscrito, realiza a inscrição (cria um novo documento)
      
      // 3a. Antes de inscrever, vamos checar a capacidade do evento
      const event = await Event.findById(eventId);
      if (!event) throw new Error('Evento não encontrado.');

      const currentAttendees = await Registration.countDocuments({ event: eventId });
      if (currentAttendees >= event.capacity) {
        throw new Error('Não há mais vagas para este evento.');
      }

      // 3b. Se houver vagas, cria a nova inscrição
      await Registration.create({
        event: eventId,
        user: userId
      });

      revalidatePath(path); // Atualiza a página para refletir a mudança
      return { message: 'Inscrição realizada com sucesso!' };
    }
  } catch (error) {
    handleError(error);
  }
}
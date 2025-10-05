"use server";

import { connectToDatabase } from '@/lib/mongodb';
import Registration from '@/models/registration';
import Event from '@/models/event';
import { handleError } from '@/lib/utils';
import { revalidatePath } from 'next/cache';

type ToggleRegistrationParams = {
  eventId: string;
  userId: string;
  path: string;
}

type DeleteRegistrationParams = {
  eventId: string;
  userId: string;
  path: string;
}

export const toggleRegistration = async ({ eventId, userId, path }: ToggleRegistrationParams) => {
  try {
    await connectToDatabase();

    // Verifica se o usuário já está inscrito no evento
    const existingRegistration = await Registration.findOne({ event: eventId, user: userId });

    if (existingRegistration) {
      // Se já estiver inscrito, cancela a inscrição (deleta o documento)
      await Registration.findByIdAndDelete(existingRegistration._id);
      
      revalidatePath(path); // Atualiza a página para refletir a mudança
      return { message: 'Inscrição cancelada com sucesso.' };
    } else {
      // Se não estiver inscrito, realiza a inscrição (cria um novo documento)
      
      // Antes de inscrever, vamos checar a capacidade do evento
      const event = await Event.findById(eventId);
      if (!event) throw new Error('Evento não encontrado.');

      const currentAttendees = await Registration.countDocuments({ event: eventId });
      if (currentAttendees >= event.capacity) {
        throw new Error('Não há mais vagas para este evento.');
      }

      // Se houver vagas, cria a nova inscrição
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


export async function deleteRegistration({ eventId, userId, path }: DeleteRegistrationParams) {
  try {
    await connectToDatabase();

    await Registration.deleteOne({ event: eventId, user: userId });

    revalidatePath(path);
  } catch (error) {
    handleError(error);
  }
}
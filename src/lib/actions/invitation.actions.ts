'use server';

import { connectToDatabase } from '@/lib/mongodb';
import { handleError } from '@/lib/utils';
import Event from '@/models/event';
import Invitation from '@/models/invitation';
import User from '@/models/user'
import Registration from '@/models/registration';
import { revalidatePath } from 'next/cache';
import crypto from 'crypto';

type CreateInvitationParams = {
  eventId: string;
  organizerId: string;
  guestIdentifier: string; // "Nome Sobrenome"
  path: string;
}

type DeleteInvitationParams = {
  invitationId: string;
  path: string;
}

export async function createInvitation({ eventId, organizerId, guestIdentifier, path }: CreateInvitationParams) {
  try {
    await connectToDatabase();

    const baseUrl = process.env.NEXT_PUBLIC_URL;
    if (!baseUrl) {
      throw new Error('A variável de ambiente NEXT_PUBLIC_URL não está configurada.');
    }

    
    // Busca por um convite existente para o mesmo evento e mesmo nome de convidado.
    const existingInvitation = await Invitation.findOne({ 
      event: eventId, 
      guestIdentifier: guestIdentifier.trim() 
    });

    if (existingInvitation) {
      const now = new Date();
      // Verifica se o convite encontrado ainda está válido (não expirou e está pendente).
      const isStillValid = existingInvitation.status === 'pending' && new Date(existingInvitation.expiresAt) > now;

      if (isStillValid) {
        // Se estiver ativo, retorna um erro amigável, impedindo a criação de um novo e guia o organizador.
        throw new Error(`Já existe um convite ativo para "${guestIdentifier.trim()}". Se for outra pessoa, use um nome diferente.`);
      }
      //Se o convite encontrado estiver expirado, aceito ou negado, a função continuará para criar um novo.
    }

    // Validações
    const event = await Event.findById(eventId);
    if (!event) throw new Error('Evento não encontrado.');

    if (event.organizer.toString() !== organizerId) {
      throw new Error('Apenas o organizador pode enviar convites.');
    }

    const now = new Date();
    if (new Date(event.startDateTime) < now) {
      throw new Error('Não é possível criar convites para eventos que já aconteceram.');
    }

    // Verifica se ainda há vagas, contando inscrições E convites pendentes
    const registrationCount = await Registration.countDocuments({ event: eventId });
    const pendingInvitationCount = await Invitation.countDocuments({ 
      event: eventId, 
      status: 'pending' 
    });
    const occupiedSpots = registrationCount + pendingInvitationCount;

    if (occupiedSpots >= event.capacity) {
      throw new Error('O evento já atingiu a capacidade máxima de inscrições e convites.');
    }

    // Lógica da data de expiração
    const eventStartDate = new Date(event.startDateTime);
    const hoursUntilEvent = (eventStartDate.getTime() - now.getTime()) / (1000 * 60 * 60);

    let expirationHours;
    if (hoursUntilEvent < 48) {
      expirationHours = hoursUntilEvent / 2; // Metade do tempo restante
    } else {
      expirationHours = 48; // Padrão de 48h
    }
    const expiresAt = new Date(now.getTime() + expirationHours * 60 * 60 * 1000);

    // Criação do convite
    const token = crypto.randomBytes(16).toString('hex'); // Gera um token seguro

    const newInvitation = await Invitation.create({
      event: eventId,
      organizer: organizerId,
      guestIdentifier,
      token,
      expiresAt,
    });

    revalidatePath(path);

    // Retorna o link completo para o frontend
     const invitationLink = `${baseUrl}/events/${eventId}?invite_token=${token}`;
    
    return {
      success: true,
      invitation: JSON.parse(JSON.stringify(newInvitation)),
      link: invitationLink,
    };

  } catch (error) {
    // Retorna um objeto de erro para o frontend poder tratar
    return { success: false, message: handleError(error) };
  }
}


type GetInvitationsByEventParams = {
  eventId: string;
  organizerId: string;
}

export async function getInvitationsByEvent({ eventId, organizerId }: GetInvitationsByEventParams) {
  try {
    await connectToDatabase();

    const now = new Date();
    // Encontra todos os convites pendentes DESTE evento que já passaram da data de validade
    // e atualiza o status deles para 'expired'.
    const updateResult = await Invitation.updateMany(
      { event: eventId, status: 'pending', expiresAt: { $lt: now } },
      { $set: { status: 'expired' } }
    );

    // Verificamos se algum convite foi de fato modificado
    const cleanupPerformed = updateResult.modifiedCount > 0;

    // 1. Verificação de segurança: Apenas o organizador pode ver os convites.
    const event = await Event.findById(eventId);
    if (!event) throw new Error('Evento não encontrado.');

    if (event.organizer.toString() !== organizerId) {
      throw new Error('Apenas o organizador pode ver a lista de convites.');
    }

    // 2. Busca os convites associados ao evento
    const invitations = await Invitation.find({ event: eventId })
      .sort({ createdAt: 'desc' }); // Ordena pelos mais recentes primeiro

    return { 
      invitations: JSON.parse(JSON.stringify(invitations)),
      cleanupPerformed: cleanupPerformed 
    };

  } catch (error) {
     // Retornamos um objeto de erro consistente
    return { invitations: [], cleanupPerformed: false, error: handleError(error) };
  }
}

export async function deleteInvitation({ invitationId, path }: DeleteInvitationParams) {
  try {
    await connectToDatabase();

    // Encontra e deleta o convite pelo seu ID único
    const deletedInvitation = await Invitation.findByIdAndDelete(invitationId);

    if (!deletedInvitation) {
      throw new Error('Convite não encontrado.');
    }
    
    // Se a exclusão for bem-sucedida, revalida o caminho para atualizar a UI
    revalidatePath(path);
    return { success: true, message: 'Convite excluído com sucesso.' };

  } catch (error) {
    return { success: false, message: handleError(error) };
  }
}


// FUNÇÃO PARA BUSCAR UM CONVITE PELO SEU TOKEN ÚNICO
export async function getInvitationByToken(token: string) {
  try {
    await connectToDatabase();

    // Encontra o convite usando o token
    const invitation = await Invitation.findOne({ token })
      .populate({ 
        path: 'event', 
        model: Event,
        populate: { path: 'organizer', model: User, select: '_id name' } 
      });

     if (!invitation) {
      return { data: null, error: 'Este convite é inválido ou não foi encontrado.' };
    }
    
    if (invitation.status !== 'pending') {
      return { data: null, error: 'Este convite já foi respondido.' };
    }

    const now = new Date();
    if (new Date(invitation.expiresAt) < now) {
      await Invitation.findByIdAndUpdate(invitation._id, { status: 'expired' });
      return { data: null, error: 'Este convite expirou.' };
    }
    
    return { data: JSON.parse(JSON.stringify(invitation)), error: null };

  } catch (error) {
    return { data: null, error: handleError(error) };
  }
}


type RespondToInvitationParams = {
  token: string;
  response: 'accepted' | 'denied';
  path: string;
}

// FUNÇÃO PARA O CONVIDADO RESPONDER AO CONVITE
export async function respondToInvitation({ token, response, path }: RespondToInvitationParams) {
  try {
    await connectToDatabase();

    // 1. Validações de segurança
    const invitation = await Invitation.findOne({ token });

    if (!invitation) throw new Error('Convite inválido ou não encontrado.');
    if (invitation.status !== 'pending') throw new Error('Este convite já foi respondido.');
    
    const now = new Date();
    if (new Date(invitation.expiresAt) < now) {
      await Invitation.findByIdAndUpdate(invitation._id, { status: 'expired' });
      throw new Error('Este convite expirou e não pode mais ser respondido.');
    }

    // 2. Lógica baseada na resposta
    if (response === 'accepted') {
      // Checagem final de capacidade antes de aceitar
      const event = await Event.findById(invitation.event);
      if (!event) throw new Error('O evento associado não foi encontrado.');
      
      // A contagem de "vagas ocupadas" real
      const registrationCount = await Registration.countDocuments({ event: invitation.event });
      const acceptedInvitationCount = await Invitation.countDocuments({ event: invitation.event, status: 'accepted' });
      const pendingInvitationCount = await Invitation.countDocuments({ event: invitation.event, status: 'pending' });
      
      // O total de vagas já comprometidas (sem contar este convite, que ainda é pendente)
      const occupiedSpots = registrationCount + acceptedInvitationCount + (pendingInvitationCount - 1);

      if (event.capacity > 0 && occupiedSpots >= event.capacity) {
        throw new Error('Infelizmente, as vagas para este evento se esgotaram.');
      }
      
      // ATUALIZA o status do convite
      await Invitation.findByIdAndUpdate(invitation._id, { status: 'accepted' });
      
      // CRIA a inscrição (Registration) para o convidado
      await Registration.create({
        event: invitation.event,
        guestIdentifier: invitation.guestIdentifier,
      });

    } else { // Se a resposta for 'denied'
      // Apenas atualiza o status, liberando a vaga
      await Invitation.findByIdAndUpdate(invitation._id, { status: 'denied' });
    }

    revalidatePath(path);
    return { success: true, message: `Convite ${response === 'accepted' ? 'aceito' : 'recusado'} com sucesso.` };

  } catch (error) {
    return { success: false, message: handleError(error) };
  }
}


export async function getEventRegistrationsAndInvitations(eventId: string) {
  try {
    await connectToDatabase();

    // 1. Busca as inscrições confirmadas (usuários e convidados que aceitaram)
    const registrations = await Registration.find({ event: eventId })
      .populate({ path: 'user', select: '_id name email' })
      .lean();

    // 2. Busca os convites que ainda estão pendentes
    const pendingInvitations = await Invitation.find({ event: eventId, status: 'pending' })
      .lean();

    // 3. Mapeia as inscrições confirmadas para um formato padrão
    const confirmedParticipants = registrations.map(reg => {
      if (reg.user) { // Inscrição de um usuário da plataforma
        const user = reg.user as { _id: object, name: string, email: string };
        return { 
          _id: String(user._id), 
          name: user.name, 
          status: 'confirmed' as const // Adicionamos um status
        };
      } 
      if (reg.guestIdentifier) { // Inscrição de um convidado que aceitou
        return { 
          _id: String(reg._id), 
          name: reg.guestIdentifier, 
          status: 'confirmed' as const 
        };
      }
      return null;
    }).filter(Boolean);

    // 4. Mapeia os convites pendentes para o mesmo formato padrão
    const pendingGuests = pendingInvitations.map(inv => ({
      _id: String(inv._id),
      name: inv.guestIdentifier,
      status: 'pending' as const, // Adicionamos o status
    }));

    // 5. Retorna as duas listas juntas
    return JSON.parse(JSON.stringify([...confirmedParticipants, ...pendingGuests]));

  } catch (error) {
    handleError(error);
  }
}
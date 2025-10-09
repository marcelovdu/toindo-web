'use server'

import { revalidatePath } from 'next/cache'

import { connectToDatabase } from '@/lib/mongodb'
import Event, { IEvent } from '@/models/event'
import User from '@/models/user'
import { handleError } from '@/lib/utils'
import Category from '@/models/category'
import Registration from '@/models/registration'
import Invitation from '@/models/invitation'

import {
  CreateEventParams,
  UpdateEventParams,
  GetAllEventsParams,
  GetRelatedEventsByCategoryParams,
  GetEventsByUserParams,
  GetRegisteredEventsParams,
  ParticipantInfoParams
} from '@/types/index'


const getCategoryByName = async (name: string) => {
  return Category.findOne({ name: { $regex: name, $options: 'i' } })
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const populateEvent = (query: any) => {
  return query
    .populate({ path: 'organizer', model: User, select: '_id name' })
    .populate({ path: 'category', model: Category, select: '_id name' })
}

// CREATE
export async function createEvent({ userId, event, path }: CreateEventParams) {
  try {
    await connectToDatabase()

    const organizer = await User.findById(userId)
    if (!organizer) throw new Error('Organizador não encontrado')

    const newEvent = await Event.create({ ...event, category: event.category, organizer: userId })
    revalidatePath(path)

    return JSON.parse(JSON.stringify(newEvent))
  } catch (error) {
    handleError(error)
  }
}


// UPDATE
export async function updateEvent({ userId, event, path }: UpdateEventParams) {
  try {
    await connectToDatabase()

    const eventToUpdate = await Event.findById(event._id)
    if (!eventToUpdate || eventToUpdate.organizer.toHexString() !== userId) {
      throw new Error('Evento não encontrado ou sem autorização')
    }

    const updatedEvent = await Event.findByIdAndUpdate(
      event._id,
      { ...event, category: event.category},
      { new: true }
    )
    revalidatePath(path)

    return JSON.parse(JSON.stringify(updatedEvent))
  } catch (error) {
    handleError(error)
  }
}


// DELETE
export async function deleteEvent({ eventId }: { eventId: string }) {
  try {
    await connectToDatabase()

    // Deleta todas as inscrições (registrations) associadas ao evento
    await Registration.deleteMany({ event: eventId });

    // Deleta o evento em si
    const deletedEvent = await Event.findByIdAndDelete(eventId)
    
    // Revalidar os caminhos para atualizar a UI
    if (deletedEvent) {
      revalidatePath('/explore-events')
      revalidatePath('/') 
    }
  } catch (error) {
    handleError(error)
  }
}


// GET ONE EVENT BY ID
export async function getEventById(eventId: string) {
  try {
    await connectToDatabase();

    const event = await Event.findById(eventId)
      .populate('organizer', '_id name') 
      .populate('category', '_id name');

    if (!event) {
      return null;
    }

    const registrationCount = await Registration.countDocuments({ event: event._id });
    const pendingInvitationCount = await Invitation.countDocuments({ 
      event: event._id, 
      status: 'pending' 
    });
    const participantCount = registrationCount + pendingInvitationCount;
    
    const eventObject = JSON.parse(JSON.stringify(event));

    return { ...eventObject, participantCount };
  } catch (error) {
    handleError(error);
  }
}


// GET ALL EVENTS
export async function getAllEvents({ query, limit = 6, page, category }: GetAllEventsParams) {
  try {
    await connectToDatabase()

    const titleCondition = query ? { title: { $regex: query, $options: 'i' } } : {}
    const categoryCondition = category ? await getCategoryByName(category) : null
    const conditions = {
      $and: [titleCondition, categoryCondition ? { category: categoryCondition._id } : {}],
    }
    const skipAmount = (Number(page) - 1) * limit
    const eventsQuery = Event.find(conditions)
      .sort({ createdAt: 'desc' })
      .skip(skipAmount)
      .limit(limit)
    const events = await populateEvent(eventsQuery)
    const eventsCount = await Event.countDocuments(conditions)

    const eventsWithCount = await Promise.all(events.map(async (event: IEvent) => {
    const registrationCount = await Registration.countDocuments({ event: event._id });
    const pendingInvitationCount = await Invitation.countDocuments({ 
      event: event._id, 
      status: 'pending' 
    });
    const participantCount = registrationCount + pendingInvitationCount;
      return { ...event.toObject(), participantCount };
    }));

    return {
      data: JSON.parse(JSON.stringify(eventsWithCount)),
      totalPages: Math.ceil(eventsCount / limit),
    }
  } catch (error) {
    handleError(error)
  }
}


// GET RELATED EVENTS: EVENTS WITH SAME CATEGORY
export async function getRelatedEventsByCategory({
  categoryId,
  eventId,
  limit = 3,
  page = 1,
}: GetRelatedEventsByCategoryParams) {
  try {
    await connectToDatabase();

    const skipAmount = (Number(page) - 1) * limit;
    const conditions = { $and: [{ category: categoryId }, { _id: { $ne: eventId } }] };


    const eventsQuery = Event.find(conditions)
      .sort({ createdAt: 'desc' })
      .skip(skipAmount)
      .limit(limit)
      .lean(); 

    const eventsCount = await Event.countDocuments(conditions);

    const populatedEvents = await Event.populate(await eventsQuery, [
        { path: 'organizer', model: 'User', select: '_id name' },
        { path: 'category', model: 'Category', select: '_id name' }
    ]);

    const eventsWithParticipantCount = await Promise.all(
      populatedEvents.map(async (event) => {
        const registrationCount = await Registration.countDocuments({ event: event._id });
        const pendingInvitationCount = await Invitation.countDocuments({ 
          event: event._id, 
          status: 'pending' 
        });
        const participantCount = registrationCount + pendingInvitationCount;
        return { ...event, participantCount };
      })
    );

    return {
      data: JSON.parse(JSON.stringify(eventsWithParticipantCount)),
      totalPages: Math.ceil(eventsCount / limit),
    };
  } catch (error) {
    handleError(error);
  }
}


// GET EVENTS BY USER (ORGANIZED_EVENTS) 
export async function getEventsByUser({ userId, limit = 6, page = 1 }: GetEventsByUserParams) {
  try {
    await connectToDatabase()

    const conditions = { organizer: userId }
    const skipAmount = (page - 1) * limit
    const eventsQuery = Event.find(conditions)
      .sort({ createdAt: 'desc' })
      .skip(skipAmount)
      .limit(limit)
    const events = await populateEvent(eventsQuery)
    const eventsCount = await Event.countDocuments(conditions)

    const eventsWithCount = await Promise.all(events.map(async (event: IEvent) => {
    const registrationCount = await Registration.countDocuments({ event: event._id });
    const pendingInvitationCount = await Invitation.countDocuments({ 
      event: event._id, 
      status: 'pending' 
    });
    const participantCount = registrationCount + pendingInvitationCount;
      return { ...event.toObject(), participantCount };
    }));

    return { data: JSON.parse(JSON.stringify(eventsWithCount)), totalPages: Math.ceil(eventsCount / limit) }
  } catch (error) {
    handleError(error)
  }
}


// GET EVENTS BY REGISTRATION (PARTICIPATED_EVENTS)
export async function getRegisteredEvents({ userId, limit = 6, page = 1 }: GetRegisteredEventsParams) {
  try {
    await connectToDatabase()

    const userRegistrations = await Registration.find({ user: userId }).select('event');
    const eventIds = userRegistrations.map(reg => reg.event);
    const conditions = { _id: { $in: eventIds } };
    const skipAmount = (page - 1) * limit
    const eventsQuery = Event.find(conditions)
      .sort({ createdAt: 'desc' })
      .skip(skipAmount)
      .limit(limit)
    const events = await populateEvent(eventsQuery)
    const eventsCount = await Event.countDocuments(conditions)

    const eventsWithCount = await Promise.all(events.map(async (event: IEvent) => {
    const registrationCount = await Registration.countDocuments({ event: event._id });
    const pendingInvitationCount = await Invitation.countDocuments({ 
      event: event._id, 
      status: 'pending' 
    });
    const participantCount = registrationCount + pendingInvitationCount;
      return { ...event.toObject(), participantCount };
    }));

    return { data: JSON.parse(JSON.stringify(eventsWithCount)), totalPages: Math.ceil(eventsCount / limit) }
  } catch (error) {
    handleError(error)
  }
}


export async function getEventParticipants(eventId: string): Promise<ParticipantInfoParams[]> {
    try {
        await connectToDatabase();

        // Busca todos os documentos de inscrição para este evento.
        const registrations = await Registration.find({ event: eventId })
            .populate({
                path: 'user',
                model: User,
                select: '_id name email', 
            })
            .lean();

        // Mapeia o resultado para extrair apenas a informação do usuário.
      const participants: ParticipantInfoParams[] = registrations
            .map(reg => {
                if (reg.user) {
                    const user = reg.user as { _id: object, name: string, email: string };
                    
                    if (!user) return null;

                    return {
                        _id: String(user._id), 
                        name: user.name,
                        email: user.email,
                    };
                } 
                else if (reg.guestIdentifier) {
                    return {
                        _id: String(reg._id), 
                        name: reg.guestIdentifier,
                        email: 'Convidado@gmail.com',
                    };
                }
                return null;
            })
            .filter((user): user is ParticipantInfoParams => user !== null); 
        
        return participants;

    } catch (error) {
        console.error("ERRO ao buscar participantes:", error);
        throw new Error("Falha ao carregar a lista de participantes.");
    }
}


'use server'

import { revalidatePath } from 'next/cache'

import { connectToDatabase } from '@/lib/mongodb'
import Event, { IEvent } from '@/models/event'
import User from '@/models/user'
import { handleError } from '@/lib/utils'
import Category from '@/models/category'
import Registration from '@/models/registration'

import {
  CreateEventParams,
  UpdateEventParams,
  GetAllEventsParams,
  GetRelatedEventsByCategoryParams
} from '@/types/index'


const getCategoryByName = async (name: string) => {
  return Category.findOne({ name: { $regex: name, $options: 'i' } })
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const populateEvent = (query: any) => {
  return query
    .populate({ path: 'organizer', model: User, select: '_id firstName lastName' })
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

    // 1. Deletar todas as inscrições (registrations) associadas ao evento
    // Isso garante que não fiquem dados "órfãos" no banco de dados.
    await Registration.deleteMany({ event: eventId });

    // 2. Deletar o evento em si
    const deletedEvent = await Event.findByIdAndDelete(eventId)
    
    // 3. Revalidar os caminhos para atualizar a UI
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

    // -> NOVO: Contamos as inscrições para este evento
    const participantCount = await Registration.countDocuments({ event: event._id });
    
    const eventObject = JSON.parse(JSON.stringify(event));

    // -> NOVO: Adicionamos a contagem ao objeto que retornamos
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

    return {
      data: JSON.parse(JSON.stringify(events)),
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

    // -> 1. ADICIONAMOS .lean() AQUI!
    // Isso faz com que a consulta retorne objetos JS puros, mais leves e rápidos.
    const eventsQuery = Event.find(conditions)
      .sort({ createdAt: 'desc' })
      .skip(skipAmount)
      .limit(limit)
      .lean(); // Adicionado .lean()

    const eventsCount = await Event.countDocuments(conditions);

    // A sua função populateEvent não é mais necessária aqui,
    // pois faremos o populate manualmente de forma mais controlada.
    // Vamos popular o organizador e a categoria manualmente após o lean.
    const populatedEvents = await Event.populate(await eventsQuery, [
        { path: 'organizer', model: 'User', select: '_id name' },
        { path: 'category', model: 'Category', select: '_id name' }
    ]);

    // -> 2. Agora o 'event' já é um objeto simples, então o spread é seguro.
    const eventsWithParticipantCount = await Promise.all(
      populatedEvents.map(async (event) => { // Removido o tipo IEvent daqui
        const participantCount = await Registration.countDocuments({ event: event._id });
        return { ...event, participantCount };
      })
    );

    // -> 3. Retornamos o novo array. O JSON.parse/stringify ainda é uma boa prática aqui.
    return {
      data: JSON.parse(JSON.stringify(eventsWithParticipantCount)),
      totalPages: Math.ceil(eventsCount / limit),
    };
  } catch (error) {
    handleError(error);
  }
}


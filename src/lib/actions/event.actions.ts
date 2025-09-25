'use server'

import { revalidatePath } from 'next/cache'

import { connectToDatabase } from '@/lib/mongodb'
import Event from '@/models/event'
import User from '@/models/user'
import { handleError } from '@/lib/utils'

import {
  CreateEventParams,
  UpdateEventParams,
} from '@/types/index'


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

// GET ONE EVENT BY ID
export async function getEventById(eventId: string) {
  try {
    await connectToDatabase()

    // O .populate() é importante para trazer os dados do organizador e da categoria
    const event = await Event.findById(eventId)
      .populate('organizer', '_id name') 
      .populate('category', '_id name')

    if (!event) throw new Error('Evento não encontrado')

    return JSON.parse(JSON.stringify(event))
  } catch (error) {
    handleError(error)
  }
}





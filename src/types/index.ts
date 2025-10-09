// ====== EVENT PARAMS
export type CreateEventParams = {
  userId: string
  event: {
    title: string
    description: string
    location: string
    imageUrl: string
    startDateTime: Date
    category: string
    price: string
    isFree: boolean
    capacity: number
  }
  path: string
}

export type UpdateEventParams = {
  userId: string
  event: {
    _id: string
    title: string
    imageUrl: string
    description: string
    location: string
    startDateTime: Date
    category: string
    price: string
    isFree: boolean
    capacity: number
  }
  path: string
}

export type GetRelatedEventsByCategoryParams = {
  categoryId: string
  eventId: string
  limit?: number
  page: number | string
}

export type GetEventsByUserParams = {
  userId: string;
  limit?: number;
  page?: number;
}

export type GetRegisteredEventsParams = {
  userId: string;
  limit?: number;
  page?: number;
}

export type ParticipantInfoParams = {
    _id: string;
    name: string;
    email: string;
};


// ====== CATEGORY PARAMS
export type CreateCategoryParams = {
  categoryName: string
}

export type GetAllEventsParams = {
  query: string
  category: string
  limit: number
  page: number
}

export type DeleteEventParams = {
  eventId: string
  path: string
}


// QUERY PARAMS
export type UrlQueryParams = {
  params: string
  key: string
  value: string | null
}

export type RemoveUrlQueryParams = {
  params: string
  keysToRemove: string[]
}

export type SearchParamProps = {
  params: Promise<{ id: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}
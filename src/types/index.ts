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

// ====== CATEGORY PARAMS
export type CreateCategoryParams = {
  categoryName: string
}
import React from 'react'

const Events = ({params}: {params: {id: string}}) => {
  return (
    <div>Event: #{params.id}</div>
  )
}

export default Events
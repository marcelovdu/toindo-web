import React from 'react'
import { HomeCarousel } from "@/components/HomeCarousel"
import MeetingTypeList from '@/components/MeetingTypeList'

const Home = () => {
  return (
  <div className="p-2 pt-0 space-y-12">
      {/* Banner */}
      <HomeCarousel/>
      {/* Cards/Botoes */}
      <MeetingTypeList />
      
    </div>
)
}

export default Home
import React from 'react'
import { HomeCarousel } from "@/components/HomeCarousel"
import MeetingTypeList from '@/components/MeetingTypeList'

const Home = () => {
  return (
    <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 space-y-8 sm:space-y-10 lg:space-y-12 max-w-7xl mx-auto">
      {/* Banner */}
      <div className="w-full">
        <HomeCarousel/>
      </div>
      {/* Cards/Botoes */}
      <div className="w-full">
        <MeetingTypeList />
      </div>
    </div>
  )
}

export default Home
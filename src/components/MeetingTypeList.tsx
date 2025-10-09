'use client'

import { useRouter } from 'next/navigation';
import HomeCard from './HomeCard';

const MeetingTypeList = () => {
  const router = useRouter();
  return (
    <section className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-2">
      <HomeCard
        img="/icons/add-meeting.svg"
        title="Marque algo e chame a galera."
        description="Movimente sua comunidade."
        className="bg-green-500"
       handleClick={() => router.push('/events/create')}
      />
      <HomeCard
        img="/icons/schedule.svg"
        title="Descubra os rolês na sua região."
        description="Saia e participe."
        className="bg-yellow-500"
        handleClick={() => router.push('/explore-events')}
      />
    </section>
  );
};

export default MeetingTypeList;

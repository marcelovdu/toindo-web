"use client"

import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import Autoplay from "embla-carousel-autoplay"
import { useRef } from "react"
import Image from 'next/image';
import { slides } from "@/constants";

export function HomeCarousel() {
  const plugin = useRef(Autoplay({ delay: 5000, stopOnInteraction: true }))

  return (
    <section className="w-full">
      <Carousel
        plugins={[plugin.current]}
        className="w-full"
        onMouseEnter={plugin.current.stop}
        onMouseLeave={plugin.current.reset}
      >
        <CarouselContent>
          {slides.map((slide) => (
            <CarouselItem key={slide.id}>
              <div className="bg-slate-800 rounded-xl p-4 lg:p-4">
                <div className="grid lg:grid-cols-2 gap-8 items-center">
                  {/* Text Content */}
                  <div className="space-y-4 pl-18">
                    <h1 className="text-2xl text-slate-50 lg:text-3xl font-bold leading-tight text-balance">
                      {slide.title}
                    </h1>
                    {/* Subtítulo adicionado aqui */}
                    <p className="text-slate-400 lg:text-lg text-balance">
                        {slide.subtitle}
                    </p>
                  </div>

                  {/* Image */}
                  <div className="relative mr-14">
                     <div className="aspect-[2.35/1] rounded-lg overflow-hidden bg-slate-800">
                        <Image
                            src={slide.image || "/placeholder.svg"}
                            alt={slide.imageAlt}
                            fill
                            className="object-contain"
                        />
                     </div>
                    </div>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="left-4" />
        <CarouselNext className="right-4" />
      </Carousel>
    </section>
  )
}

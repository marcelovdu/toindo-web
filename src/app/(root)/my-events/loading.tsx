import React from 'react';

// Componente reutilizável para o card "fantasma"
const SkeletonCard = () => (
  <div className="flex flex-col gap-4 w-full p-4 bg-gray-800 rounded-lg">
    <div className="skeleton h-48 w-full rounded-md"></div>
    <div className="flex flex-col gap-2">
      <div className="skeleton h-6 w-3/4 rounded-md"></div>
      <div className="skeleton h-4 w-1/2 rounded-md"></div>
    </div>
  </div>
);

// O esqueleto da página principal
export default function Loading() {
  return (
    <>
      {/* Cabeçalho da página (placeholder) */}
      <section className="bg-primary-50 bg-dotted-pattern bg-cover bg-center -mt-10 md:py-10">
        <div className="wrapper flex items-center justify-center sm:justify-between">
          <h1 className="text-center text-3xl font-bold text-white sm:text-left">
            Carregando Eventos...
          </h1>
        </div>
      </section>

      {/* Área de conteúdo principal (placeholder) */}
      <section className="wrapper -mt-12 py-8 md:py-12">
        <div className="w-full">
          <div className="flex w-full rounded-xl bg-gray-800 p-1">
            <div className="w-full rounded-lg py-4 bg-gray-700 animate-pulse"></div>
            <div className="w-full rounded-lg py-4"></div>
          </div>

          {/* Grid de cards (placeholder) */}
          <div className="mt-8 grid w-full grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:gap-10">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
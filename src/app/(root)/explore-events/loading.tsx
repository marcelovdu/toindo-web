// Um componente para o card "fantasma"
const SkeletonCard = () => (
  <div className="flex flex-col gap-4 w-full p-4 bg-gray-800 rounded-lg">
    {/* Placeholder para a imagem */}
    <div className="skeleton h-48 w-full rounded-md"></div>
    <div className="flex flex-col gap-2">
      {/* Placeholder para o título */}
      <div className="skeleton h-6 w-3/4 rounded-md"></div>
      {/* Placeholder para o texto */}
      <div className="skeleton h-4 w-1/2 rounded-md"></div>
    </div>
  </div>
);

// O esqueleto da página principal
export default function Loading() {
  return (
    <section className="wrapper my-0 flex flex-col gap-8 md:gap-12">
      <h1 className="text-3xl font-bold text-white">Carregando Eventos...</h1>

      {/* Placeholders para os filtros */}
      <div className="flex w-full flex-col gap-5 md:flex-row">
        <div className="skeleton h-12 w-full md:w-7/10 rounded-lg"></div>
        <div className="skeleton h-12 w-full md:w-3/10 rounded-lg"></div>
      </div>

      {/* Grid com os esqueletos dos cards */}
      <div className="grid w-full grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 9 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    </section>
  );
}
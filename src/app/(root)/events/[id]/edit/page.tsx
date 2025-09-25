import EventForm from "@/components/EventForm";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { getAllCategories } from "@/lib/actions/category.actions"; 
import { getEventById } from "@/lib/actions/event.actions"; // <-- 1. Importamos a nova action

// Define o tipo das props que a página receberá da URL
type UpdateEventProps = {
  params: {
    id: string;
  };
};

const UpdateEvent = async ({ params: { id } }: UpdateEventProps) => {
  // Busca a sessão e as categorias, igual na página de criação
  const session = await getServerSession(authOptions);
  const categories = await getAllCategories();
  
  // 2. BUSCA OS DADOS DO EVENTO ESPECÍFICO QUE SERÁ EDITADO
  const event = await getEventById(id);

  const userId = session?.user?.id;

  // 3. VERIFICAÇÃO DE SEGURANÇA AVANÇADA
  // Redireciona se o usuário não estiver logado OU não for o organizador do evento
  if (!userId || event?.organizer._id.toString() !== userId) {
    redirect("/");
  }

  return (
    <>
      <div className="wrapper my-8">
        <EventForm
          type="Update"
          userId={userId}
          event={event}
          eventId={event?._id}
          categories={categories || []}
        />
      </div>
    </>
  );
};

export default UpdateEvent;
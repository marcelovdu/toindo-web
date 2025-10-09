import EventForm from "@/components/EventForm";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getAllCategories } from "@/lib/actions/category.actions"; 
import { getEventById } from "@/lib/actions/event.actions";

type UpdateEventProps = {
  params: Promise<{
    id: string;
  }>;
};

const UpdateEvent = async ({ params }: UpdateEventProps) => {
  const { id } = await params;
  // Busca a sessão e as categorias
  const session = await getServerSession(authOptions);
  const categories = await getAllCategories();
  
  // Busca os dados do evento a ser editado
  const event = await getEventById(id);
  const userId = session?.user?.id;

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
          eventId={event?._id.toString()}
          categories={categories || []}
        />
      </div>
    </>
  );
};

export default UpdateEvent;
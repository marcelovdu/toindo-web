import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import EventForm from "@/components/EventForm";
import { getAllCategories } from "@/lib/actions/category.actions"; 

const CreateEvent = async () => {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
    redirect("/sign-in");
    }

  const userId = session.user.id;
  const categories = await getAllCategories();

  return (
    <>
    <div className="wrapper my-8">
        <EventForm userId={userId} type="Create" categories={categories || []} />
      </div>
   </>
  )
}

export default CreateEvent
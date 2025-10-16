import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
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

  await new Promise((resolve) => setTimeout(resolve, 1000));

  return (
    <>
      <div className="wrapper px-4 sm:px-6 lg:px-8 my-6 sm:my-8 md:my-12">
        <div className="max-w-4xl mx-auto">
          <EventForm userId={userId} type="Create" categories={categories || []} />
        </div>
      </div>
    </>
  )
}

export default CreateEvent
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSession, signOut } from "next-auth/react";
import { Loader } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const UserButton = () => {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <Loader className="size-6 mr-4 mt-4 float-right animate-spin" />;
  }

  const avatarFallback = session?.user?.name?.charAt(0).toUpperCase();

 const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' });
  };

  return (
    <nav>
      {session ? (
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger className="outline-none relative float-right p-2">
            <div className="flex gap-2 items-center">
              <span className="text-sm font-medium text-white whitespace-nowrap">{session.user?.name}</span>
              <Avatar className="size-10 hover:opacity-75 transition">
                <AvatarImage
                  className="size-10 hover:opacity-75 transition"
                  src={session.user?.image || undefined}
                />
                <AvatarFallback className="bg-sky-900 text-white">
                  {avatarFallback}
                </AvatarFallback>
              </Avatar>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" side="bottom" className="w-40 bg-azul-2">
            <DropdownMenuItem className="h-10 cursor-pointer hover:bg-dark-2 hover:text-white focus:bg-sky-900 focus:text-white" onClick={() => handleSignOut()}>
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <div className="flex justify-end p-4 gap-4">
          <Button className="bg-azul-2 text-white hover:bg-azul-1">
            <Link href="sign-in">Entrar</Link>
          </Button>
          <Button className="bg-azul-2 text-white hover:bg-azul-1">
            <Link href="sign-up">Cadastrar</Link>
          </Button>
</div>
      )}
    </nav>
  );
};

export default UserButton;

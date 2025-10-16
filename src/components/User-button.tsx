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
          <DropdownMenuTrigger className="outline-none relative float-right p-1 sm:p-2">
            <div className="flex gap-1 sm:gap-2 items-center">
              {/* Mostrar nome apenas em telas médias e maiores */}
              <span className="hidden md:block text-xs sm:text-sm lg:text-base font-medium text-white whitespace-nowrap">
                {session.user?.name}
              </span>
              <Avatar className="w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 lg:w-10 lg:h-10 hover:opacity-75 transition">
                <AvatarImage
                  className="w-full h-full hover:opacity-75 transition"
                  src={session.user?.image || undefined}
                />
                <AvatarFallback className="bg-sky-900 text-white text-xs sm:text-sm">
                  {avatarFallback}
                </AvatarFallback>
              </Avatar>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" side="bottom" className="w-32 sm:w-40 bg-azul-2">
            <DropdownMenuItem className="h-8 sm:h-10 cursor-pointer hover:bg-dark-2 hover:text-white focus:bg-sky-900 focus:text-white text-xs sm:text-sm" onClick={() => handleSignOut()}>
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <div className="flex justify-end p-2 sm:p-4 gap-2 sm:gap-4">
          <Button className="bg-azul-2 text-white hover:bg-azul-1 text-xs sm:text-sm px-2 sm:px-4 py-1 sm:py-2 h-7 sm:h-auto">
            <Link href="sign-in">Entrar</Link>
          </Button>
          <Button className="bg-azul-2 text-white hover:bg-azul-1 text-xs sm:text-sm px-2 sm:px-4 py-1 sm:py-2 h-7 sm:h-auto">
            <Link href="sign-up">Cadastrar</Link>
          </Button>
        </div>
      )}
    </nav>
  );
};

export default UserButton;

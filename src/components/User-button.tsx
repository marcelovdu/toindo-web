import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Loader } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const UserButton = () => {
  const router = useRouter();
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <Loader className="size-6 mr-4 mt-4 float-right animate-spin" />;
  }

  const avatarFallback = session?.user?.name?.charAt(0).toUpperCase();

  const handleSignOut = async () => {
    await signOut({
      redirect: false,
    });
    router.push("/");
  };

  return (
    <nav>
      {session ? (
        <DropdownMenu modal={false}>
          {/* 1. Padding geral reduzido de p-4 md:p-8 para p-2 */}
          <DropdownMenuTrigger className="outline-none relative float-right p-2">
            <div className="flex gap-2 items-center"> {/* Gap reduzido de 4 para 2 */}
              {/* 2. Tamanho da fonte do nome reduzido */}
              <span className="text-sm font-medium text-white whitespace-nowrap">{session.user?.name}</span>
              {/* 3. Tamanho do avatar reduzido de size-10 para size-8 */}
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
          <DropdownMenuContent align="end" side="bottom" className="w-40 bg-azul-2"> {/* Alterei align e w */}
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

"use client";

import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Loader } from "lucide-react";

const FullScreenLoader = () => (
  <div className="fixed inset-0 z-50 flex h-screen w-screen flex-col items-center justify-center bg-gray-900">
    <Loader className="h-12 w-12 animate-spin text-azul-2" />
    <p className="mt-4 text-lg font-semibold text-white">
      Ajustando a rota para sua próxima aventura...
    </p>
  </div>
);

const Home = () => {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <FullScreenLoader />;
  }

  return (
    <>
      <section className="bg-primary-50 bg-[url(/dotted-pattern.png)] bg-contain py-5 md:py-10">
        <div className="wrapper grid grid-cols-1 gap-5 p-50 pt-20 md:grid-cols-2 2xl:gap-0">
          <div className="flex flex-col justify-center gap-8">
            <h1 className="h1-bold text-slate-50">Organize, conecte, divirta-se: seus momentos, nossa plataforma!</h1>
            <p className="p-regular-20 md:p-regular-24 text-slate-400">Faça a sua comunidade vibrar. Marque eventos casuais, conecte-se com outras pessoas e una aqueles com interesse em comum.</p>
            
            <nav>
              {session ? (
                // Botão para o usuário LOGADO
                <Button size="lg" asChild className="button w-full sm:w-fit bg-azul-2 hover:bg-azul-1">
                  <Link href="/home">
                    Explorar
                  </Link>
                </Button>
              ) : (
                // Botão para o usuário DESLOGADO
                <Button size="lg" asChild className="button w-full sm:w-fit bg-azul-2 hover:bg-azul-1">
                  <Link href="/sign-in">
                    Explorar
                  </Link>
                </Button>
              )}
            </nav>
          </div>

          <Image 
            src="/hero.png"
            alt="hero"
            width={1200}
            height={1200}
            className=" mx-16 -my- max-h-[70vh] object-contain object-center 2x2:max-h-[50vh]"
          />
        </div>
      </section> 
      <Footer/>
    </>
  );
};

export default Home;
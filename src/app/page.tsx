"use client";

import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Loader } from "lucide-react";

const FullScreenLoader = () => (
  <div className="fixed inset-0 z-50 flex h-screen w-screen flex-col items-center justify-center bg-gray-900 px-4">
    <Loader className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 animate-spin text-azul-2" />
    <p className="mt-4 text-center text-sm sm:text-base md:text-lg font-semibold text-white">
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
      <section className="bg-primary-50 bg-[url(/dotted-pattern.png)] bg-contain py-6 sm:py-8 md:py-12 lg:py-16 xl:py-20 lg:px-12">
        <div className="wrapper grid grid-cols-1 gap-6 sm:gap-8 px-3 sm:px-4 md:px-6 lg:px-8 pt-12 sm:pt-16 md:pt-20 md:grid-cols-2 lg:gap-12 xl:gap-16 2xl:gap-0">
          <div className="flex flex-col justify-center gap-4 sm:gap-6 md:gap-8 text-center md:text-left">
            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl 2xl:text-6xl font-bold leading-tight text-slate-50">
              Organize, conecte, divirta-se: seus momentos, nossa plataforma!
            </h1>
            <p className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl text-slate-400 leading-relaxed">
              Faça a sua comunidade vibrar. Marque eventos casuais, conecte-se com outras pessoas e una aqueles com interesse em comum.
            </p>
            
            <nav className="flex justify-center md:justify-start">
              {session ? (
                // Botão para o usuário LOGADO
                <Button size="lg" asChild className="button w-full sm:w-auto px-4 sm:px-6 md:px-8 py-2 sm:py-3 md:py-4 bg-azul-2 hover:bg-azul-1 text-xs sm:text-sm md:text-base lg:text-lg font-semibold">
                  <Link href="/home">
                    Explorar
                  </Link>
                </Button>
              ) : (
                // Botão para o usuário DESLOGADO
                <Button size="lg" asChild className="button w-full sm:w-auto px-4 sm:px-6 md:px-8 py-2 sm:py-3 md:py-4 bg-azul-2 hover:bg-azul-1 text-xs sm:text-sm md:text-base lg:text-lg font-semibold">
                  <Link href="/sign-in">
                    Explorar
                  </Link>
                </Button>
              )}
            </nav>
          </div>

          <div className="flex justify-center items-center mt-6 sm:mt-8 md:mt-0">
            <Image 
              src="/hero.png"
              alt="hero"
              width={1200}
              height={1200}
              className="w-full h-auto max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl 2xl:max-w-2xl max-h-[50vh] sm:max-h-[60vh] md:max-h-[70vh] lg:max-h-[80vh] object-contain"
            />
          </div>
        </div>
      </section> 
      <Footer/>
    </>
  );
};

export default Home;
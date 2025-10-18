"use client";

// Componentes do Shadcn ui
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardDescription,
  CardContent,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

// Icones do React
import { FaGithub } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";

// Imports do React e Next 
import Link from "next/link";
import React from 'react'
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { TriangleAlert } from "lucide-react";

const SignIn = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [pending, setPending] = useState(false);
  const router = useRouter();
  const [error, setError] = useState("");
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPending(true);
    const res = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });
    if (res?.ok) {
      router.push("/");
      toast.success("Login realizado com sucesso");
    } else if (res?.status === 401) {
      setError("Credenciais inválidas");
      setPending(false);
    } else {
      setError("Algo deu errado");
    }
  }

  const handleProvider = (
    event: React.MouseEvent<HTMLButtonElement>,
    value: "github" | "google"
  ) => {
    event.preventDefault();
    signIn(value, { callbackUrl: "/home" });
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#1C1F2E] px-3 sm:px-4 py-6 sm:py-8">
      <Card className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl p-3 sm:p-4 md:p-6 lg:p-8">
        <CardHeader className="space-y-1 sm:space-y-2 md:space-y-4">
          <CardTitle className="text-center text-lg sm:text-xl md:text-2xl lg:text-3xl">Login</CardTitle>
          <CardDescription className="text-xs sm:text-sm md:text-base text-center text-accent-foreground px-2">
            Faça login com email ou serviço
          </CardDescription>
        </CardHeader>
        {!!error && (
          <div className="bg-destructive/15 p-2 sm:p-3 md:p-4 rounded-md flex items-center gap-x-2 text-xs sm:text-sm text-destructive mb-3 sm:mb-4 md:mb-6 mx-3 sm:mx-4 md:mx-6">
            <TriangleAlert className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 flex-shrink-0" />
            <p className="break-words text-xs sm:text-sm">{error}</p>
          </div>
        )}
        <CardContent className="px-3 sm:px-4 md:px-6 lg:px-8">
          <form onSubmit={handleSubmit} className="space-y-2 sm:space-y-3 md:space-y-4">
            <Input
              type="email"
              disabled={pending}
              placeholder="Seu email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="text-xs sm:text-sm md:text-base h-9 sm:h-10 md:h-12"
            />
            <Input
              type="password"
              disabled={pending}
              placeholder="Sua senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="text-xs sm:text-sm md:text-base h-9 sm:h-10 md:h-12"
            />
            <Button className="w-full h-9 sm:h-10 md:h-12 text-xs sm:text-sm md:text-base" size="lg" disabled={pending}>
              Continuar
            </Button>
          </form>
          <Separator className="my-3 sm:my-4 md:my-6" />
          <div className="flex my-3 sm:my-4 md:my-6 justify-center gap-3 sm:gap-4 md:gap-6 mx-auto items-center">
            <Button
              disabled={false}
              onClick={(e) => handleProvider(e, "google")} 
              variant="outline"
              size="lg"
              className="bg-slate-300 hover:bg-slate-400 hover:scale-110 transition-transform duration-200 p-2 sm:p-2.5 md:p-3"
            >
              <FcGoogle className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8" />
            </Button>
            <Button
              disabled={false}
              onClick={(e) => handleProvider(e, "github")}
              variant="outline"
              size="lg"
              className="bg-slate-300 hover:bg-slate-400 hover:scale-110 transition-transform duration-200 p-2 sm:p-2.5 md:p-3"
            >
              <FaGithub className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8" />
            </Button>
          </div>
          <p className="text-center text-xs sm:text-sm mt-2 sm:mt-4 text-muted-foreground px-2">
            Sem conta? Crie uma nova.
            <Link
              className="text-sky-700 ml-1 sm:ml-2 md:ml-4 hover:underline cursor-pointer break-words"
              href="sign-up"
            >
              Criar conta
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

export default SignIn
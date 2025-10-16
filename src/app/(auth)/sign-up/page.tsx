"use client";

// React
import Link from "next/link";

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
import React, { useState } from 'react'
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { TriangleAlert } from "lucide-react";
import { signIn } from "next-auth/react";

const SignUp = () => {
    const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();

const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPending(true);

    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();

    if (res.ok) {
      setPending(false);
      toast.success(data.message);
      router.push("/sign-in");
    } else if (res.status === 400) {
      setError(data.message);
      setPending(false);
    } else if (res.status === 500) {
      setError(data.message);
      setPending(false);
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
          <CardTitle className="text-center text-lg sm:text-xl md:text-2xl lg:text-3xl">Cadastro</CardTitle>
          <CardDescription className="text-xs sm:text-sm md:text-base text-center text-accent-foreground px-2">
            Crie uma conta com email ou serviço
          </CardDescription>
        </CardHeader>
        {!!error && (
          <div className="bg-destructive/15 p-3 sm:p-4 rounded-md flex items-center gap-x-2 text-xs sm:text-sm text-destructive mb-4 sm:mb-6 mx-4 sm:mx-6">
            <TriangleAlert className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
            <p className="break-words">{error}</p>
          </div>
        )}
        <CardContent className="px-4 sm:px-6 md:px-8">
          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
            <Input
              type="text"
              disabled={pending}
              placeholder="Seu nome"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              className="text-sm sm:text-base h-10 sm:h-12"
            />
            <Input
              type="email"
              disabled={pending}
              placeholder="Seu email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
              className="text-sm sm:text-base h-10 sm:h-12"
            />
            <Input
              type="password"
              disabled={pending}
              placeholder="Crie uma senha"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
              className="text-sm sm:text-base h-10 sm:h-12"
            />
            <Input
              type="password"
              disabled={pending}
              placeholder="Confirme sua senha"
              value={form.confirmPassword}
              onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
              required
              className="text-sm sm:text-base h-10 sm:h-12"
            />
            <Button className="w-full h-10 sm:h-12 text-sm sm:text-base" size="lg" disabled={false}>
              Continuar
            </Button>
          </form>
          <Separator className="my-4 sm:my-6" />
          <div className="flex my-4 sm:my-6 justify-center gap-4 sm:gap-6 mx-auto items-center">
            <Button
              disabled={false}
              onClick={(e) => handleProvider(e, "google")} 
              variant="outline"
              size="lg"
              className="bg-slate-300 hover:bg-slate-400 hover:scale-110 transition-transform duration-200 p-2 sm:p-3"
            >
              <FcGoogle className="w-6 h-6 sm:w-8 sm:h-8" />
            </Button>
            <Button
              disabled={false}
              onClick={(e) => handleProvider(e, "github")}
              variant="outline"
              size="lg"
              className="bg-slate-300 hover:bg-slate-400 hover:scale-110 transition-transform duration-200 p-2 sm:p-3"
            >
              <FaGithub className="w-6 h-6 sm:w-8 sm:h-8" />
            </Button>
          </div>
          <p className="text-center text-xs sm:text-sm mt-2 sm:mt-4 text-muted-foreground">
            Você já tem uma conta?
            <Link
              className="text-sky-700 ml-2 sm:ml-4 hover:underline cursor-pointer break-words"
              href="sign-in"
            >
              Fazer login {" "}
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

export default SignUp
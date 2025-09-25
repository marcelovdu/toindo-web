// types/next-auth.d.ts

import NextAuth, { DefaultSession } from "next-auth";
import { JWT } from "next-auth/jwt";

// Estende o tipo padrão Profile para incluir 'login' do GitHub
declare module "next-auth" {
  interface Profile {
    login?: string;
  }

  interface Session {
    user: {
      id: string; 
    } & DefaultSession['user'];
  }
}

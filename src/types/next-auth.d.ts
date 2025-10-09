// types/next-auth.d.ts

import { DefaultSession } from "next-auth";

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

import mongoose from "mongoose";
import { NextAuthOptions }  from "next-auth";
import User from "@/models/user";
import connectToDatabase from "@/lib/mongodb";
import bcrypt from "bcryptjs";
import CredentialsProvider from "next-auth/providers/credentials";
import Github from "next-auth/providers/github";
import Google from "next-auth/providers/google";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
    },
    providers: [
        Github({
            clientId: process.env.GITHUB_ID as string,
            clientSecret: process.env.GITHUB_SECRET as string,
        }),
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
        }),
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: {},
                password:{},
            },
            async authorize(credentials) {
                try {
                    await connectToDatabase();
                    const user = await User.findOne({ email: credentials?.email });
                    if (!user) {
                        throw new Error("Nenhum usuário encontrado com este e-mail.")
                    }
                    const isValidPassword = await bcrypt.compare(
                        credentials?.password ?? "", user.password as string
                    ); 
                    if (!isValidPassword) {
                        throw new Error ("Senha incorreta.")
                    }
                    return user;
                }
                catch {
                    return null
                }
            }
        })

    ],
    callbacks: {
        async signIn({ account, profile }) {
        if (account?.provider === "github" || account?.provider === "google") {
            await connectToDatabase();
            try {
            const existingUser = await User.findOne({ email: profile?.email });
            if (!existingUser) {
                await User.create({
                    name: profile?.name || profile?.login,
                    email: profile?.email,
                });
            }
            } catch (error) {
                console.error("Erro ao salvar usuário do provedor OAuth:", error);
                return false;
            }
        }
    return true;
        },
        async jwt({ token, user }) {
            if (user) {
                await connectToDatabase();
                const dbUser = await User.findOne({ email: user.email });

                if (dbUser) {
                    token.id = (dbUser._id as mongoose.Types.ObjectId).toString();
                    token.email = dbUser.email;
                }
            }
            
            return token;
        },
        async session({ session, token }) {
            if (token) {
                session.user = {
                    id: token.id as string,
                    email: token.email,
                    name: token.name,
                    image: token.picture,
                };
            };
            return session;
        }
        
    },
    pages: {
       signIn: "/sign-in",
    },
    secret: process.env.NEXTAUTH_SECRET
};
import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import { prisma } from "./prisma"
import bcrypt from "bcryptjs"

export const authOptions: NextAuthOptions = {
  // We remove the adapter and handle syncing manually to avoid version conflicts between v4 and v5 packages
  session: { strategy: "jwt" },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        pin:   { label: "PIN",   type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.pin) return null
        const user = await prisma.user.findUnique({
          where: { email: credentials.email.toLowerCase() },
        })
        if (!user || !user.pinHash) return null
        const valid = await bcrypt.compare(credentials.pin, user.pinHash)
        if (!valid) return null
        return { id: user.id, email: user.email, name: user.name }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === 'google' && user.email) {
        try {
          // Manually sync Google user to our database
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email.toLowerCase() }
          })

          if (existingUser) {
            // Check if account is already linked
            const existingAccount = await prisma.account.findFirst({
              where: { 
                provider: 'google', 
                providerAccountId: account.providerAccountId 
              }
            })

            if (!existingAccount) {
              await prisma.account.create({
                data: {
                  userId: existingUser.id,
                  type: account.type,
                  provider: account.provider,
                  providerAccountId: account.providerAccountId,
                  access_token: account.access_token,
                  expires_at: account.expires_at,
                  id_token: account.id_token,
                  token_type: account.token_type,
                  scope: account.scope,
                }
              })
            }
            // Update image if missing
            if (!existingUser.image && user.image) {
              await prisma.user.update({
                where: { id: existingUser.id },
                data: { image: user.image }
              })
            }
          } else {
            // Create new user and link account
            await prisma.user.create({
              data: {
                email: user.email.toLowerCase(),
                name: user.name || 'User',
                image: user.image,
                accounts: {
                  create: {
                    type: account.type,
                    provider: account.provider,
                    providerAccountId: account.providerAccountId,
                    access_token: account.access_token,
                    expires_at: account.expires_at,
                    id_token: account.id_token,
                    token_type: account.token_type,
                    scope: account.scope,
                  }
                }
              }
            })
          }
          return true
        } catch (err) {
          console.error("CRITICAL AUTH SYNC ERROR:", err)
          // We return true anyway to let the JWT callback handle it if the user was created but account linking failed
          return true 
        }
      }
      return true
    },
    async jwt({ token, user, account }) {
      // After manual sync, we find the user ID to ensure it's in the token
      if (user?.email) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { email: user.email.toLowerCase() }
          })
          if (dbUser) {
            token.id = dbUser.id
          }
        } catch (e) {
          console.error("JWT Callback Error:", e)
        }
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id as string
      }
      return session
    },
  },
  pages: {
    signIn: "/login",
    error: "/login", // Redirect to login on error
  },
  debug: true,
  secret: process.env.NEXTAUTH_SECRET,
}

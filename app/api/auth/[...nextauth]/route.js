import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import { supabase } from "@/lib/supabase"

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  
  callbacks: {
    async signIn({ user, account, profile }) {
      try {
        
        const { data: existingUser } = await supabase
          .from('users')
          .select('*')
          .eq('email', user.email)
          .single()

        if (!existingUser) {
         
          await supabase.from('users').insert({
            email: user.email,
            name: user.name,
            image: user.image,
            provider: account.provider,
            provider_account_id: account.providerAccountId,
            access_token: account.access_token,
            refresh_token: account.refresh_token,
            created_at: new Date().toISOString(),
          })
        } else {
          
          await supabase
            .from('users')
            .update({
              name: user.name,
              image: user.image,
              access_token: account.access_token,
              refresh_token: account.refresh_token,
              last_sign_in: new Date().toISOString(),
            })
            .eq('email', user.email)
        }
        
        return true
      } catch (error) {
        console.error('Error storing user in Supabase:', error)
        return false
      }
    },
    
    async session({ session, token }) {
     
      if (session.user) {
        const { data } = await supabase
          .from('users')
          .select('id')
          .eq('email', session.user.email)
          .single()
        
        if (data) {
          session.user.id = data.id
        }
      }
      return session
    }
  }
})

export { handler as GET, handler as POST }
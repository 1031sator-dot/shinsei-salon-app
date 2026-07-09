import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID || "dummy",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "dummy",
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      const allowedEmail = process.env.ALLOWED_ADMIN_EMAIL;
      
      // ALLOWED_ADMIN_EMAILが設定されていない場合は、セキュリティのためログインを完全にブロックする
      if (!allowedEmail) {
        console.error("CRITICAL SECURITY ERROR: ALLOWED_ADMIN_EMAIL is not configured in environment variables.");
        return false; 
      }
      
      // 指定されたメールアドレスと一致する場合のみ許可
      if (user.email === allowedEmail) {
        return true;
      }
      
      return false; // それ以外はブロック
    },
  },
  pages: {
    signIn: "/admin", // カスタムログインページへのパス
    error: "/admin?error=AccessDenied", 
  },
  secret: process.env.AUTH_SECRET || "super-secret-fallback-key-change-in-production",
});

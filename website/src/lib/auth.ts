import NextAuth from "next-auth"
import { DrizzleAdapter } from "@auth/drizzle-adapter"
import Resend from "next-auth/providers/resend"
import { Resend as ResendClient } from "resend"
import { db } from "@/db"

let _resend: ResendClient | null = null
function getResend() {
  if (!_resend) {
    _resend = new ResendClient(process.env.AUTH_RESEND_KEY!)
  }
  return _resend
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: DrizzleAdapter(db),
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  providers: [
    Resend({
      from: "BellaMD <noreply@bellamarkdown.com>",
      async sendVerificationRequest({ identifier: email, url }) {
        await getResend().emails.send({
          from: "BellaMD <noreply@bellamarkdown.com>",
          to: email,
          subject: "Sign in to BellaMD",
          html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #f5f5f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 460px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.08);">
          <!-- Header -->
          <tr>
            <td style="padding: 32px 32px 0; text-align: center;">
              <img src="https://bellamarkdown.com/icon.png" width="48" height="48" alt="BellaMD" style="border-radius: 10px;" />
              <h1 style="margin: 16px 0 0; font-size: 20px; font-weight: 600; color: #0a0a0a;">
                Sign in to BellaMD
              </h1>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding: 24px 32px 32px;">
              <p style="margin: 0 0 24px; font-size: 15px; line-height: 1.6; color: #525252; text-align: center;">
                Click the button below to sign in to your account. This link expires in 24 hours.
              </p>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="${url}" style="display: inline-block; padding: 12px 32px; background-color: #0EA5E9; color: #ffffff; font-size: 15px; font-weight: 500; text-decoration: none; border-radius: 8px;">
                      Sign in
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin: 24px 0 0; font-size: 13px; line-height: 1.5; color: #a3a3a3; text-align: center;">
                If you didn't request this email, you can safely ignore it.
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding: 16px 32px; border-top: 1px solid #e5e5e5; text-align: center;">
              <p style="margin: 0; font-size: 12px; color: #a3a3a3;">
                BellaMD &mdash; Beautiful Markdown Editing
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
        })
      },
    }),
  ],
  pages: {
    signIn: "/login",
    verifyRequest: "/check-email",
  },
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    session({ session, token }) {
      session.user.id = token.id as string
      return session
    },
  },
})

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { LoginForm } from "./login-form"

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 dark:bg-black">
      <Header />
      <div className="flex flex-1 items-center justify-center px-4">
        <div className="w-full max-w-sm space-y-8">
          <div className="text-center">
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
              Sign in to BellaMD
            </h1>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              Enter your email to receive a magic link
            </p>
          </div>
          <LoginForm />
        </div>
      </div>
      <Footer />
    </div>
  )
}

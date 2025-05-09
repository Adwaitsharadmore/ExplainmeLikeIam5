import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import Link from "next/link"
import { Bounce } from "@/components/animations/bounce"
import { Logo } from "@/components/logo"

export default function WelcomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-purple-100 to-blue-100 p-4">
      <div className="max-w-4xl w-full text-center space-y-8">
        <div className="flex justify-center">
          <Bounce>
            <Logo size="lg" showText={false} />
          </Bounce>
        </div>

        <h1 className="text-4xl md:text-6xl font-bold text-green-600 tracking-tight">
          Welcome to HealthQuest Kingdom!
        </h1>

        <p className="text-xl md:text-2xl text-orange-500">
          Your super-awesome adventure to become healthy and strong!
        </p>

        <div className="flex justify-center mt-8">
          <Link href="/setup">
            <Button
              size="lg"
              className="text-lg px-8 py-6 bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 rounded-full shadow-lg group relative overflow-hidden"
            >
              <span className="relative z-10 flex items-center gap-2">
                Start Your Adventure! <ArrowRight className="h-5 w-5 animate-pulse" />
              </span>
              <span className="absolute inset-0 bg-gradient-to-r from-green-400 to-teal-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
            </Button>
          </Link>
        </div>

        <div className="mt-8">
          <Button variant="outline" className="rounded-full">
            <span className="flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-volume-2"
              >
                <path d="M11 5 6 9H2v6h4l5 4V5Z" />
                <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
              </svg>
              Toggle Music
            </span>
          </Button>
        </div>
      </div>
    </div>
  )
}

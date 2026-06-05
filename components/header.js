"use client"

import { useSession, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Bookmark, LogOut, LogIn } from "lucide-react"
import { useRouter } from "next/navigation"

export default function Header() {
  const { data: session } = useSession()
  const router = useRouter()

  return (
    <div className="w-full flex justify-center pt-6">
      <div className="w-[95%] max-w-6xl bg-white rounded-2xl px-6 py-5 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#4b5d47] flex items-center justify-center shadow-md">
            <Bookmark className="text-white" size={22} />
          </div>

          <div className="flex flex-col">
            <h1 className="text-2xl font-semibold text-black">
              Smart Bookmark
            </h1>

            {session?.user && (
              <>
                <span className="text-sm text-gray-700">
                  {session.user.name}
                </span>
                <span className="text-xs text-gray-500">
                  {session.user.email}
                </span>
              </>
            )}
          </div>
        </div>

        {session?.user ? (
          <Button
            variant="ghost"
            onClick={() => signOut({ callbackUrl: "/signup" })}
            className="flex items-center gap-2"
          >
            <LogOut size={18} />
            Sign out
          </Button>
        ) : (
          <Button
            variant="ghost"
            onClick={() => router.push("/signup")}
            className="flex items-center gap-2"
          >
            <LogIn size={18} />
            Login
          </Button>
        )}
      </div>
    </div>
  )
}
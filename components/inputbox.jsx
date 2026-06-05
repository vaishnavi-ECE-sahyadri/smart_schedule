"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"

const schema = z.object({
  title: z.string().min(1, "Title is required"),
  url: z.string().url("Invalid URL format - must start with http:// or https://"),
})

export default function InputBox() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      title: "",
      url: "",
    },
  })

  async function onSubmit(values) {
    if (!session?.user?.id) {
      router.push("/signup")
      return
    }

    const promise = fetch("/api/bookmarks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...values,
        userId: session.user.id,
      }),
    }).then(async (res) => {
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to add bookmark")
      return data
    })

    toast.promise(promise, {
      loading: "Adding bookmark...",
      success: "Bookmark added successfully! 🎉",
      error: (err) => err.message,
    })

    try {
      const newBookmark = await promise

      
      window.dispatchEvent(
        new CustomEvent("bookmark:created", { detail: newBookmark })
      )

      reset()
    } catch {}
  }

  if (status === "unauthenticated") {
    router.push("/signup")
    return null
  }

  return (
    <div className="w-full flex justify-center pt-10">
      <div className="w-[95%] max-w-6xl">
        <Card className="w-full rounded-2xl shadow-sm border-[#e5e3df] bg-white">
          <CardHeader className="pb-4">
            <CardTitle className="text-2xl font-semibold flex items-center gap-2 text-[#1a1a1a]">
              <span className="text-2xl">✨</span>
              Add New Bookmark
            </CardTitle>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-[#1a1a1a]">
                    Title
                  </Label>
                  <Input
                    {...register("title")}
                    placeholder="spotify"
                    className="h-12 border-[#e5e3df] focus-visible:ring-[#2d5f4f] focus-visible:border-[#2d5f4f]"
                  />
                  {errors.title && (
                    <p className="text-sm text-red-600">
                      {errors.title.message}
                    </p>
                  )}
                </div>

              
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-[#1a1a1a]">
                    URL
                  </Label>
                  <Input
                    {...register("url")}
                    placeholder="https://open.spotify.com/"
                    className="h-12 border-[#e5e3df] focus-visible:ring-[#2d5f4f] focus-visible:border-[#2d5f4f]"
                  />
                  {errors.url && (
                    <p className="text-sm text-red-600">
                      {errors.url.message}
                    </p>
                  )}
                </div>
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="h-12 px-8 bg-[#2d5f4f] hover:bg-[#234a3d] text-white font-medium rounded-lg transition-all duration-200"
              >
                {isSubmitting ? "Adding..." : "+ Add Bookmark"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
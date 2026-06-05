"use client"

import { useEffect, useState, useCallback } from "react"
import { useSession } from "next-auth/react"
import { toast } from "sonner"
import {
  Search,
  ExternalLink,
  Trash2,
  Edit,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  X,
  Check
} from "lucide-react"
import { createClient } from "@supabase/supabase-js"

import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"


const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

const ITEMS_PER_PAGE = 5

export default function Bookmarks() {
  const { data: session } = useSession()
  const [bookmarks, setBookmarks] = useState([])
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [editing, setEditing] = useState(null)
  const [loading, setLoading] = useState(false)


  const userId = session?.user?.id


  async function fetchBookmarks() {
    if (!userId) return
    setLoading(true)

    try {
      const res = await fetch(
        `/api/bookmarks?userId=${userId}&search=${search}`
      )
      const data = await res.json()

      if (!res.ok) throw new Error(data.error)
      setBookmarks(data)
    } catch (err) {
      toast.error(err.message || "Failed to fetch bookmarks")
    } finally {
      setLoading(false)
    }
  }


  useEffect(() => {
    fetchBookmarks()
  }, [userId, search])



  useEffect(() => {
    function handleBookmarkCreated(e) {
      const newBookmark = e.detail
      if (!newBookmark) return

      localMutations.add(newBookmark.id?.toString())

      setBookmarks((prev) => {

        if (prev.some((b) => b.id === newBookmark.id)) return prev
        return [newBookmark, ...prev]
      })


      setPage(1)
    }

    window.addEventListener("bookmark:created", handleBookmarkCreated)
    return () => window.removeEventListener("bookmark:created", handleBookmarkCreated)
  }, [])


  const localMutations = useCallback(() => {
    const pending = new Set()
    return {
      add: (id) => pending.add(id),
      has: (id) => pending.has(id),
      delete: (id) => pending.delete(id),
    }
  }, [])()

  useEffect(() => {
    if (!userId) return

    const channel = supabase
      .channel("bookmarks-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "bookmarks",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const id = (payload.new?.id ?? payload.old?.id)?.toString()

          
          if (localMutations.has(id)) {
            localMutations.delete(id)
            return
          }

         
          if (payload.eventType === "INSERT") {
            setBookmarks((prev) => {
              if (prev.some((b) => b.id === payload.new.id)) return prev
              return [payload.new, ...prev]
            })
            toast.success("New bookmark added!", {
              description: payload.new.title,
              icon: <Sparkles className="h-4 w-4" />,
            })
          } else if (payload.eventType === "UPDATE") {
            setBookmarks((prev) =>
              prev.map((b) => (b.id === payload.new.id ? payload.new : b))
            )
            toast.success("Bookmark updated!", {
              icon: <Check className="h-4 w-4" />,
            })
          } else if (payload.eventType === "DELETE") {
            setBookmarks((prev) =>
              prev.filter((b) => b.id !== payload.old.id)
            )
            toast.success("Bookmark deleted!", {
              icon: <Trash2 className="h-4 w-4" />,
            })
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId])



  async function handleUpdate() {
    if (!editing.title.trim() || !editing.url.trim()) {
      toast.error("Title and URL are required")
      return
    }

    const previous = bookmarks.find((b) => b.id === editing.id)

    setBookmarks((prev) =>
      prev.map((b) => (b.id === editing.id ? { ...b, ...editing } : b))
    )
    setEditing(null)

    try {
      const res = await fetch("/api/bookmarks", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editing.id,
          title: editing.title,
          url: editing.url,
          userId,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      localMutations.add(editing.id?.toString())
      toast.success(data.message || "Bookmark updated successfully", {
        icon: <Check className="h-4 w-4" />,
      })
    } catch (err) {
      if (previous) {
        setBookmarks((prev) =>
          prev.map((b) => (b.id === previous.id ? previous : b))
        )
      }
      toast.error(err.message || "Failed to update bookmark")
    }
  }

  
  async function handleDelete(id) {
    const previous = bookmarks.find((b) => b.id === id)

    setBookmarks((prev) => prev.filter((b) => b.id !== id))

    try {
      const res = await fetch(`/api/bookmarks?id=${id}&userId=${userId}`, {
        method: "DELETE",
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      localMutations.add(id?.toString())
      toast.success(data.message || "Bookmark deleted successfully", {
        icon: <Trash2 className="h-4 w-4" />,
      })
    } catch (err) {

      if (previous) {
        setBookmarks((prev) =>
          [...prev, previous].sort(
            (a, b) => new Date(b.created_at) - new Date(a.created_at)
          )
        )
      }
      toast.error(err.message || "Failed to delete bookmark")
    }
  }


  const totalPages = Math.ceil(bookmarks.length / ITEMS_PER_PAGE)
  const paginatedBookmarks = bookmarks.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  )

  return (
    <div className="w-full min-h-screen bg-white border border-[#e5e3df] rounded-2xl shadow-lg pt-10 pb-20">
      <div className="w-[95%] max-w-6xl mx-auto space-y-6">


        <div>
          <h1 className="text-3xl font-bold text-[#1a1a1a]">My Bookmarks</h1>
          <p className="text-sm text-gray-500 mt-1">
            Real-time synchronized across all devices
          </p>
        </div>


        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            placeholder="Search bookmarks..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            className="h-14 pl-12 bg-white border-[#e5e3df] rounded-xl shadow-sm text-base focus-visible:ring-[#2d5f4f] focus-visible:border-[#2d5f4f]"
          />
        </div>


        {loading && (
          <div className="text-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#2d5f4f] border-r-transparent"></div>
            <p className="mt-4 text-gray-500">Loading bookmarks...</p>
          </div>
        )}


        {!loading && paginatedBookmarks.length === 0 && (
          <Card className="rounded-2xl border-[#e5e3df] shadow-sm">
            <CardContent className="p-12 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#faf9f7] flex items-center justify-center">
                <Search className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-[#1a1a1a] mb-2">
                {search ? "No bookmarks found" : "No bookmarks yet"}
              </h3>
              <p className="text-gray-500">
                {search
                  ? "Try adjusting your search"
                  : "Use the input box above to add your first bookmark"}
              </p>
            </CardContent>
          </Card>
        )}


        {!loading && paginatedBookmarks.length > 0 && (
          <div className="space-y-4">
            {paginatedBookmarks.map((bookmark, index) => (
              <Card
                key={bookmark.id}
                className="group rounded-2xl border-[#e5e3df] shadow-sm bg-white hover:shadow-lg hover:border-[#8b7355] transition-all duration-300 hover:-translate-y-1 animate-in slide-in-from-bottom duration-300"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <CardContent className="p-6">
                  <div className="flex justify-between items-start gap-4">

                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#2d5f4f] to-[#8b7355] flex items-center justify-center flex-shrink-0 shadow-md">
                          <span className="text-white text-lg font-bold">
                            {bookmark.title.charAt(0).toUpperCase()}
                          </span>
                        </div>

                        <div className="flex-1 min-w-0">
                          <h2 className="text-lg font-semibold text-[#1a1a1a] group-hover:text-[#2d5f4f] transition-colors">
                            {bookmark.title}
                          </h2>

                          <a
                            href={bookmark.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-sm text-[#8b7355] hover:text-[#2d5f4f] hover:underline transition-colors mt-1"
                          >
                            <ExternalLink className="h-3.5 w-3.5 flex-shrink-0" />
                            <span className="truncate">
                              {(() => {
                                try {
                                  const u = new URL(bookmark.url);
                                  const display = u.hostname + u.pathname.replace(/\/$/, '') + u.search;
                                  return display.length > 40 ? display.slice(0, 40) + '…' : display;
                                } catch {
                                  return bookmark.url.length > 40 ? bookmark.url.slice(0, 40) + '…' : bookmark.url;
                                }
                              })()}
                            </span>
                          </a>

                          <p className="text-xs text-gray-500 mt-2">
                            Added {new Date(bookmark.created_at).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="hidden sm:flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditing(bookmark)}
                        className="border-[#e5e3df] hover:bg-[#faf9f7] hover:border-[#8b7355] transition-all"
                      >
                        <Edit className="h-4 w-4 mr-1.5" />
                        Edit
                      </Button>

                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => {
                          if (confirm(`Delete "${bookmark.title}"?`)) {
                            handleDelete(bookmark.id)
                          }
                        }}
                        className="bg-[#b91c1c] hover:bg-[#991b1b] transition-all"
                      >
                        <Trash2 className="h-4 w-4 mr-1.5" />
                        Delete
                      </Button>
                    </div>
                  </div>

                  <div className="mt-4 flex gap-2 sm:hidden pt-4 border-t border-[#e5e3df]">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setEditing(bookmark)}
                      className="flex-1 border-[#e5e3df] hover:bg-[#faf9f7]"
                    >
                      <Edit className="h-4 w-4 mr-1.5" />
                      Edit
                    </Button>

                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => {
                        if (confirm(`Delete "${bookmark.title}"?`)) {
                          handleDelete(bookmark.id)
                        }
                      }}
                      className="flex-1 bg-[#b91c1c] hover:bg-[#991b1b]"
                    >
                      <Trash2 className="h-4 w-4 mr-1.5" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}


        {!loading && bookmarks.length > ITEMS_PER_PAGE && (
          <div className="flex justify-center items-center gap-4 py-4">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
              className="border-[#e5e3df] hover:bg-[#faf9f7] disabled:opacity-50"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Prev
            </Button>

            <span className="text-sm text-gray-600 font-medium">
              Page {page} of {totalPages}
            </span>

            <Button
              variant="outline"
              size="sm"
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
              className="border-[#e5e3df] hover:bg-[#faf9f7] disabled:opacity-50"
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        )}


        {!loading && bookmarks.length > 0 && (
          <Card className="rounded-2xl border-[#e5e3df] shadow-sm bg-gradient-to-r from-white to-[#faf9f7] 
          animate-in fade-in duration-500 overflow-y-auto"
          >
            <CardContent className="p-6 text-center">
              <p className="text-sm text-gray-600">
                You have{" "}
                <span className="font-bold text-[#2d5f4f] text-lg">
                  {bookmarks.length}
                </span>{" "}
                {bookmarks.length === 1 ? "bookmark" : "bookmarks"} saved
              </p>

            </CardContent>
          </Card>
        )}

        <Dialog open={!!editing} onOpenChange={() => setEditing(null)}>
          <DialogContent className="sm:max-w-[500px] border-[#e5e3df] bg-white">
            <DialogHeader>
              <DialogTitle className="text-xl text-[#1a1a1a] flex items-center gap-2">
                <Edit className="h-5 w-5 text-[#2d5f4f]" />
                Edit Bookmark
              </DialogTitle>
            </DialogHeader>

            {editing && (
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#1a1a1a]">
                    Title
                  </label>
                  <Input
                    value={editing.title}
                    onChange={(e) =>
                      setEditing({ ...editing, title: e.target.value })
                    }
                    placeholder="Bookmark title"
                    className="border-[#e5e3df] focus-visible:ring-[#2d5f4f] focus-visible:border-[#2d5f4f]"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#1a1a1a]">
                    URL
                  </label>
                  <Input
                    value={editing.url}
                    onChange={(e) =>
                      setEditing({ ...editing, url: e.target.value })
                    }
                    placeholder="https://example.com"
                    className="border-[#e5e3df] focus-visible:ring-[#2d5f4f] focus-visible:border-[#2d5f4f]"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    className="flex-1 bg-[#2d5f4f] hover:bg-[#234a3d] text-white"
                    onClick={handleUpdate}
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Save Changes
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 border-[#e5e3df] hover:bg-[#faf9f7]"
                    onClick={() => setEditing(null)}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
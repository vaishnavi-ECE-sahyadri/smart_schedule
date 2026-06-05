import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// GET - Fetch bookmarks
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get("userId")
    const search = searchParams.get("search") || ""

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      )
    }

    let query = supabase
      .from("bookmarks")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    // Apply search filter if provided
    if (search) {
      query = query.or(`title.ilike.%${search}%,url.ilike.%${search}%`)
    }

    const { data, error } = await query

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json(data, { status: 200 })
  } catch (err) {
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    )
  }
}

// POST - Create bookmark
export async function POST(req) {
  try {
    const body = await req.json()
    const { title, url, userId } = body

    if (!title || !url || !userId) {
      return NextResponse.json(
        { error: "Missing required fields: title, url, userId" },
        { status: 400 }
      )
    }

    // Validate URL format
    try {
      new URL(url)
    } catch {
      return NextResponse.json(
        { error: "Invalid URL format" },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from("bookmarks")
      .insert([
        {
          title: title.trim(),
          url: url.trim(),
          user_id: userId,
        },
      ])
      .select()

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json(data[0], { status: 201 })
  } catch (err) {
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    )
  }
}

// PUT - Update bookmark
export async function PUT(req) {
  try {
    const body = await req.json()
    const { id, title, url, userId } = body

    if (!id || !title || !url || !userId) {
      return NextResponse.json(
        { error: "Missing required fields: id, title, url, userId" },
        { status: 400 }
      )
    }

    // Validate URL format
    try {
      new URL(url)
    } catch {
      return NextResponse.json(
        { error: "Invalid URL format" },
        { status: 400 }
      )
    }

    // Verify ownership before updating
    const { data: existingBookmark } = await supabase
      .from("bookmarks")
      .select("user_id")
      .eq("id", id)
      .single()

    if (!existingBookmark) {
      return NextResponse.json(
        { error: "Bookmark not found" },
        { status: 404 }
      )
    }

    if (existingBookmark.user_id !== userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      )
    }

    const { data, error } = await supabase
      .from("bookmarks")
      .update({
        title: title.trim(),
        url: url.trim(),
      })
      .eq("id", id)
      .eq("user_id", userId)
      .select()

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json(data[0], { status: 200 })
  } catch (err) {
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    )
  }
}

// DELETE - Delete bookmark
export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")
    const userId = searchParams.get("userId")

    if (!id || !userId) {
      return NextResponse.json(
        { error: "Missing required fields: id, userId" },
        { status: 400 }
      )
    }

    // Verify ownership before deleting
    const { data: existingBookmark } = await supabase
      .from("bookmarks")
      .select("user_id")
      .eq("id", id)
      .single()

    if (!existingBookmark) {
      return NextResponse.json(
        { error: "Bookmark not found" },
        { status: 404 }
      )
    }

    if (existingBookmark.user_id !== userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      )
    }

    const { error } = await supabase
      .from("bookmarks")
      .delete()
      .eq("id", id)
      .eq("user_id", userId)

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { message: "Bookmark deleted successfully" },
      { status: 200 }
    )
  } catch (err) {
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    )
  }
}
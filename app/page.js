"use client";

import Link from "next/link";
import Header from "@/components/header";
import InputBox from "@/components/inputbox";
import Bookmarks from "@/components/Bookmarks";

export default function Home() {
  return (
    <main
      style={{
        minHeight: "100vh",
        backgroundColor: "#f5f3ef",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "2rem 1rem",
        fontFamily: "'Geist', 'Inter', sans-serif",
      }}
    >
      
      <section
        style={{
          width: "100%",
          maxWidth: "760px",
          backgroundColor: "#ffffff",
          borderRadius: "16px",
          boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
          padding: "2rem",
          display: "flex",
          flexDirection: "column",
          gap: "2rem",
        }}
      >
        <Header />
        <InputBox />
        <Bookmarks />
      </section>
    </main>
  );
}
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import Navbar from "@/components/Navbar";
import ChatInterface from "@/components/ChatInterface";
import { Loader2 } from "lucide-react";

import { products } from "@/lib/data";
import ProductCard from "@/components/ProductCard";

export default function Home() {
  const router = useRouter();
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<any[]>([]);

  useEffect(() => {
    // 1. Check for session
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        router.push("/login");
        return;
      }

      setSession(session);

      // 2. Fetch initial messages
      const { data: initialMessages, error } = await supabase
        .from("messages")
        .select("*")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: true });

      if (!error && initialMessages) {
        setMessages(initialMessages);
      }

      setLoading(false);
    };

    checkSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        router.push("/login");
      } else {
        setSession(session);
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 gap-4">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
        <p className="text-gray-500 font-medium">Đang tải...</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col relative">
      <Navbar />
      <div className="container mx-auto py-10 px-4">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl mb-4">
            Apple Store
          </h1>
          <p className="text-xl text-gray-500">
            Khám phá những sản phẩm công nghệ đỉnh cao từ Apple.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>

      {/* Floating AI Support Widget */}
      <ChatInterface userId={session.user.id} initialMessages={messages} />
    </main>
  );
}

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ShoppingCart, History } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { supabase } from "@/lib/supabaseClient";

export default function Navbar() {
    const { totalItems } = useCart();
    const router = useRouter();

    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const fetchUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setUser(session?.user || null);
        };
        fetchUser();

        const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user || null);
        });

        return () => {
            authListener.subscription.unsubscribe();
        };
    }, []);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push("/login");
    };

    return (
        <nav className="flex items-center justify-between p-4 bg-white shadow-md sticky top-0 z-50">
            <Link href="/" className="text-xl md:text-2xl font-bold text-blue-600 no-underline truncate">
                Apple Store
            </Link>

            <div className="flex items-center gap-4">
                <Link href="/cart" className="relative mr-2">
                    <Button variant="ghost" size="icon" className="rounded-full">
                        <ShoppingCart className="w-6 h-6" />
                        {totalItems > 0 && (
                            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
                                {totalItems}
                            </span>
                        )}
                    </Button>
                </Link>

                {user ? (
                    <>
                        <Link href="/orderhistory" className="hidden sm:block">
                            <Button variant="ghost" className="!rounded-full flex gap-2">
                                <History className="w-4 h-4" />
                                Lịch sử
                            </Button>
                        </Link>

                        <Button
                            variant="outline"
                            className="!rounded-full hidden sm:block border-red-500 text-red-500 hover:bg-red-50"
                            onClick={handleLogout}
                        >
                            Đăng xuất
                        </Button>
                    </>
                ) : (
                    <>
                        <Link href="/login">
                            <Button variant="outline" className="!rounded-full hidden sm:block">
                                Login
                            </Button>
                        </Link>
                        <Link href="/register">
                            <Button className="!rounded-full hidden sm:block">
                                Register
                            </Button>
                        </Link>
                    </>
                )}
            </div>
        </nav>
    );
}
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import OrderCard from "@/components/OrderCard";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import { PackageOpen } from "lucide-react";

export default function OrderHistoryPage() {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const fetchOrders = async () => {
            const { data: { session } } = await supabase.auth.getSession();

            if (!session) {
                alert("Vui lòng đăng nhập để xem lịch sử đơn hàng!");
                router.push("/login");
                return;
            }

            try {
                const { data, error } = await supabase
                    .from("orders")
                    .select("*")
                    .eq("userid", session.user.id)
                    .order("ordertime", { ascending: false });

                if (error) throw error;
                setOrders(data || []);
            } catch (error) {
                console.error("Lỗi khi tải đơn hàng:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, [router]);

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <div className="container mx-auto py-10 px-4 max-w-4xl">
                <h1 className="text-3xl font-bold mb-8 text-center sm:text-left text-gray-800">
                    Lịch sử đơn hàng của bạn
                </h1>

                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        <span className="ml-3 text-gray-500">Đang tải dữ liệu...</span>
                    </div>
                ) : orders.length === 0 ? (
                    <div className="text-center bg-white p-12 rounded-xl shadow-sm border border-dashed border-gray-300">
                        <PackageOpen className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                        <h2 className="text-xl font-semibold text-gray-700 mb-2">Bạn chưa có đơn hàng nào</h2>
                        <p className="text-gray-500 mb-6">Hãy khám phá các sản phẩm Apple mới nhất và quay lại đây nhé!</p>
                        <Link href="/">
                            <Button className="!rounded-full px-8">Tiếp tục mua sắm</Button>
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {orders.map((order) => (
                            <OrderCard key={order.orderid} order={order} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
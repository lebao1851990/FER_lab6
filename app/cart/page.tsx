"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import { useCart, parsePrice } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function CartPage() {
    const { cart, removeFromCart, updateQuantity, totalPrice, clearCart } = useCart();
    const router = useRouter();

    const [loading, setLoading] = useState(false);
    const [address, setAddress] = useState("");

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
        }).format(amount);
    };

    const handleCheckout = async () => {
        if (cart.length === 0) return;

        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            alert("Bạn cần đăng nhập để thanh toán!");
            router.push("/login");
            return;
        }

        if (!address.trim()) {
            alert("Vui lòng nhập địa chỉ giao hàng!");
            return;
        }

        setLoading(true);

        try {
            const currentUserId = session.user.id;

            const { data: orderData, error: orderError } = await supabase
                .from('orders')
                .insert([{
                    userid: currentUserId,
                    totalamount: totalPrice,
                    deliveryaddress: address
                }])
                .select()
                .single();

            if (orderError) throw orderError;

            const createdOrderId = orderData.orderid || orderData.id;

            const orderItemsData = cart.map((item) => ({
                orderid: createdOrderId,
                productid: item.id.toString(),
                productname: item.name,
                quantity: item.quantity,
                unitprice: parsePrice(item.price)
            }));

            const { error: itemsError } = await supabase
                .from('orderitems')
                .insert(orderItemsData);

            if (itemsError) throw itemsError;

            clearCart();
            alert("Đặt hàng thành công!");
            router.push("/orderhistory");

        } catch (error: any) {
            console.error("Lỗi khi thanh toán:", error);
            alert("Có lỗi xảy ra khi đặt hàng: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="container mx-auto py-10 px-4">
                <h1 className="text-3xl font-bold mb-8 text-center">Giỏ Hàng Của Bạn</h1>

                {cart.length === 0 ? (
                    <div className="text-center">
                        <p className="text-lg text-gray-500 mb-4">Giỏ hàng đang trống</p>
                        <Link href="/">
                            <Button>Tiếp tục mua sắm</Button>
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-sm">
                            <div className="space-y-6">
                                {cart.map((item) => (
                                    <div key={item.id} className="flex flex-col sm:flex-row items-center gap-4 border-b pb-4 last:border-0">
                                        <img src={item.image} alt={item.name} className="w-24 h-24 object-cover rounded-md" />
                                        <div className="flex-1 text-center sm:text-left">
                                            <h3 className="font-semibold text-lg">{item.name}</h3>
                                            <p className="text-gray-600">{item.price}</p>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => updateQuantity(item.id, item.quantity - 1)}>-</Button>
                                            <Input type="number" min={1} value={item.quantity} onChange={(e) => updateQuantity(item.id, Number(e.target.value))} className="w-16 h-8 text-center" />
                                            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</Button>
                                        </div>

                                        <div className="text-right min-w-[120px]">
                                            <p className="font-bold text-blue-600">
                                                {formatCurrency(parsePrice(item.price) * item.quantity)}
                                            </p>
                                        </div>

                                        <Button variant="destructive" size="icon" onClick={() => removeFromCart(item.id)}>
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                            <Button variant="outline" className="mt-6 w-full sm:w-auto" onClick={clearCart}>
                                Xóa tất cả
                            </Button>
                        </div>

                        <div className="lg:col-span-1">
                            <div className="bg-white p-6 rounded-lg shadow-sm sticky top-24">
                                <h2 className="text-xl font-bold mb-4">Tổng đơn hàng</h2>

                                <div className="mb-4 text-left">
                                    <Label htmlFor="address" className="mb-2 block">Địa chỉ giao hàng:</Label>
                                    <Input
                                        id="address"
                                        placeholder="Nhập địa chỉ của bạn..."
                                        value={address}
                                        onChange={(e) => setAddress(e.target.value)}
                                        className="w-full"
                                    />
                                </div>

                                <div className="flex justify-between mb-2 mt-4 border-t pt-4">
                                    <span>Tạm tính:</span>
                                    <span>{formatCurrency(totalPrice)}</span>
                                </div>
                                <div className="flex justify-between mb-4 border-b pb-4">
                                    <span>Giảm giá:</span>
                                    <span>0 ₫</span>
                                </div>
                                <div className="flex justify-between text-xl font-bold mb-6 text-red-600">
                                    <span>Tổng cộng:</span>
                                    <span>{formatCurrency(totalPrice)}</span>
                                </div>

                                <Button
                                    className="w-full py-6 text-lg"
                                    onClick={handleCheckout}
                                    disabled={loading}
                                >
                                    {loading ? "Đang xử lý..." : "Thanh Toán Ngay"}
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
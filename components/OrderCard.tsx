import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface OrderProps {
    order: {
        orderid: string;
        ordertime: string;
        totalamount: number;
        orderstatus: number | string;
        deliveryaddress: string;
    };
}

export default function OrderCard({ order }: OrderProps) {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const getStatusDisplay = (status: number | string) => {
        if (status === 1 || status === "Pending") return { text: "Chờ xử lý", color: "bg-yellow-500" };
        if (status === 2 || status === "Paid") return { text: "Đã thanh toán", color: "bg-green-500" };
        if (status === 0 || status === "Cancelled") return { text: "Đã hủy", color: "bg-red-500" };
        return { text: "Không xác định", color: "bg-gray-500" };
    };

    const statusInfo = getStatusDisplay(order.orderstatus);

    return (
        <Card className="mb-4 hover:shadow-md transition-shadow">
            <CardHeader className="pb-2 flex flex-row items-center justify-between bg-gray-50/50 rounded-t-xl border-b">
                <div>
                    <CardTitle className="text-sm font-medium text-gray-500">
                        Mã đơn: <span className="text-black font-bold uppercase">{order.orderid.split('-')[0]}</span>
                    </CardTitle>
                    <p className="text-xs text-gray-400 mt-1">{formatDate(order.ordertime)}</p>
                </div>
                <div className={`px-3 py-1 text-xs font-bold text-white rounded-full ${statusInfo.color}`}>
                    {statusInfo.text}
                </div>
            </CardHeader>
            <CardContent className="pt-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="text-sm">
                    <p className="text-gray-600 font-medium mb-1">Giao đến:</p>
                    <p className="text-gray-900 line-clamp-2">{order.deliveryaddress}</p>
                </div>
                <div className="text-right w-full sm:w-auto mt-2 sm:mt-0 pt-2 sm:pt-0 border-t sm:border-t-0">
                    <p className="text-gray-500 text-sm mb-1">Tổng tiền:</p>
                    <p className="text-lg font-bold text-red-600">{formatCurrency(order.totalamount)}</p>
                </div>
            </CardContent>
        </Card>
    );
}
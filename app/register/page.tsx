"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function RegisterPage() {
    const [formData, setFormData] = useState({
        fullName: "",
        birthDate: "",
        phoneNumber: "",
        email: "",
        addressDelivery: "",
        password: "",
        confirmPassword: ""
    });

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();

        if (
            !formData.fullName || !formData.birthDate || !formData.phoneNumber ||
            !formData.email || !formData.addressDelivery ||
            !formData.password || !formData.confirmPassword
        ) {
            setError("Vui lòng điền đầy đủ thông tin!");
            return;
        }

        if (formData.phoneNumber.length > 10) {
            setError("Số điện thoại không được quá 10 số!");
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setError("Mật khẩu xác nhận không khớp!");
            return;
        }

        setError("");
        setLoading(true);

        const { data, error: supabaseError } = await supabase.auth.signUp({
            email: formData.email,
            password: formData.password,
            options: {
                data: {
                    full_name: formData.fullName,
                    birth_date: formData.birthDate,
                    phone_number: formData.phoneNumber,
                    address_delivery: formData.addressDelivery
                }
            }
        });

        if (supabaseError) {
            setError(supabaseError.message);
            setLoading(false);
            return;
        }

        alert("Đăng ký thành công! Vui lòng đăng nhập.");
        router.push("/login");
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 py-10">
            <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
                <h2 className="text-2xl font-bold text-center mb-6">Đăng Ký Tài Khoản</h2>
                {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}

                <form onSubmit={handleRegister} className="space-y-4">
                    <div>
                        <Label htmlFor="fullName">Họ và tên</Label>
                        <Input id="fullName" placeholder="Nguyễn Văn A" value={formData.fullName} onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} />
                    </div>
                    <div>
                        <Label htmlFor="birthDate">Ngày sinh</Label>
                        <Input id="birthDate" type="date" value={formData.birthDate} onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })} />
                    </div>
                    <div>
                        <Label htmlFor="phoneNumber">Số điện thoại</Label>
                        <Input id="phoneNumber" type="tel" placeholder="0912345678" maxLength={10} value={formData.phoneNumber} onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })} />
                    </div>
                    <div>
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" placeholder="example@gmail.com" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                    </div>
                    <div>
                        <Label htmlFor="addressDelivery">Địa chỉ giao hàng</Label>
                        <Input id="addressDelivery" placeholder="Số 1, Đường ABC, Quận XYZ..." value={formData.addressDelivery} onChange={(e) => setFormData({ ...formData, addressDelivery: e.target.value })} />
                    </div>
                    <div>
                        <Label htmlFor="password">Mật khẩu</Label>
                        <Input id="password" type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} />
                    </div>
                    <div>
                        <Label htmlFor="confirmPassword">Xác nhận mật khẩu</Label>
                        <Input id="confirmPassword" type="password" placeholder="Nhập lại mật khẩu" value={formData.confirmPassword} onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })} />
                    </div>

                    <Button type="submit" className="w-full !rounded-full mt-6" disabled={loading}>
                        {loading ? "Đang xử lý..." : "Đăng Ký"}
                    </Button>
                </form>

                <p className="mt-4 text-center text-sm">
                    Đã có tài khoản? <Link href="/login" className="text-blue-600 hover:underline">Đăng nhập</Link>
                </p>
            </div>
        </div>
    );
}
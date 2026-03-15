"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCart } from "@/context/CartContext";
import { ShoppingCart, CreditCard } from "lucide-react";

interface ProductProps {
  product: {
    id: number;
    name: string;
    image: string;
    description: string;
    price: string;
  };
}

export default function ProductCard({ product }: ProductProps) {
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const router = useRouter();

  const handleAddToCart = () => {
    addToCart(product, quantity);
    alert(`Đã thêm ${quantity} ${product.name} vào giỏ!`);
  };

  const handleBuyNow = () => {
    addToCart(product, quantity);
    router.push("/cart");
  };

  return (
    <Card className="w-full max-w-sm hover:shadow-lg transition-shadow flex flex-col justify-between h-full">
      <CardHeader className="p-0">
        <div className="overflow-hidden rounded-t-md">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-48 object-cover hover:scale-105 transition-transform duration-300"
          />
        </div>
      </CardHeader>

      <CardContent className="p-4 flex-1">
        <CardTitle className="mb-2 text-lg font-bold min-h-[56px] line-clamp-2">
          {product.name}
        </CardTitle>
        <p className="text-gray-500 text-sm mb-4 line-clamp-3">
          {product.description}
        </p>

        <div className="flex items-center justify-between mt-auto">
          <p className="text-lg font-bold text-red-600">{product.price}</p>

          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">SL:</span>
            <Input
              type="number"
              min={1}
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="w-16 h-8 text-center px-1"
            />
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0 flex flex-col gap-3">
        <Button
          className="w-full !rounded-full bg-red-600 hover:bg-red-700 text-white font-bold"
          onClick={handleBuyNow}
        >
          <CreditCard className="w-4 h-4 mr-2" />
          Mua ngay
        </Button>

        <Button
          variant="outline"
          className="w-full !rounded-full border-blue-600 text-blue-600 hover:bg-blue-50"
          onClick={handleAddToCart}
        >
          <ShoppingCart className="w-4 h-4 mr-2" />
          Thêm vào giỏ
        </Button>
      </CardFooter>
    </Card>
  );
}
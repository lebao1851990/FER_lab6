import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import { products } from "@/lib/data";

export async function POST(req: Request) {
    try {
        const { userId, content } = await req.json();

        if (!userId || !content) {
            return NextResponse.json({ error: "Missing userId or content" }, { status: 400 });
        }

        const { error: userMsgError } = await supabase
            .from("messages")
            .insert([
                {
                    user_id: userId,
                    content: content,
                    sender_type: "user",
                },
            ]);

        if (userMsgError) {
            return NextResponse.json({ error: userMsgError.message }, { status: 500 });
        }

        const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.GEMINI_API_KEY || "";
        const genAI = new GoogleGenerativeAI(apiKey);

        // Tối ưu hóa: Chỉ gửi Tên và Giá sản phẩm để tiết kiệm token và tránh lỗi quota
        const productContext = products.map(p => `- ${p.name}: ${p.price}`).join("\n");

        const systemInstruction = `Bạn là trợ lý bán hàng chuyên nghiệp cho cửa hàng công nghệ Apple Store. 
            Hãy giúp khách hàng tìm hiểu về các loại sản phẩm, giải đáp thắc mắc về tính năng và tư vấn lựa chọn phù hợp.
            
            Dưới đây là danh sách sản phẩm hiện có tại cửa hàng của Bảo:
            ${productContext}
            
            Khi khách hàng hỏi về sản phẩm cụ thể, hãy trả lời dựa trên thông tin trên và kiến thức chuyên môn của bạn. 
            Nếu khách hàng hỏi về sản phẩm không có trong danh sách, hãy trả lời rằng hiện tại cửa hàng chưa có mẫu đó nhưng có thể tư vấn mẫu tương tự.`;

        // Sử dụng mô hình Gemini 2.5 Flash theo yêu cầu
        const modelsToTry = ["gemini-2.5-flash"];
        let aiText = "";
        let currentModelUsed = "";

        for (const modelName of modelsToTry) {
            try {
                const model = genAI.getGenerativeModel({
                    model: modelName,
                    systemInstruction: systemInstruction
                });

                const result = await model.generateContent(content);
                const response = await result.response;
                aiText = response.text();

                if (aiText) {
                    currentModelUsed = modelName;
                    break;
                }
            } catch (err: any) {
                console.warn(`Model ${modelName} failed:`, err.message);
                // Nếu là model cuối cùng mà vẫn lỗi thì ném lỗi ra ngoài
                if (modelName === modelsToTry[modelsToTry.length - 1]) {
                    throw err;
                }
            }
        }

        if (!aiText) {
            return NextResponse.json({ error: "AI failed to respond after trying all models" }, { status: 500 });
        }

        const { error: aiMsgError } = await supabase
            .from("messages")
            .insert([
                {
                    user_id: userId,
                    content: aiText,
                    sender_type: "ai",
                },
            ]);

        if (aiMsgError) {
            console.error(aiMsgError);
        }

        return NextResponse.json({ success: true, aiText });

    } catch (error: any) {
        return NextResponse.json({
            error: error.message || "Internal Server Error"
        }, { status: 500 });
    }
}

"use client";

import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";
import { sendMessageToAI } from "@/lib/gemini";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, User, Bot, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
    id: string | number;
    user_id: string;
    content: string;
    sender_type: "user" | "ai";
    created_at: string;
}

interface ChatInterfaceProps {
    userId: string;
    initialMessages?: Message[];
}

export default function ChatInterface({ userId, initialMessages = [] }: ChatInterfaceProps) {
    const [messages, setMessages] = useState<Message[]>(initialMessages);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    // 1. Subscribe to Realtime Supabase
    useEffect(() => {
        const channel = supabase
            .channel("messages")
            .on(
                "postgres_changes",
                {
                    event: "INSERT",
                    schema: "public",
                    table: "messages",
                    filter: `user_id=eq.${userId}`,
                },
                (payload) => {
                    const newMessage = payload.new as Message;
                    // Avoid duplicate messages if already in state
                    setMessages((prev) => {
                        if (prev.find((m) => m.id === newMessage.id)) return prev;
                        return [...prev, newMessage];
                    });
                    // Auto-open chat when new message arrives (optional but helpful for AI responses)
                    if (newMessage.sender_type === "ai") {
                        setIsOpen(true);
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [userId]);

    // 2. Auto-scroll to bottom
    useEffect(() => {
        if (scrollRef.current && isOpen) {
            const scrollElement = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
            if (scrollElement) {
                setTimeout(() => {
                    scrollElement.scrollTop = scrollElement.scrollHeight;
                }, 100);
            }
        }
    }, [messages, isOpen]);

    // 3. Handle sending message
    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userContent = input.trim();
        setInput("");
        setIsLoading(true);

        const result = await sendMessageToAI(userId, userContent);
        if (!result.success) {
            console.error("Failed to send message:", result.error);
        }

        setIsLoading(false);
    };

    return (
        <>
            {/* Floating Toggle Button */}
            <Button
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-2xl transition-all duration-300 z-50 p-0 flex items-center justify-center",
                    isOpen ? "bg-red-500 hover:bg-red-600 rotate-90" : "bg-blue-600 hover:bg-blue-700"
                )}
            >
                {isOpen ? <Send className="w-6 h-6 rotate-45" /> : <Bot className="w-8 h-8" />}
            </Button>

            {/* Chat Window */}
            <div
                className={cn(
                    "fixed bottom-24 right-6 w-[90vw] sm:w-[400px] h-[500px] flex flex-col bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden transition-all duration-300 transform z-50 origin-bottom-right",
                    isOpen ? "scale-100 opacity-100 translate-y-0" : "scale-0 opacity-0 translate-y-10 pointer-events-none"
                )}
            >
                {/* Header */}
                <div className="p-4 bg-gradient-to-r from-blue-600 to-indigo-700 text-white flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/20 rounded-full">
                            <Bot className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="font-bold text-sm">Apple Assistant</h2>
                            <p className="text-[10px] text-blue-100 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
                                Sẵn sàng giúp đỡ
                            </p>
                        </div>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsOpen(false)}
                        className="text-white hover:bg-white/20 p-0 h-8 w-8"
                    >
                        <Send className="w-4 h-4 rotate-45" />
                    </Button>
                </div>

                {/* Message List */}
                <ScrollArea className="flex-1 min-h-0 p-4" ref={scrollRef}>

                    <div className="flex flex-col gap-4">
                        {messages.length === 0 && !isLoading && (
                            <div className="text-center py-10 opacity-50 flex flex-col items-center gap-2">
                                <Bot className="w-10 h-10 stroke-thin" />
                                <p className="text-sm">Chào bạn, tôi là trợ lý AI. Tôi có thể giúp gì cho bạn?</p>
                            </div>
                        )}

                        {messages.map((msg) => (
                            <div
                                key={msg.id}
                                className={cn(
                                    "flex w-full",
                                    msg.sender_type === "user" ? "justify-end" : "justify-start"
                                )}
                            >
                                <div
                                    className={cn(
                                        "flex gap-2 max-w-[85%]",
                                        msg.sender_type === "user" ? "flex-row-reverse" : "flex-row"
                                    )}
                                >
                                    <div className={cn(
                                        "w-7 h-7 rounded-full flex items-center justify-center shrink-0 shadow-sm",
                                        msg.sender_type === "user" ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-600"
                                    )}>
                                        {msg.sender_type === "user" ? <User size={14} /> : <Bot size={14} />}
                                    </div>
                                    <div
                                        className={cn(
                                            "px-3 py-2 rounded-2xl shadow-sm text-xs break-words",
                                            msg.sender_type === "user"
                                                ? "bg-blue-600 text-white rounded-tr-none"
                                                : "bg-gray-50 text-gray-800 rounded-tl-none border border-gray-100"
                                        )}
                                    >
                                        {msg.content}
                                    </div>
                                </div>
                            </div>
                        ))}

                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="flex gap-2 items-center text-gray-400 italic text-xs">
                                    <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center">
                                        <Bot size={14} className="text-gray-600" />
                                    </div>
                                    <div className="bg-gray-50 px-3 py-2 rounded-2xl rounded-tl-none border border-gray-50 flex items-center gap-2">
                                        <Loader2 className="w-3 h-3 animate-spin" />
                                        <span>Đang trả lời...</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </ScrollArea>

                {/* Input Form */}
                <form onSubmit={handleSend} className="p-3 bg-gray-50 border-t border-gray-100 flex gap-2 items-center">
                    <Input
                        placeholder="Hỏi về sản phẩm..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        disabled={isLoading}
                        className="flex-1 bg-white border-gray-200 focus:ring-blue-500 rounded-xl h-9 text-xs"
                    />
                    <Button
                        type="submit"
                        disabled={isLoading || !input.trim()}
                        size="icon"
                        className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-9 w-9 shrink-0 shadow-sm p-0 flex items-center justify-center"
                    >
                        <Send className="w-4 h-4" />
                    </Button>
                </form>
            </div>
        </>
    );
}


import { supabase } from "./supabaseClient";

/**
 * Sends a user message to Gemini and saves both user and AI messages to Supabase.
 * @param userId - The UUID of the user.
 * @param content - The message content.
 */
export async function sendMessageToAI(userId: string, content: string) {
    try {
        const response = await fetch("/api/chat", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ userId, content }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Failed to get AI response");
        }

        return { success: true, aiText: data.aiText };
    } catch (error: any) {
        console.error("Error in AI Chat logic:", error);
        return { success: false, error: error.message };
    }
}

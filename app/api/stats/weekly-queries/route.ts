// API endpoint to get the count of user queries from the past week
import { NextResponse } from "next/server";
import DBconnect from "@/lib/mongodb";
import ChatModel from "@/models/chat";

export async function GET() {
  try {
    await DBconnect();

    // Calculate the start of the current week (Monday)
    const now = new Date();
    const day = now.getDay(); // 0 (Sun) to 6 (Sat)
    // Calculate difference to get to Monday
    // If Sunday (0), subtract 6 days. If Monday (1), subtract 0 days. etc.
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    
    const startOfWeek = new Date(now);
    startOfWeek.setDate(diff);
    startOfWeek.setHours(0, 0, 0, 0);

    // Get all chats with messages from the current week
    const chats = await ChatModel.find({
      "messages.timestamp": { $gte: startOfWeek },
    }).select("messages");

    // Count user messages from the current week
    let queryCount = 0;
    chats.forEach((chat) => {
      chat.messages.forEach((message) => {
        // Count only user messages (not system or assistant) from the current week
        if (
          message.role === "user" &&
          message.timestamp &&
          new Date(message.timestamp) >= startOfWeek
        ) {
          queryCount++;
        }
      });
    });

    return NextResponse.json({ count: queryCount });
  } catch (error) {
    console.error("Error fetching weekly query count:", error);
    return NextResponse.json(
      { error: "Failed to fetch query statistics" },
      { status: 500 }
    );
  }
}

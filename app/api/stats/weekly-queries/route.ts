// API endpoint to get the count of user queries from the past week
import { NextResponse } from "next/server";
import DBconnect from "@/lib/mongodb";
import ChatModel from "@/models/chat";

export async function GET() {
  try {
    await DBconnect();

    // Calculate the date 7 days ago
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Get all chats with messages from the past 7 days
    const chats = await ChatModel.find({
      "messages.timestamp": { $gte: sevenDaysAgo },
    }).select("messages");

    // Count user messages from the past week
    let queryCount = 0;
    chats.forEach((chat) => {
      chat.messages.forEach((message) => {
        // Count only user messages (not system or assistant) from the past week
        if (
          message.role === "user" &&
          message.timestamp &&
          new Date(message.timestamp) >= sevenDaysAgo
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

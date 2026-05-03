import { Pinecone } from "@pinecone-database/pinecone";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    if (!process.env.PINECONE_API_KEY || !process.env.PINECONE_ASSISTANT_NAME) {
      throw new Error("Missing Pinecone Assistant credentials");
    }

    const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
    const assistant = pc.assistant(process.env.PINECONE_ASSISTANT_NAME);

    const chatResult = await assistant.chat({
      messages: [{ role: "user", content: message }],
    });

    return NextResponse.json({ role: "assistant", content: chatResult.message.content });
    
  } catch (error) {
    console.error("Chat API Error:", error);
    return NextResponse.json({ error: "Failed to process chat" }, { status: 500 });
  }
}
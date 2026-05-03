import { Pinecone } from "@pinecone-database/pinecone";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!process.env.PINECONE_API_KEY || !process.env.PINECONE_ASSISTANT_NAME) {
      throw new Error("Missing Pinecone credentials");
    }

    const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
    const assistant = pc.assistant(process.env.PINECONE_ASSISTANT_NAME);

    // This sends the actual file to your Pinecone Assistant
    const uploadResult = await assistant.uploadFile({ file });

    return NextResponse.json({ 
      success: true, 
      message: "File successfully indexed by Pinecone",
      fileId: uploadResult.id 
    });
    
  } catch (error: any) {
    console.error("Upload API Error:", error);
    return NextResponse.json({ error: error.message || "Failed to upload file" }, { status: 500 });
  }
}
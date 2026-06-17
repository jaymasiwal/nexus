import { Pinecone } from "@pinecone-database/pinecone";
import { NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import path from "path";
import os from "os";

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

    // 1. Convert the incoming web File into a raw Node Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 2. Safely write it to the OS temporary directory
    const tempFilePath = path.join(os.tmpdir(), file.name);
    await writeFile(tempFilePath, buffer);

    // 3. Initialize Pinecone Client
    const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
    const assistant = pc.assistant(process.env.PINECONE_ASSISTANT_NAME);

    // 4. Inject the physical file path straight into the Assistant
    const uploadResult = await assistant.uploadFile({ path: tempFilePath });

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
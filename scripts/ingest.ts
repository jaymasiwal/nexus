import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Pinecone } from "@pinecone-database/pinecone";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const ingestPDF = async () => {
    try {
        console.log("1. Loading PDF...");
        const loader = new PDFLoader("public/pdfs/sample.pdf");
        const docs = await loader.load();

        console.log("2. Chunking text...");
        const textSplitter = new RecursiveCharacterTextSplitter({
            chunkSize: 500,
            chunkOverlap: 50,
        });
        const splitDocs = await textSplitter.splitDocuments(docs);
        console.log(`Created ${splitDocs.length} chunks.`);

        console.log("3. Generating Embeddings...");
        const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);
        
        // This is the absolute production-safe model string
        const model = genAI.getGenerativeModel({ model: "text-embedding-004" });

        const vectors = await Promise.all(
            splitDocs.map(async (doc, i) => {
                // Use embedContent directly
                const result = await model.embedContent(doc.pageContent);
                const embedding = result.embedding;
                
                return {
                    id: `vec-${Date.now()}-${i}`,
                    values: embedding.values,
                    metadata: {
                        text: doc.pageContent,
                        ...doc.metadata,
                    },
                };
            })
        );

        console.log("4. Upserting to Pinecone...");
        const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY! });
        const index = pc.index(process.env.PINECONE_INDEX_NAME!);
        
        // We use 'any' here to stop the TypeScript red underline from blocking your flow
        await index.upsert(vectors as any);

        console.log("✅ SUCCESS! Your PDF is live in Pinecone.");
    } catch (error) {
        console.error("❌ Ingestion failed:", error);
    }
};

ingestPDF();


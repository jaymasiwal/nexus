"use client";

import { useState, useRef } from "react";

export default function Home() {
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  // New states for file upload
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDocumentLoaded, setIsDocumentLoaded] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle the file selection and real API upload
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setIsUploading(true);

      const formData = new FormData();
      formData.append("file", selectedFile);

      try {
        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        const data = await res.json();

        if (!res.ok) throw new Error(data.error || "Upload failed");

        setIsUploading(false);
        setIsDocumentLoaded(true);
      } catch (error) {
        console.error("Upload error:", error);
        alert("Failed to upload document to Nexus.");
        setIsUploading(false);
        setFile(null);
      }
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input;
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage }),
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      setMessages((prev) => [...prev, { role: data.role, content: data.content }]);
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) => [...prev, { role: "assistant", content: "❌ Error connecting to Nexus API." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex flex-col h-screen bg-neutral-950 text-neutral-50 p-4 md:p-8">
      <div className="max-w-3xl w-full mx-auto flex flex-col h-full border border-neutral-800 rounded-xl overflow-hidden shadow-2xl bg-neutral-900">
        
        {/* Header */}
        <div className="p-4 border-b border-neutral-800 bg-neutral-950/50 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white">Nexus <span className="text-blue-500">Intelligence</span></h1>
            <p className="text-sm text-neutral-400">
              {isDocumentLoaded ? `Chatting with: ${file?.name}` : "Upload a document to begin"}
            </p>
          </div>
        </div>

        {/* Dynamic Center Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          
          {/* UPLOAD STATE */}
          {!isDocumentLoaded ? (
            <div className="h-full flex flex-col items-center justify-center text-neutral-400 space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-semibold text-white mb-2">Upload your PDF</h2>
                <p className="text-sm max-w-sm">Nexus will process your document and create a custom knowledge base.</p>
              </div>
              
              <input 
                type="file" 
                accept=".pdf" 
                className="hidden" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
              />
              
              <button 
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white px-6 py-3 rounded-xl font-medium transition-colors shadow-lg flex items-center gap-2"
              >
                {isUploading ? "Processing Document..." : "Select PDF File"}
              </button>
            </div>
          ) : (
            
            /* CHAT STATE */
            <>
              {messages.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-neutral-500">
                  <p>Document loaded successfully.</p>
                  <p>Ask a question to begin.</p>
                </div>
              )}
              {messages.map((msg, index) => (
                <div key={index} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[80%] rounded-lg p-3 ${
                    msg.role === "user" ? "bg-blue-600 text-white" : "bg-neutral-800 text-neutral-200"
                  }`}>
                    <p className="whitespace-pre-wrap text-sm leading-relaxed">{msg.content}</p>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-neutral-800 text-neutral-400 rounded-lg p-3 text-sm animate-pulse">
                    Nexus is thinking...
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Input Area (Disabled if no document is loaded) */}
        <div className="p-4 border-t border-neutral-800 bg-neutral-950/50">
          <form onSubmit={sendMessage} className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={isDocumentLoaded ? "Ask a question..." : "Upload a document first..."}
              disabled={!isDocumentLoaded}
              className="flex-1 bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-neutral-400 disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim() || !isDocumentLoaded}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Send
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
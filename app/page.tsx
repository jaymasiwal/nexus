"use client";

import { useState } from "react";
import { UploadCloud, FileText, Send, Loader2, Bot, User, Mail } from "lucide-react";

export default function Home() {
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState<{ role: "user" | "ai", text: string }[]>([]);
  const [isChatting, setIsChatting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const processFiles = async (files: File[]) => {
    const pdfFiles = files.filter(file => file.type === "application/pdf" || file.name.endsWith('.pdf'));
    
    if (pdfFiles.length === 0) return;
    setIsUploading(true);

    for (const file of pdfFiles) {
      const formData = new FormData();
      formData.append("file", file);

      try {
        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) throw new Error("Upload failed");
        
        setUploadedFiles((prev) => {
          if (prev.includes(file.name)) return prev;
          return [...prev, file.name];
        });
      } catch (error) {
        console.error(`Failed to upload ${file.name}:`, error);
      }
    }

    setIsUploading(false);
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(Array.from(e.target.files));
    }
    e.target.value = '';
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || uploadedFiles.length === 0) return;

    const userMessage = message;
    setMessage("");
    setChatHistory((prev) => [...prev, { role: "user", text: userMessage }]);
    setIsChatting(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage }),
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      const aiResponse = data.content || data.text || data.answer || "No response generated.";
      setChatHistory((prev) => [...prev, { role: "ai", text: aiResponse }]);
    } catch (error: any) {
      console.error("Chat Error:", error);
      setChatHistory((prev) => [...prev, { role: "ai", text: `❌ Error: ${error.message || "Failed to connect to Nexus API."}` }]);
    } finally {
      setIsChatting(false);
    }
  };

  return (
    <div className="flex h-screen w-full bg-[#09090b] text-zinc-100 font-sans">
      {/* SIDEBAR: Document Management */}
      <div className="w-72 bg-[#121214] border-r border-zinc-800 flex flex-col">
        <div className="p-6 border-b border-zinc-800">
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Bot className="w-6 h-6 text-blue-500" />
            Nexus <span className="text-blue-500">AI</span>
          </h1>
          <p className="text-xs text-zinc-500 mt-1">Multi-Document Intelligence</p>
        </div>

        <div className="p-4 flex-1 overflow-y-auto">
          <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-4">
            Knowledge Base
          </div>
          
          <div className="space-y-2">
            {uploadedFiles.length === 0 ? (
              <div className="text-sm text-zinc-600 italic px-2">No documents uploaded yet.</div>
            ) : (
              uploadedFiles.map((file, idx) => (
                <div key={idx} className="flex items-center gap-3 bg-zinc-900/50 p-3 rounded-lg border border-zinc-800/50">
                  <FileText className="w-4 h-4 text-blue-400 shrink-0" />
                  <span className="text-sm truncate text-zinc-300">{file}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Drag & Drop Upload Area */}
        <div 
          className="p-4 border-t border-zinc-800"
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
        >
          <label className={`flex flex-col items-center justify-center gap-2 w-full bg-zinc-800 hover:bg-zinc-700 text-white py-6 px-4 rounded-xl cursor-pointer transition border-2 border-dashed ${isDragging ? 'border-blue-500 bg-blue-500/10' : 'border-zinc-700'}`}>
            {isUploading ? (
              <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
            ) : (
              <UploadCloud className={`w-6 h-6 ${isDragging ? 'text-blue-500' : 'text-zinc-400'}`} />
            )}
            <span className="text-sm font-medium text-center">
              {isUploading ? "Uploading..." : isDragging ? "Drop PDFs here" : "Click or drag PDFs here"}
            </span>
            <input 
              type="file" 
              accept=".pdf" 
              multiple 
              className="hidden" 
              onChange={handleFileChange} 
              disabled={isUploading}
            />
          </label>
        </div>

        {/* Developer Footer */}
        <div className="p-5 border-t border-zinc-800 bg-zinc-950/50">
          <div className="flex items-center justify-center gap-5 text-zinc-500 mb-3">
            <a href="https://github.com/jaymasiwal" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors" aria-label="GitHub">
              <GithubIcon className="w-4 h-4" />
            </a>
            <a href="https://www.linkedin.com/in/jay-masiwal-9b9430221/" target="_blank" rel="noopener noreferrer" className="hover:text-blue-500 transition-colors" aria-label="LinkedIn">
              <LinkedinIcon className="w-4 h-4" />
            </a>
            <a href="https://twitter.com/masiwal_jay" target="_blank" rel="noopener noreferrer" className="hover:text-sky-500 transition-colors" aria-label="Twitter">
              <TwitterIcon className="w-4 h-4" />
            </a>
            <a href="mailto:masiwaljay.02@gmail.com" className="hover:text-red-400 transition-colors" aria-label="Email">
              <Mail className="w-4 h-4" />
            </a>
          </div>
          <div className="text-center text-[10px] uppercase tracking-[0.2em] text-zinc-600 font-bold">
            Built by Jay Masiwal
          </div>
        </div>
      </div>

      {/* MAIN CHAT AREA */}
      <div className="flex-1 flex flex-col relative">
        {uploadedFiles.length === 0 ? (
          <div 
            className="flex-1 flex flex-col items-center justify-center text-center px-4 transition"
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
          >
            <div className={`w-20 h-20 rounded-3xl flex items-center justify-center mb-6 border transition-all ${isDragging ? 'bg-blue-500/20 border-blue-500 scale-110' : 'bg-blue-500/10 border-blue-500/20'}`}>
              <UploadCloud className={`w-10 h-10 ${isDragging ? 'text-blue-400' : 'text-blue-500'}`} />
            </div>
            <h2 className="text-3xl font-bold text-white mb-3">Build Your Knowledge Base</h2>
            <p className="text-zinc-400 max-w-md text-sm leading-relaxed">
              Drag and drop multiple PDF documents anywhere on this screen. Nexus will index them instantly, allowing you to synthesize and extract information across all your files simultaneously.
            </p>
          </div>
        ) : (
          <>
            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth">
              {chatHistory.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-zinc-500">
                  <Bot className="w-12 h-12 mb-4 opacity-20" />
                  <p>Documents loaded. What would you like to know?</p>
                </div>
              ) : (
                chatHistory.map((msg, idx) => (
                  <div key={idx} className={`flex gap-4 max-w-3xl mx-auto ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === "user" ? "bg-blue-600" : "bg-zinc-800 border border-zinc-700"}`}>
                      {msg.role === "user" ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-blue-400" />}
                    </div>
                    <div className={`p-4 rounded-2xl text-sm leading-relaxed ${msg.role === "user" ? "bg-blue-600 text-white rounded-tr-sm" : "bg-zinc-900 border border-zinc-800 text-zinc-200 rounded-tl-sm"}`}>
                      {msg.text}
                    </div>
                  </div>
                ))
              )}
              {isChatting && (
                <div className="flex gap-4 max-w-3xl mx-auto">
                   <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center shrink-0">
                      <Bot className="w-4 h-4 text-blue-400" />
                    </div>
                    <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 text-zinc-400 rounded-tl-sm flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" /> Thinking...
                    </div>
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="p-6 bg-gradient-to-t from-[#09090b] pt-10">
              <form onSubmit={handleSendMessage} className="max-w-3xl mx-auto relative flex items-end gap-2 bg-zinc-900 border border-zinc-800 rounded-2xl p-2 focus-within:border-zinc-700 focus-within:ring-1 focus-within:ring-zinc-700 transition-all shadow-lg">
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Ask a question across all documents..."
                  className="w-full bg-transparent text-white placeholder-zinc-500 text-sm p-3 outline-none resize-none max-h-32 min-h-[44px]"
                  rows={1}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage(e);
                    }
                  }}
                />
                <button 
                  type="submit" 
                  disabled={!message.trim() || isChatting}
                  className="bg-white text-black p-2.5 rounded-xl hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed transition shrink-0 m-1"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
              <div className="text-center mt-3 text-xs text-zinc-600">
                Nexus AI synthesizes information from your uploaded context.
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// Custom SVG Icons (Required since Lucide removed brands)
const GithubIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg>
);

const LinkedinIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>
);

const TwitterIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>
);
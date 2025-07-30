// src/components/ChatBot.tsx
import { useState } from "react";
import { Send, Bot, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { postToBackend } from "@/lib/api"; // ✅ Use backend API helper

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { role: "user", content: input };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await postToBackend("/api/analyze", {
        messages: [
          {
            role: "system",
            content:
              "You are an AI Mentor helping with learning and career guidance.",
          },
          ...newMessages,
        ],
      });

      const reply = res?.choices?.[0]?.message;
      if (reply) {
        setMessages((prev) => [...prev, reply]);
      } else {
        throw new Error("No reply received.");
      }
    } catch (err) {
      console.error("❌ Chatbot error:", err);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "⚠️ Sorry, AI Mentor is currently unavailable.",
        },
      ]);
    }

    setLoading(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen ? (
        <Card className="w-[320px] max-h-[500px] flex flex-col shadow-xl border rounded-xl overflow-hidden">
          <CardHeader className="flex justify-between items-center bg-slate-800 text-white p-4">
            <CardTitle className="text-white text-base flex items-center gap-2">
              <Bot className="h-5 w-5" /> AI Mentor
            </CardTitle>
            <Button size="sm" variant="ghost" onClick={() => setIsOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>

          <CardContent className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-900 text-white text-sm">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`p-2 rounded-md max-w-[85%] whitespace-pre-wrap ${
                  msg.role === "user"
                    ? "bg-blue-600 ml-auto text-white"
                    : "bg-gray-700 mr-auto text-white"
                }`}
              >
                {msg.content}
              </div>
            ))}

            {loading && (
              <div className="bg-gray-700 mr-auto text-white p-2 rounded-md flex items-center gap-2 animate-pulse max-w-[85%]">
                <div className="h-3 w-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Thinking...</span>
              </div>
            )}
          </CardContent>

          <div className="p-2 border-t bg-slate-800 flex gap-2">
            <input
              className="flex-1 p-2 text-sm rounded-md bg-slate-700 text-white placeholder:text-gray-300 outline-none"
              placeholder="Ask your AI Mentor..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              disabled={loading}
            />
            <Button size="sm" onClick={sendMessage} disabled={loading}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </Card>
      ) : (
        <Button
          onClick={() => setIsOpen(true)}
          className="rounded-full bg-slate-800 text-white hover:bg-slate-700 shadow-lg"
        >
          <Bot className="h-5 w-5 mr-2" /> Ask your AI Mentor
        </Button>
      )}
    </div>
  );
};

export default ChatBot;

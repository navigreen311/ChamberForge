"use client";

import { useState } from "react";

interface Message {
  id: string;
  sender_id: string;
  sender_name: string;
  recipient_id: string;
  recipient_name: string;
  content: string;
  is_encrypted: boolean;
  created_at: string;
  read_at: string | null;
}

interface Conversation {
  user_id: string;
  user_name: string;
  last_message: string;
  unread: number;
  timestamp: string;
}

const MOCK_CONVERSATIONS: Conversation[] = [
  { user_id: "u1", user_name: "Sarah Mitchell", last_message: "The NDA documents are ready for review", unread: 2, timestamp: "2026-04-03T14:20:00Z" },
  { user_id: "u2", user_name: "James Harrington", last_message: "Portfolio rebalance complete — see attached report", unread: 0, timestamp: "2026-04-03T11:45:00Z" },
  { user_id: "u3", user_name: "Elena Vasquez", last_message: "Client onboarding scheduled for Thursday", unread: 1, timestamp: "2026-04-02T16:30:00Z" },
];

const MOCK_MESSAGES: Message[] = [
  { id: "m1", sender_id: "me", sender_name: "You", recipient_id: "u1", recipient_name: "Sarah Mitchell", content: "Can you prepare the NDA for the Thornton account?", is_encrypted: true, created_at: "2026-04-03T13:00:00Z", read_at: "2026-04-03T13:05:00Z" },
  { id: "m2", sender_id: "u1", sender_name: "Sarah Mitchell", recipient_id: "me", recipient_name: "You", content: "Working on it now. Should have it ready within the hour.", is_encrypted: true, created_at: "2026-04-03T13:10:00Z", read_at: "2026-04-03T13:12:00Z" },
  { id: "m3", sender_id: "u1", sender_name: "Sarah Mitchell", recipient_id: "me", recipient_name: "You", content: "The NDA documents are ready for review. I've included the updated confidentiality clauses as discussed.", is_encrypted: true, created_at: "2026-04-03T14:20:00Z", read_at: null },
  { id: "m4", sender_id: "u1", sender_name: "Sarah Mitchell", recipient_id: "me", recipient_name: "You", content: "Also flagged a potential compliance issue on section 4.2 — please review before sending to client.", is_encrypted: true, created_at: "2026-04-03T14:22:00Z", read_at: null },
];

export default function SecureCommsPage() {
  const [conversations] = useState<Conversation[]>(MOCK_CONVERSATIONS);
  const [selectedConvo, setSelectedConvo] = useState<string>("u1");
  const [messages] = useState<Message[]>(MOCK_MESSAGES);
  const [newMessage, setNewMessage] = useState("");

  const handleSend = () => {
    if (!newMessage.trim()) return;
    // In production, POST to /api/v1/compliance/comms/message
    setNewMessage("");
  };

  return (
    <main className="min-h-screen bg-chamber-950 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-display font-bold text-gold-400">
            Secure Communications
          </h1>
          <p className="text-chamber-400 mt-1">
            End-to-end encrypted messaging with full audit trail
          </p>
        </div>

        <div className="grid grid-cols-12 gap-4 h-[calc(100vh-200px)]">
          {/* Conversation List */}
          <div className="col-span-4 bg-chamber-900 border border-chamber-800 rounded-lg overflow-hidden flex flex-col">
            <div className="p-4 border-b border-chamber-800">
              <input
                type="text"
                placeholder="Search conversations..."
                className="w-full bg-chamber-800 border border-chamber-700 text-white rounded-md px-3 py-2 text-sm placeholder-chamber-500"
              />
            </div>
            <div className="flex-1 overflow-y-auto">
              {conversations.map((convo) => (
                <button
                  key={convo.user_id}
                  onClick={() => setSelectedConvo(convo.user_id)}
                  className={`w-full text-left p-4 border-b border-chamber-800 hover:bg-chamber-800/50 transition-colors ${
                    selectedConvo === convo.user_id ? "bg-chamber-800/70" : ""
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-white">{convo.user_name}</span>
                    <span className="text-xs text-chamber-500">
                      {new Date(convo.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-chamber-400 truncate pr-4">{convo.last_message}</p>
                    {convo.unread > 0 && (
                      <span className="bg-gold-400 text-chamber-950 text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
                        {convo.unread}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                    <span className="text-[10px] text-chamber-500">Encrypted</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Message Thread */}
          <div className="col-span-8 bg-chamber-900 border border-chamber-800 rounded-lg overflow-hidden flex flex-col">
            <div className="p-4 border-b border-chamber-800 flex items-center justify-between">
              <div>
                <h3 className="text-white font-medium">
                  {conversations.find((c) => c.user_id === selectedConvo)?.user_name}
                </h3>
                <span className="text-xs text-emerald-400">End-to-end encrypted</span>
              </div>
              <button className="text-xs text-chamber-400 hover:text-white transition-colors px-3 py-1 border border-chamber-700 rounded">
                View Audit Trail
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender_id === "me" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[70%] rounded-lg p-3 ${
                      msg.sender_id === "me"
                        ? "bg-gold-400/10 border border-gold-400/20"
                        : "bg-chamber-800 border border-chamber-700"
                    }`}
                  >
                    <p className="text-sm text-white">{msg.content}</p>
                    <div className="flex items-center justify-end gap-2 mt-1">
                      <span className="text-[10px] text-chamber-500">
                        {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                      {msg.is_encrypted && (
                        <span className="text-[10px] text-emerald-500">encrypted</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Compose */}
            <div className="p-4 border-t border-chamber-800">
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  placeholder="Type a secure message..."
                  className="flex-1 bg-chamber-800 border border-chamber-700 text-white rounded-md px-4 py-2 text-sm placeholder-chamber-500"
                />
                <button
                  onClick={handleSend}
                  className="bg-gold-400 text-chamber-950 px-4 py-2 rounded-md text-sm font-medium hover:bg-gold-300 transition-colors"
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../api/axiosConfig";
import Navbar from "../components/Navbar";

const ChatAssistant = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: `Bonjour ${user?.firstName} ! Je suis votre assistant Student Arena. Comment puis-je vous aider aujourd'hui ?`
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const scrollToBottom = () => {
    const messagesEnd = document.getElementById("messages-end");
    if (messagesEnd) {
      messagesEnd.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      // Prepare history (excluding the very first welcome message if needed, but let's include all context)
      const history = messages.map(msg => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }]
      }));

      const res = await api.post('/ai/chat', { message: input, conversationHistory: history });
      const response = res.data;
      
      if (response.success) {
        setMessages((prev) => [...prev, { role: "assistant", content: response.reply }]);
      }
    } catch (err) {
      setMessages((prev) => [...prev, { role: "assistant", content: "Désolé, j'ai rencontré une erreur. Veuillez réessayer." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <Navbar />
      <main style={styles.main}>
        <div style={styles.chatCard}>
          <div style={styles.chatHeader}>
            <div style={styles.botInfo}>
              <div style={styles.botAvatar}></div>
              <div>
                <h2 style={styles.botName}>Assistant Student Arena</h2>
                <div style={styles.botStatus}>
                  <span style={styles.statusDot}></span> En ligne
                </div>
              </div>
            </div>
          </div>

          <div style={styles.messageArea}>
            {messages.map((msg, index) => (
              <div 
                key={index} 
                style={{
                  ...styles.messageRow,
                  justifyContent: msg.role === "user" ? "flex-end" : "flex-start"
                }}
              >
                <div 
                  className={`message-bubble ${msg.role}`}
                  style={{
                    ...styles.messageBubble,
                    background: msg.role === "user" ? "#6366f1" : "#f1f5f9",
                    color: msg.role === "user" ? "#fff" : "#1e293b",
                    borderRadius: msg.role === "user" ? "18px 18px 2px 18px" : "18px 18px 18px 2px"
                  }}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div style={styles.messageRow}>
                <div style={{ ...styles.messageBubble, background: "#f1f5f9", color: "#64748b" }}>
                  <div style={styles.typing}>
                    <span></span><span></span><span></span>
                  </div>
                </div>
              </div>
            )}
            <div id="messages-end" />
          </div>

          <form onSubmit={handleSend} style={styles.inputArea}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Posez votre question ici..."
              className="chat-input"
              style={styles.input}
              disabled={loading}
            />
            <button type="submit" className="send-btn" style={styles.sendBtn} disabled={loading || !input.trim()}>
              {loading ? "..." : "Envoyer"}
            </button>
          </form>
        </div>
      </main>
      <style>{`
        @keyframes typing {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        .typing span {
          display: inline-block;
          width: 6px;
          height: 6px;
          background: #64748b;
          border-radius: 50%;
          margin: 0 2px;
          
        }
        .typing span:nth-child(2) { animation-delay: 0.2s; }
        .typing span:nth-child(3) { animation-delay: 0.4s; }

        .chat-input:focus {
          border-color: #6366f1 !important;
          background: #fff !important;
        }
        .send-btn:hover:not(:disabled) {
          background: #4f46e5 !important;
          transform: translateY(-1px);
        }
        .message-bubble {
          transition: transform 0.2s;
        }
        .message-bubble.user:hover {
          transform: scale(1.02);
        }
      `}</style>
    </div>
  );
};

const styles = {
  container: {
    minHeight: "100vh",
    backgroundColor: "#f8fafc",
  },
  main: {
    maxWidth: "800px",
    margin: "0 auto",
    padding: "40px 24px",
    height: "calc(100vh - 150px)",
  },
  chatCard: {
    background: "#fff",
    borderRadius: "20px",
    border: "1px solid #e2e8f0",
    display: "flex",
    flexDirection: "column",
    height: "100%",
    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.05)",
  },
  chatHeader: {
    padding: "20px 24px",
    borderBottom: "1px solid #e2e8f0",
  },
  botInfo: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  botAvatar: {
    width: "0px",
    height: "0px",
    display: "none",
  },
  botName: {
    fontSize: "16px",
    fontWeight: "700",
    color: "#1e293b",
    margin: 0,
  },
  botStatus: {
    fontSize: "12px",
    color: "#059669",
    display: "flex",
    alignItems: "center",
    gap: "5px",
    fontWeight: "500",
  },
  statusDot: {
    width: "8px",
    height: "8px",
    background: "#10b981",
    borderRadius: "50%",
  },
  messageArea: {
    flex: 1,
    overflowY: "auto",
    padding: "24px",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  messageRow: {
    display: "flex",
    width: "100%",
  },
  messageBubble: {
    maxWidth: "80%",
    padding: "12px 18px",
    fontSize: "14px",
    lineHeight: "1.5",
  },
  typing: {
    display: "flex",
    alignItems: "center",
    height: "20px",
  },
  inputArea: {
    padding: "20px 24px",
    borderTop: "1px solid #e2e8f0",
    display: "flex",
    gap: "12px",
  },
  input: {
    flex: 1,
    padding: "12px 18px",
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: "12px",
    fontSize: "14px",
    outline: "none",
    transition: "all 0.2s",
  },
  sendBtn: {
    padding: "0 24px",
    background: "#6366f1",
    color: "#fff",
    border: "none",
    borderRadius: "12px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s",
  }
};

export default ChatAssistant;

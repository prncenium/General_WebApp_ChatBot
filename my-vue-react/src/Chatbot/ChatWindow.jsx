import { GoogleGenAI } from "@google/genai";
import { Loader2, Maximize2, Minimize2, Send, Sparkle, Trash2, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import ChatMessage from "./ChatMessage";

const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });

const STORAGE_KEY = "chat-history-v1";

const getGreeting = (name) => ({
    id: crypto.randomUUID(),
    text: `Hi ${name}! I'm your AI assistant. How can I help you today?`,
    isBot: true,
    timestamp: Date.now(),
});

const ChatWindow = ({ isOpen, onClose }) => {
    const [userName, setUserName] = useState("Guest");
    const [userInitial, setUserInitial] = useState("G");
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [isNearBottom, setIsNearBottom] = useState(true);
    const [hasNewMessages, setHasNewMessages] = useState(false);

    const chatWindowRef = useRef(null);
    const messageListRef = useRef(null);
    const messageEndRef = useRef(null);
    const inputRef = useRef(null);
    const messagesRef = useRef(messages);
    const prevMessageCountRef = useRef(0);

    useEffect(() => {
        messagesRef.current = messages;
    }, [messages]);

    // runs each time the chat is opened so a fresh username/history can be picked up
    useEffect(() => {
        if (!isOpen) return;

        const storedUserDetails = localStorage.getItem("name");
        const userDetails = storedUserDetails ? JSON.parse(storedUserDetails) : null;
        const name = userDetails?.name || "Guest";
        setUserName(name);
        setUserInitial(name.charAt(0).toUpperCase());

        const storedHistory = localStorage.getItem(STORAGE_KEY);
        setMessages(storedHistory ? JSON.parse(storedHistory) : [getGreeting(name)]);
    }, [isOpen]);

    useEffect(() => {
        if (messages.length > 0) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
        }
    }, [messages]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (chatWindowRef.current && !chatWindowRef.current.contains(event.target)) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen, onClose]);

    useEffect(() => {
        const isNewMessage = messages.length > prevMessageCountRef.current;
        prevMessageCountRef.current = messages.length;
        if (!isNewMessage) return;

        if (isNearBottom) {
            messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
        } else {
            setHasNewMessages(true);
        }
    }, [messages, isNearBottom]);

    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    // traps Tab focus inside the dialog while it's open
    useEffect(() => {
        if (!isOpen) return;

        const handleTabTrap = (event) => {
            if (event.key !== "Tab") return;

            const focusable = chatWindowRef.current?.querySelectorAll(
                'button, textarea, [href], input, select, [tabindex]:not([tabindex="-1"])'
            );
            if (!focusable || focusable.length === 0) return;

            const first = focusable[0];
            const last = focusable[focusable.length - 1];

            if (event.shiftKey && document.activeElement === first) {
                event.preventDefault();
                last.focus();
            } else if (!event.shiftKey && document.activeElement === last) {
                event.preventDefault();
                first.focus();
            }
        };

        document.addEventListener("keydown", handleTabTrap);
        return () => document.removeEventListener("keydown", handleTabTrap);
    }, [isOpen]);

    const handleScroll = useCallback(() => {
        const el = messageListRef.current;
        if (!el) return;

        const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
        const nearBottom = distanceFromBottom < 100;
        setIsNearBottom(nearBottom);
        if (nearBottom) setHasNewMessages(false);
    }, []);

    const scrollToBottom = useCallback(() => {
        messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
        setIsNearBottom(true);
        setHasNewMessages(false);
    }, []);

    const sendMessage = useCallback(async (text, userMsgId) => {
        setIsLoading(true);
        try {
            const chatHistory = messagesRef.current
                .filter((m) => m.id !== userMsgId)
                .slice(1)
                .map((m) => ({ role: m.isBot ? "model" : "user", parts: [{ text: m.text }] }));

            const customPrompt = `Provide a concise and friendly answer. If the user specifies a number of lines, please adhere to that limit. Use emojis to make the response more engaging. User's query: "${text}"`;

            const fullConversation = [...chatHistory, { role: "user", parts: [{ text: customPrompt }] }];

            const result = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: fullConversation,
            });

            setMessages((prev) => [
                ...prev,
                { id: crypto.randomUUID(), text: result.text, isBot: true, timestamp: Date.now() },
            ]);
        } catch (error) {
            console.error("Gemini request failed:", error);
            setMessages((prev) => prev.map((m) => (m.id === userMsgId ? { ...m, error: true } : m)));
        } finally {
            setIsLoading(false);
        }
    }, []);

    const handleSubmit = useCallback(
        (e) => {
            e.preventDefault();
            const text = input.trim();
            if (!text || isLoading) return;

            setInput("");
            const id = crypto.randomUUID();
            setMessages((prev) => [...prev, { id, text, isBot: false, timestamp: Date.now() }]);
            sendMessage(text, id);
        },
        [input, isLoading, sendMessage]
    );

    const handleKeyDown = useCallback(
        (e) => {
            if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
            }
        },
        [handleSubmit]
    );

    const handleRetry = useCallback(
        (id) => {
            if (isLoading) return;
            const msg = messagesRef.current.find((m) => m.id === id);
            if (!msg) return;

            setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, error: false } : m)));
            sendMessage(msg.text, id);
        },
        [isLoading, sendMessage]
    );

    const handleClearChat = useCallback(() => {
        localStorage.removeItem(STORAGE_KEY);
        setMessages([getGreeting(userName)]);
    }, [userName]);

    if (!isOpen) return null;

    const windowSizeClasses = isMinimized
        ? "h-14 w-[calc(100vw-2rem)] max-w-sm sm:w-80"
        : "w-[calc(100vw-2rem)] max-w-sm h-[calc(100vh-6rem)] max-h-[600px] sm:w-80 sm:h-[550px]";

    return (
        <div
            ref={chatWindowRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="chat-window-title"
            className={`fixed bottom-20 right-4 bg-gray-900 rounded-2xl shadow-2xl border-gray-700 overflow-hidden transition-all duration-300 ease-in-out backdrop-blur-lg border ${windowSizeClasses}`}
        >
            <div className="bg-gradient-to-r from-[#7f02e6] to-[#c33be6] text-white p-3 flex items-center justify-center h-15">
                <div className="flex items-center gap-2 ">
                    <div className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
                        <Sparkle size={22} className="text-white" />
                    </div>
                    <div>
                        <h3 id="chat-window-title" className="font-medium text-sm text-white">Ai Assistant</h3>
                        <p>
                            Welcome !!, {" "}
                            {userName.length > 15 ? `${userName.slice(0, 15)}...` : userName}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-1">
                    <button
                        onClick={handleClearChat}
                        aria-label="Clear chat"
                        className="p-1.5 hover:bg-white/10 rounded-full transition-colors"
                    >
                        <Trash2 size={16} />
                    </button>

                    <button
                        onClick={() => setIsMinimized(!isMinimized)}
                        aria-label={isMinimized ? "Maximize chat" : "Minimize chat"}
                        className="p-1.5 hover:bg-white/10 rounded-full transition-colors"
                    >
                        {isMinimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
                    </button>

                    <button
                        onClick={onClose}
                        aria-label="Close chat"
                        className="p-1.5 hover:bg-white/10 rounded-full transition-colors"
                    >
                        <X size={16} />
                    </button>
                </div>
            </div>

            {!isMinimized && (
                <>
                    <div className="relative h-[calc(100%-8rem)]">
                        <div
                            ref={messageListRef}
                            onScroll={handleScroll}
                            role="log"
                            aria-live="polite"
                            aria-atomic="false"
                            className="h-full overflow-y-auto p-3 space-y-3 bg-gray-900"
                        >
                            {messages.map((msg) => (
                                <div key={msg.id} className="flex items-start gap-2 text-white">
                                    {msg.isBot ? (
                                        <ChatMessage text={msg.text} isBot={true} timestamp={msg.timestamp} />
                                    ) : (
                                        <div className="flex items-start gap-2 justify-end w-full text-white">
                                            <div className="flex-1">
                                                <ChatMessage
                                                    text={msg.text}
                                                    isBot={false}
                                                    timestamp={msg.timestamp}
                                                    error={msg.error}
                                                    onRetry={() => handleRetry(msg.id)}
                                                />
                                            </div>

                                            <div className="w-6 h-6 rounded-full bg-gradient-to-r from-[#7f02e6] to-[#c33be6] text-white flex items-center justify-center flex-shrink-0 text-xs">
                                                {userInitial}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}

                            {isLoading && (
                                <div className="flex items-center gap-2 text-white p-2">
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span className="text-xs">AI is Thinking...</span>
                                </div>
                            )}
                            <div ref={messageEndRef}></div>
                        </div>

                        {hasNewMessages && (
                            <button
                                onClick={scrollToBottom}
                                className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs px-3 py-1.5 rounded-full shadow-lg"
                            >
                                ↓ New messages
                            </button>
                        )}
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="relative">
                            <textarea
                                ref={inputRef}
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                rows={1}
                                style={{ maxHeight: "100px", minHeight: "40px" }}
                                placeholder="Type your message..."
                                aria-label="Type your message"
                                className="w-full pr-10 pl-3 py-2 rounded-xl border border-gray-200 text-white"
                            ></textarea>
                            <button
                                type="submit"
                                disabled={isLoading || !input.trim()}
                                aria-label="Send message"
                                className="text-white absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full "
                            >
                                <Send size={16} />
                            </button>
                        </div>
                    </form>
                </>
            )}
        </div>
    );
};

export default ChatWindow;

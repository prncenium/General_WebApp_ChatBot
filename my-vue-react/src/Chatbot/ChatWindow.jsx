import { GoogleGenAI } from "@google/genai";
import { Loader2, Maximize2, Minimize2, Send, Sparkle, X } from "lucide-react";
import { useState } from "react";
import { useRef } from "react";
import { useEffect } from "react";
import ChatMessage from "./ChatMessage";

// The client gets the API key from the environment variable `GEMINI_API_KEY`.
const ai = new GoogleGenAI({apiKey: import.meta.env.VITE_GEMINI_API_KEY});

const ChatWindow = ({isOpen, onClose}) =>{
    const [userName, setUserName] = useState("Guest");
    const [userInitial,setUserInitial] = useState("G");
    const [message,setMessage] = useState([]); //array bcoz, 2 chhez jyegi... from whom is it coming (taki left and right ho ske) and what is the message
    const [input,setInput] = useState("");
    const [isLoading,setIsLoading] = useState(false);
    const [isMinimized,setIsMinimised] = useState(false);
    const chatWindowRef = useRef(null); //taaki window k bahar click hone pe chat bot close ho jaye
    const messageEndRef = useRef(null); //taaki old chat upper jaati jaye and new neeche aati jaye 
    const inputRef = useRef(null); //as soon as i open chat bot it shoud focus on input box

    //this useEffect runs when user opens the chat window
    useEffect(()=>{
        const fetchUserData = ()=>{
            const storedUserDetails = localStorage.getItem("name");
            const userDetails = storedUserDetails ? JSON.parse(storedUserDetails) : null;
            setUserName(userDetails ?.name || "Guest");
            setUserInitial((userDetails?.name || "G").charAt(0).toUpperCase());
            setMessage([
                {
                    text:`Hi ${userDetails?.name || "Guest"}! I'm your AI assistant powered by @Prncenium 🤖 . We serve Humans (for now... lol) 😭😭`,
                    isBot:true, //setMessage was array and isBot shows ki,bot nei msg kra, ab next human ki bari h 
                },
            ]);
        };

        if(isOpen){
            fetchUserData();
        }

    }, [isOpen]);

    //this useEffect will deal with closing of the Bot popUp, Like chat Bot dikhe ya nahi
    useEffect(()=>{
        const handleClickOutside = (event)=>{
            if(chatWindowRef.current && !chatWindowRef.current.contains(event.target)){ //either box k bahar click or closing chat window pe click kia h
                onClose();
            }
        };

        if(isOpen){
            document.addEventListener("mousedown",handleClickOutside);
        };

        return ()=> {
            document.addEventListener("mousedown",handleClickOutside);
        }
            
        
    },[isOpen, onClose]);

    //this useEffect will help us to scroll msfg
    useEffect(()=>{
        messageEndRef.current?.scrollIntoView({ behavior: "smooth"})
    },[message])

    //Input lene k liye ye wla code
    useEffect(()=>{
        if(isOpen && inputRef.current){
            inputRef.current.focus();
        }
    },[isOpen])

    //sending query to gemini and taking ans from it 
    const handleSubmit =async(e)=>{
        e.preventDefault();
        if(!input.trim() || isLoading) return;

        const userMessage = input.trim();
        setInput("");
        setMessage(prev=>[...prev,{text: userMessage, isBot:false}]); //prev is for copying the whole data and isBot bcoz mene bheja h input 
        setIsLoading(true);

        try {
            //1. We build the history of past message
            const chatHistory = message.slice(1)   //removed the bot greeting part
            .map(m => ({
                role: m.isBot ? 'model' : 'user', parts: [{ text: m.text }],    //only ai model kei chats utha liye
            }));
            //2. prompt de dia
            const customPrompt = `Provide a concise and friendly answer. If the user specifies a number of lines, please adhere to that limit. Use emojis to make the response more engaging. User's query: "${userMessage}"`;

            // 3. We combine them: history first, then the new message with your rules
            const fullConversation = [...chatHistory, {
                role: 'user',
                parts: [{ text: customPrompt }],
            }]
            const result = await ai.models.generateContent({
                 model: "gemini-2.5-flash",
                 contents: fullConversation,
            });

            const reply = result.text;
            setMessage((prev)=>[...prev,{text:reply, isBot:true}]);

        } catch (error) {
            console.log("Error: ", error);
            setMessage((prev)=>[...prev,{text:"I am sorry, I ran into an error",isBot:true}]);

        }
        finally{
            setIsLoading(false)
        }

    }

    //jb bhi ENTER press kru, tb search  krna start kr de, 
    const handleKeyDown=(e)=>{
        if(e.key==="Enter" && !e.shiftKey){
            e.preventDefault();
            handleSubmit(e);
        }
    };

    //UI wala Part.....
    if(!isOpen) return null;

    return (
        <div ref = {chatWindowRef} className={`fixed bottom-20 right-4 w-80 bg-gray-900 rounded-2xl shadow-2xl border-gray-700 overflow-hidden transition-all duration-300 ease-in-out backdrop-blur-lg border ${isMinimized ?"h-14": "h-[550px]"}`}>  {/*jbtk chat ui pe click na ho tb tk oad na hoo... isliye ref h   */}


            {/* Header Part */}
            <div className="bg-gradient-to-r from-[#7f02e6] to-[#c33be6] text-white p-3 flex items-center justify-center h-15">
                <div className="flex items-center gap-2 ">
                    <div className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
                        <Sparkle size={22} className="text-white" />
                    </div>
                    <div>
                        <h3 className="font-medium text-sm text-white">Ai Assistant</h3>
                        <p >
                            Welcome !!, {" "}
                            {userName.length >15? `${userName.slice(0,15)}...`: userName }
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-1">
                    <button onClick={()=>setIsMinimised(!isMinimized) } className="p-1.5 hover:bg-white/10 rounded-full transition-colors">
                        {isMinimized?<Maximize2 size={16} />:<Minimize2 size={16} /> }
                    </button>

                    <button onClick={onClose} className="p-1.5 hover:bg-white/10 rounded-full transition-colors">
                        <X size={16}/>
                    </button>
                </div>
            </div>

            {!isMinimized && (
                <>
                   {/* Message*/}
                    <div className="h-[calc(100%-8rem)] overflow-y-auto p-3 space-y-3 bg-gray-900">
                        {message.map((message, index)=>(
                            <div key={index} className="flex items-start gap-2 text-white">
                                {message.isBot? (<ChatMessage message={message.text} isBot={true} />): (
                                    <div className="flex items-start gap-2 justify-end w-full text-white"> 
                                        <div className="flex-1">
                                            <ChatMessage message={message.text} isBot={false} />
                                        </div>

                                        <div className="w-6 h-6 rounded-full bg-gradient-to-r from-[#7f02e6] to-[#c33be6] text-white flex items-center justify-center flex-shrink-0 text-xs">
                                            {userInitial}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}

                        {isLoading && (<div className="flex items-center gap-2 text-white p-2">
                            <Loader2 className="w-4 h-4 animate-spin" /> 
                            <span className="text-xs" >Ai is Thinnking...</span>
                            </div>)}
                        <div ref={messageEndRef}></div>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="relative">
                            <textarea 
                            ref={inputRef}
                            value={input}
                            onChange={(e)=>{setInput(e.target.value)}}
                            onKeyDown={handleKeyDown}
                            rows={1}
                            style={{maxHeight:"100px", minHeight:"40px"}} 
                            placeholder="Type ur Fuckin Issue !!"
                            className={`w-full pr-10 pl-3 py-2 rounded-xl border border-gray-200 text-white`}>

                            </textarea>
                            <button type="submit" disabled={isLoading || !input.trim()} className={`text-white absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full `}>
                                <Send size={16} />
                            </button>
                        </div>
                    </form>
                </>
            )}

        </div>
    )
    
};

export default ChatWindow;
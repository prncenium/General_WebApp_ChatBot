import { Bot } from 'lucide-react';
import React from 'react'
import ReactMarkdown from "react-markdown"


const ChatMessage = ({message,isBot}) => {
  return (
    <div className={`rounded-xl p-3 ${isBot?"bg-gray-800 shadow-sm" : "bg-gradient-to-r from-indigo-500/10 to-purple-500/10"}`}>

      {isBot && (<div className=' flex items-center gap-2 mb-2'>
        <div className='w-6 h-6 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white flex items-center justify-center flex-shrink-0'>
            <Bot size={14} />
        </div>
      </div>)
      }
      <div className={`overflow-hidden text-sm ${isBot?"ml-8": ""}`}></div>
      <ReactMarkdown>{message}</ReactMarkdown>
    </div>
  )
}

export default ChatMessage;

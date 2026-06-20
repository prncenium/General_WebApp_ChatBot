import { forwardRef } from "react";
import {MessageSquareCode, X } from 'lucide-react';
import {twMerge} from 'tailwind-merge';

const ChatButton = forwardRef(({isOpen,onClick}, ref) =>{
    return(
        <button
        ref={ref}
        onClick={onClick}
        aria-label={isOpen ? "Close chat" : "Open chat"}
        className={twMerge("fixed bottom-4 right-4 w-12 h-12 rounded-full shadow-lg",
        "flex items-center justify-center transition-all duration-400",
        "hover:scale-110 active:scale-95",
        isOpen? "bg-gray-700 hover:bg-gray-800 stroke-white" :"bg-gradient-to-r from-indigo-500 to-purple-600 hover:opacity-90 stroke-white"
        )}>
            {isOpen? (
                <X className="w-5 h-5 text white stroke-white"/>
            ) : (
                <MessageSquareCode className="stroke-white" />
            )
            }

        </button>
    )
})

export default ChatButton;

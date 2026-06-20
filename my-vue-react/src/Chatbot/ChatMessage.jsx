import { Bot } from 'lucide-react';
import { memo } from 'react';
import ReactMarkdown from "react-markdown"

const formatRelativeTime = (timestamp) => {
  const diff = Date.now() - timestamp;
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (diff < minute) return "just now";
  if (diff < hour) return `${Math.floor(diff / minute)}m ago`;
  if (diff < day) return `${Math.floor(diff / hour)}h ago`;
  return `${Math.floor(diff / day)}d ago`;
};

const ChatMessage = ({ text, isBot, timestamp, error, onRetry }) => {
  return (
    <div className={`rounded-xl p-3 ${isBot ? "bg-gray-800 shadow-sm" : "bg-gradient-to-r from-indigo-500/10 to-purple-500/10"} ${error ? "border border-red-500" : ""}`}>

      {isBot && (<div className=' flex items-center gap-2 mb-2'>
        <div className='w-6 h-6 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white flex items-center justify-center flex-shrink-0'>
            <Bot size={14} />
        </div>
      </div>)
      }
      <div className={`overflow-hidden text-sm ${isBot?"ml-8": ""}`}>
        <ReactMarkdown>{text}</ReactMarkdown>

        <div className="flex items-center gap-2 mt-1">
          <time
            dateTime={new Date(timestamp).toISOString()}
            title={new Date(timestamp).toLocaleString()}
            className="text-[10px] text-gray-400"
          >
            {formatRelativeTime(timestamp)}
          </time>

          {error && (
            <button
              type="button"
              onClick={onRetry}
              aria-label="Retry sending message"
              className="text-[10px] text-red-400 hover:text-red-300 underline"
            >
              Retry
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default memo(ChatMessage);

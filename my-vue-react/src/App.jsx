import { useState } from 'react'
import ChatButton from './Chatbot/ChatButton';

import './App.css'
import ChatWindow from './Chatbot/ChatWindow';


function App() {
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <>
      <ChatButton 
        isOpen={isChatOpen} 
        onClick={() => setIsChatOpen(!isChatOpen)} 
      />

      <ChatWindow isOpen={isChatOpen} onClose={()=>setIsChatOpen(false)} />
    </>
  )
}

export default App

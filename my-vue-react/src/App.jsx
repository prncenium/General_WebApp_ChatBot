import { useRef, useState } from 'react'
import ChatButton from './Chatbot/ChatButton';

import './App.css'
import ChatWindow from './Chatbot/ChatWindow';


function App() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const chatButtonRef = useRef(null);

  const handleClose = () => {
    setIsChatOpen(false);
    chatButtonRef.current?.focus();
  };

  return (
    <>
      <ChatButton
        ref={chatButtonRef}
        isOpen={isChatOpen}
        onClick={() => setIsChatOpen(!isChatOpen)}
      />

      <ChatWindow isOpen={isChatOpen} onClose={handleClose} />
    </>
  )
}

export default App

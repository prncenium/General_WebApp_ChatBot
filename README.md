# 🤖 General WebApp ChatBot


![React](https://img.shields.io/badge/React-18.x-61DAFB?logo=react)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.x-38B2AC?logo=tailwind-css)

A general-purpose, plug-and-play React chatbot component. It's designed to be easily integrated into any existing React web application.

It's free to use, remembers chat history using `localStorage`, and can be quickly connected to your own chatbot API (like OpenAI, Gemini, or a custom backend).

## 🚀 Demo

(Here's where you should add a screenshot or GIF of your chatbot in action!)



## ✨ Features

* **Easy Integration:** Simply drop the component into any React app.
* **Persistent Chat History:** Remembers the conversation history even after a page reload by using `localStorage`.
* **Custom API Ready:** Designed to be hooked up to any API.
* **Styled with Tailwind:** Fully responsive and easily customizable using Tailwind CSS utility classes.
* **Free to Use:** Licensed under the MIT license.

## 🛠️ Tech Stack

* **React:** Core component library.
* **Tailwind CSS:** For styling and responsiveness.

## 🔌 How to Integrate

### 1. Prerequisites

Your main project must have **React** and **Tailwind CSS** installed and configured.

If you don't have Tailwind set up, follow the official guide for your framework (e.g., [Install Tailwind CSS with Create React App](https://tailwindcss.com/docs/guides/create-react-app)).

### 2. Installation

The easiest way to use this is to copy the component files into your project.

1.  Clone this repository or download the source code.
2.  Copy the `ChatBot` component directory (e.g., `src/components/ChatBot`) into your project's `src/components` folder.

### 3. Configuration (The API Key)

This chatbot is designed to get its API key from environment variables to keep it secure.

1.  In the **root of your project** (not this repo), create a file named `.env.local` if you don't already have one.
2.  Add your API key to this file. **Important:** React requires environment variables to be prefixed with `REACT_APP_`.

    ```.env
    REACT_APP_CHATBOT_API_KEY=your_secret_api_key_goes_here
    ```

3.  **Restart your React app** for the new environment variable to be loaded.

4.  Inside the `ChatBot` component file, you will need to find where the API call is made and ensure it's using this environment variable.

    ```js
    // Inside your ChatBot component's API logic:
    const API_KEY = process.env.REACT_APP_CHATBOT_API_KEY;
    
    // ... then use API_KEY in your fetch/axios call
    ```

## 💻 Usage

Once installed and configured, import and use the component anywhere in your app:

```jsx
import React from 'react';
import ChatBot from './components/ChatBot'; // Adjust the import path as needed

function App() {
  return (
    <div className="App">
      {/* Your other app content */}
      
      {/* Add the chatbot component */}
      {/* It will likely be fixed or absolute positioned */}
      <ChatBot />
      
    </div>
  );
}

export default App;

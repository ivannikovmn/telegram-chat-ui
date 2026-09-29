import { useState } from 'react'
import './App.css'

type Message = {
  id: number
  text: string
  outgoing: boolean
}

const initialMessages: Message[] = [
  {
    id: 1,
    text: 'GREEN-API test',
    outgoing: true,
  },
  {
    id: 2,
    text: 'HTTP API test',
    outgoing: false,
  },
]

function App() {
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState<Message[]>(initialMessages)

  const handleSend = () => {
    const text = message.trim()

    if (!text) {
      return
    }

    setMessages((currentMessages) => [
      ...currentMessages,
      {
        id: Date.now(),
        text,
        outgoing: true,
      },
    ])

    setMessage('')
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleSend()
    }
  }

  return (
    <main className="chat">
      <header className="chat-header">
        <div className="avatar">M</div>

        <div>
          <h1>Mikhail</h1>
          <span>Telegram</span>
        </div>
      </header>

      <section className="messages">
        {messages.map((item) => (
          <div
            key={item.id}
            className={`message ${item.outgoing ? 'message-outgoing' : 'message-incoming'}`}
          >
            {item.text}
          </div>
        ))}
      </section>

      <footer className="message-form">
        <input
          type="text"
          placeholder="Message..."
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          onKeyDown={handleKeyDown}
        />

        <button type="button" onClick={handleSend}>
          Send
        </button>
      </footer>
    </main>
  )
}

export default App
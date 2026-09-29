import { useEffect, useState, type KeyboardEvent } from 'react'
import './App.css'
import {
  deleteNotification,
  receiveNotification,
} from './greenApi'


type Message = {
  id: number
  text: string
  outgoing: boolean
}

function App() {
  const [idInstance, setIdInstance] = useState('410022750277')
  const [apiTokenInstance, setApiTokenInstance] = useState('')
  const [chatId, setChatId] = useState('844045843')

  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState('')

  const handleSend = async () => {
    const text = message.trim()

    if (!text || isSending) {
      return
    }

    if (!idInstance || !apiTokenInstance || !chatId) {
      setError('Enter GREEN-API credentials and chat ID')
      return
    }

    setIsSending(true)
    setError('')

    try {
      const response = await fetch(
        `https://${idInstance.slice(0, 4)}.api.green-api.com/waInstance${idInstance}/sendMessage/${apiTokenInstance}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            chatId,
            message: text,
          }),
        },
      )

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      await response.json()

      setMessages((currentMessages) => [
        ...currentMessages,
        {
          id: Date.now(),
          text,
          outgoing: true,
        },
      ])

      setMessage('')
    } catch {
      setError('Failed to send message')
    } finally {
      setIsSending(false)
    }
  }

useEffect(() => {
  if (!idInstance || !apiTokenInstance) {
    return
  }

  let stopped = false

  const receiveMessages = async () => {
    while (!stopped) {
      try {
        const notification = await receiveNotification(
          idInstance,
          apiTokenInstance,
        )

        if (!notification) {
          continue
        }

        const messageData = notification.body.messageData
        const text = messageData?.textMessageData?.textMessage

        if (messageData?.typeMessage === 'textMessage' && text) {
          setMessages((currentMessages) => [
            ...currentMessages,
            {
              id: Date.now(),
              text,
              outgoing: false,
            },
          ])
        }

        await deleteNotification(
          idInstance,
          apiTokenInstance,
          notification.receiptId,
        )
      } catch {
        if (!stopped) {
          setError('Failed to receive message')
        }

        await new Promise((resolve) => setTimeout(resolve, 3000))
      }
    }
  }

  receiveMessages()

  return () => {
    stopped = true
  }
}, [idInstance, apiTokenInstance])  

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
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

      <section className="settings">
        <input
          type="text"
          placeholder="idInstance"
          value={idInstance}
          onChange={(event) => setIdInstance(event.target.value)}
        />

        <input
          type="password"
          placeholder="apiTokenInstance"
          value={apiTokenInstance}
          onChange={(event) => setApiTokenInstance(event.target.value)}
        />

        <input
          type="text"
          placeholder="chatId"
          value={chatId}
          onChange={(event) => setChatId(event.target.value)}
        />
      </section>

      {error && <div className="error">{error}</div>}

      <section className="messages">
        {messages.map((item) => (
          <div
            key={item.id}
            className={`message ${
              item.outgoing ? 'message-outgoing' : 'message-incoming'
            }`}
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

        <button type="button" onClick={handleSend} disabled={isSending}>
          {isSending ? 'Sending...' : 'Send'}
        </button>
      </footer>
    </main>
  )
}

export default App

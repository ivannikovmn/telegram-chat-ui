
import { useEffect, useState, type KeyboardEvent } from 'react'
import './App.css'
import {
  checkAccount,
  deleteNotification,
  receiveNotification,
} from './greenApi'

type Message = {
  id: number
  text: string
  outgoing: boolean
}

function App() {
  const [idInstance, setIdInstance] = useState('')
  const [apiTokenInstance, setApiTokenInstance] = useState('')
  const [recipientPhone, setRecipientPhone] = useState('')
  const [chatId, setChatId] = useState('')

  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [isSending, setIsSending] = useState(false)
  const [isCreatingChat, setIsCreatingChat] = useState(false)
  const [error, setError] = useState('')

  const handleCreateChat = async () => {
    const phoneNumber = recipientPhone.replace(/\D/g, '')

    if (!idInstance.trim() || !apiTokenInstance.trim()) {
      setError('Enter your GREEN-API credentials')
      return
    }

    if (!/^\d{10,15}$/.test(phoneNumber)) {
      setError('Enter a phone number in international format, including country code')
      return
    }

    setIsCreatingChat(true)
    setError('')

    try {
      const newChatId = await checkAccount(
        idInstance.trim(),
        apiTokenInstance.trim(),
        phoneNumber,
      )

      setChatId(newChatId)
      setMessages([])
      setMessage('')
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : 'Failed to create chat',
      )
    } finally {
      setIsCreatingChat(false)
    }
  }

  const handleSend = async () => {
    const text = message.trim()

    if (!text || isSending) {
      return
    }

    if (!idInstance || !apiTokenInstance || !chatId) {
      setError('Connect to GREEN-API and create a chat first')
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
    if (!idInstance || !apiTokenInstance || !chatId) {
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
          const incomingChatId = notification.body.senderData?.chatId

          if (
            incomingChatId === chatId &&
            messageData?.typeMessage === 'textMessage' &&
            text
          ) {
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
            setError('Failed to receive message. Retrying...')
          }

          await new Promise((resolve) => setTimeout(resolve, 3000))
        }
      }
    }

    void receiveMessages()

    return () => {
      stopped = true
    }
  }, [idInstance, apiTokenInstance, chatId])

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      void handleSend()
    }
  }

  return (
    <main className="chat">
      <section className="connection-panel">
        <h2>GREEN-API connection</h2>

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
        </section>

        <div className="new-chat">
          <input
            type="tel"
            placeholder="Recipient phone number (with country code)"
            value={recipientPhone}
            onChange={(event) => setRecipientPhone(event.target.value)}
          />

          <button
            type="button"
            onClick={() => void handleCreateChat()}
            disabled={isCreatingChat}
          >
            {isCreatingChat ? 'Creating...' : 'Create chat'}
          </button>
        </div>
      </section>

      <header className="chat-header">
        <div className="avatar">T</div>

        <div>
          <h1>{recipientPhone || 'Telegram chat'}</h1>
          <span>Telegram</span>
        </div>
      </header>

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
          placeholder={chatId ? 'Message...' : 'Create a chat first...'}
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          onKeyDown={handleKeyDown}
          disabled={!chatId}
        />

        <button
          type="button"
          onClick={() => void handleSend()}
          disabled={isSending || !chatId}
        >
          {isSending ? 'Sending...' : 'Send'}
        </button>
      </footer>
    </main>
  )
}

export default App
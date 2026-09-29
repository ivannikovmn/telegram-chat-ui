# Telegram Chat UI

A simple React interface for sending and receiving text messages in Telegram using GREEN-API.

## About

The original assignment was specified for MAX.

Since the assignment explicitly allows Telegram as an alternative, this implementation uses Telegram via GREEN-API.

The interface is based on the visual concept of Telegram Web and intentionally provides only the minimum functionality required by the assignment.

## Features

- Connect to a GREEN-API Telegram instance
- Specify a recipient
- Send text messages
- Receive text messages
- Display the conversation in a simple chat interface

## Development

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

The application will be available at:

http://localhost:5173

## Notes

GREEN-API credentials are entered by the user at runtime and are not stored in the repository.

Only text messages are supported, as required by the assignment.

## Stack

- React
- TypeScript
- Vite
- GREEN-API Telegram
- ESLint
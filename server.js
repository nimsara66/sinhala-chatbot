import { sendPostRequest } from './chatGPTUtil.js'

import express from 'express'
const app = express()

import dotenv from 'dotenv'
dotenv.config()

import { dirname } from 'path'
import { fileURLToPath } from 'url'
import path from 'path'
const __dirname = dirname(fileURLToPath(import.meta.url))

// middlewares
app.use(express.json())

// only when production
app.use(express.static(path.resolve(__dirname, './client/dist')))

import morgan from 'morgan'
if (process.env.NODE_ENV !== 'Production') {
  app.use(morgan('dev'))
}

// routes
app.post('/api/v1/chat', async (req, res) => {
  const { conversationId, parentMessageId, content: message } = req.body

  if (!message) {
    res.sendStatus(400)
  }

  try {
    const response = await sendPostRequest({
      prompt: message,
      conversationId,
      parentMessageId,
    })

    const reader = response.body.getReader()
    let lastChunk = new Uint8Array()
    let secondToLastChunk = new Uint8Array()
    res.setHeader('Content-Type', 'application/octet-stream')
    res.setHeader('Transfer-Encoding', 'chunked')
    res.setHeader('Connection', 'keep-alive')

    while (true) {
      const { done, value } = await reader.read()
      if (done) {
        break
      }

      secondToLastChunk = lastChunk
      lastChunk = value
      res.write(Buffer.from(secondToLastChunk))
    }
    res.end()
  } catch (error) {
    if (error.message.includes('404')) {
      res.sendStatus(404)
    } else {
      res.sendStatus(error.status || 503)
    }
  }
})

// only when production
app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, './client/build', 'index.html'))
})

const PORT = process.env.PORT || 5500

app.listen(PORT, () => {
  console.log(`Server listening on port: ${PORT}`)
})

import { sendPostRequest } from './chatGPTUtil.js'

import express from 'express'
const app = express()

import dotenv from 'dotenv'
dotenv.config()

// middlewares
app.use(express.json())

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

const PORT = process.env.PORT || 5500

app.listen(PORT, () => {
  console.log(`Server listening on port: ${PORT}`)
})

import crypto from 'crypto'

import dotenv from 'dotenv'
dotenv.config()

const API_ENDPOINT = 'https://chat.openai.com/backend-api/conversation'
const HEADERS = {
  'Content-Type': 'application/json',
  Accept: 'text/event-stream',
  cookie: process.env.CHATGPT_COOKIES,
  Authorization: process.env.CHATGPT_AUTH_TOKEN,
}

export const sendPostRequest = async (options = {}, header = {}) => {
  const {
    parentMessageId = crypto.randomUUID(),
    conversationId,
    prompt = 'hello world',
    model = 'Default',
  } = options
  const modelId = getModelId(model)

  try {
    const messageId = crypto.randomUUID()
    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: Object.assign(Object.assign({}, HEADERS), header),
      body: JSON.stringify({
        action: 'next',
        messages: [
          {
            id: messageId,
            role: 'user',
            content: {
              content_type: 'text',
              parts: [prompt],
            },
          },
        ],
        parent_message_id: parentMessageId,
        conversation_id: conversationId,
        model: modelId,
      }),
    })

    switch (response.status) {
      case 200:
        break
      case 400:
        throw new Error('Bad Request')
      case 401:
        throw new Error('Unauthorized')
      default:
        throw new Error(
          `Request failed with status code ${
            response.status
          }: ${await response.text()}`
        )
    }

    return response
  } catch (error) {
    console.error('Error sending POST request to ChatGPT API:', error)
    throw error
  }
}

const MODEL_ID_MAP = {
  Legacy: 'text-davinci-002-render-paid',
  Default: 'text-davinci-002-render-sha',
}

const getModelId = (model) => {
  const modelId = MODEL_ID_MAP[model]
  if (!modelId) {
    throw new Error(
      `Invalid model option: ${model}. Valid options are "Default" and "Legacy".`
    )
  }
  return modelId
}

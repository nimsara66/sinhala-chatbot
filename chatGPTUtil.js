import dotenv from 'dotenv'
dotenv.config()

const API_ENDPOINT = 'https://api.openai.com/v1/chat/completions'
const HEADERS = {
  'Content-Type': 'application/json',
  Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
}

export const sendPostRequest = async (options = {}, header = {}) => {
  const {
    messages = [{
      role: 'user',
      content: 'hello'
    }],
    model = 'Default',
  } = options
  const modelId = getModelId(model)

  try {
    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: Object.assign(Object.assign({}, HEADERS), header),
      body: JSON.stringify({
        messages,
        temperature: parseFloat(process.env.TEMPERATURE),
        max_tokens: parseInt(process.env.MAX_TOKENS),
        model: modelId,
        stream: true
      }),
    })

    return response
  } catch (error) {
    console.error('Error sending POST request to ChatGPT API:', error)
    throw error
  }
}

const MODEL_ID_MAP = {
  Legacy: 'gpt-3.5-turbo-0301',
  Default: 'gpt-3.5-turbo',
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

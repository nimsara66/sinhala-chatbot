import { SupabaseVectorStore } from 'langchain/vectorstores/supabase'
import { OpenAIEmbeddings } from 'langchain/embeddings/openai'
import { createClient } from '@supabase/supabase-js'
import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter'

import dotenv from 'dotenv'
dotenv.config()

const privateKey = process.env.SUPABASE_PRIVATE_KEY
if (!privateKey) throw new Error(`Expected env var SUPABASE_PRIVATE_KEY`)

const url = process.env.SUPABASE_URL
if (!url) throw new Error(`Expected env var SUPABASE_URL`)

const run = async () => {
  const client = createClient(url, privateKey)

  const loader = new PDFLoader('./pdf-src/U1-2.pdf')

  const docs = await loader.load()

  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 1,
  })

  const docOutput = await splitter.splitDocuments(docs)

  console.log(docOutput[1].pageContent.length)

  const vectorStore = await SupabaseVectorStore.fromDocuments(
    docOutput,
    new OpenAIEmbeddings({
      openAIApiKey: process.env.OPENAI_API_KEY,
    }),
    {
      client,
      tableName: 'documents',
      queryName: 'match_documents',
    }
  )

  const resultOne = await vectorStore.similaritySearch(
    'Write a graphql client in ballerina',
    1
  )

  console.log(resultOne)
}

// run()

export const query = async (question) => {
  const client = createClient(url, privateKey)
  const existingIndex = await SupabaseVectorStore.fromExistingIndex(
    new OpenAIEmbeddings({
      openAIApiKey: process.env.OPENAI_API_KEY,
    }),
    {
      client,
      tableName: 'documents',
      queryName: 'match_documents',
    }
  )

  const similarDocs = await existingIndex.similaritySearch(question)

  // console.log(similarDocs[0].pageContent+similarDocs[1].pageContent+similarDocs[2].pageContent+similarDocs[3].pageContent)
  return similarDocs
}

// query()
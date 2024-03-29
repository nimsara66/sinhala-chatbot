import { RxClipboardCopy } from 'react-icons/rx'
import { translateText } from '../../services/translate'

//Modules
import gptAvatar from '../../assets/gpt-avatar.svg'
import warning from '../../assets/warning.svg'
import user from '../../assets/user.png'
import { useRef, useState } from 'react'
import { useChat } from '../../store/chat'
import { useForm } from 'react-hook-form'
import { useAutoAnimate } from '@formkit/auto-animate/react'
import { useMutation } from 'react-query'

//Components
import { Input } from '../Input'
import { FiSend } from 'react-icons/fi'
import {
  Avatar,
  IconButton,
  Spinner,
  Stack,
  Text,
  Flex,
  Box,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Button,
  useMediaQuery,
} from '@chakra-ui/react'
import ReactMarkdown from 'react-markdown'
import { Instructions } from '../Layout/Instructions'

export const Chat = ({ ...props }) => {
  const [isOpen, setIsOpen] = useState(false)
  const cancelRef = useRef()
  const onClose = () => setIsOpen(false)
  const onOpen = () => setIsOpen(true)

  const [isSmallHeightAndWidth] = useMediaQuery(
    '(max-height: 932px) and (max-width: 430px)'
  )

  const {
    selectedChat,
    addMessage,
    addChat,
    editChat,
    editLastMessage,
    appendToLastMessage,
    removeChat,
  } = useChat()
  const selectedId = selectedChat?.id,
    selectedRole = selectedChat?.role

  const hasSelectedChat = selectedChat && selectedChat?.content.length > 0

  const { register, setValue, handleSubmit } = useForm()

  const overflowRef = useRef(null)
  const updateScroll = () => {
    overflowRef.current &&
      overflowRef.current.scrollTo(0, overflowRef.current.scrollHeight)
  }

  const [parentRef] = useAutoAnimate()

  const { mutate, isLoading } = useMutation({
    mutationKey: 'prompt',
    mutationFn: async (prompt) => {
      const processedMessages = await Promise.all(
        [
          ...selectedChat.content,
          {
            role: 'user',
            content: prompt,
          },
        ].map(async (message) => {
          const messageInEnglish = await translateText(
            message.content,
            'si',
            'en'
          )
          if (message.role === 'user' || message.role === 'assistant') {
            return { role: message.role, content: messageInEnglish }
          } else {
            return { role: 'assistant', content: messageInEnglish }
          }
        })
      )

      const response = await fetch('/api/v1/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages: processedMessages }),
      })

      if (response.status === 404) {
        onOpen()
        removeChat({ id: selectedId })
        addChat()
      } else if (response.status === 400) {
        throw new Error(
          'ඔබ ඇතුළු කළ දෙයෙහි යම් වරදක්. 🫠'
        )
      } else if (response.status === 413) {
        throw new Error(
          'නොමිලේ සේවාව ලබා දෙන බැවින් මම පිළිතුර දෙන්නේ අකුරු 500 කට අඩු පණිවුඩ සදහා පමණි. 🥲'
        )
      } else if (!response.ok) {
        throw new Error(
          'පණිවිඩය යැවීමට අසමත් විය 🤕! කරුණාකර මිනිත්තු කිහිපයකින් නැවත උත්සාහ කරන්න. 🫣'
        )
      }

      return response
    },
  })

  const handleAsk = async ({ input: prompt }) => {
    updateScroll()
    const sendRequest = async (selectedId) => {
      setValue('input', '')

      const promptInSinhala = await translateText(prompt, 'en', 'si')
      prompt = await translateText(prompt, 'si', 'en')
      addMessage(selectedId, {
        role: 'user',
        content: promptInSinhala,
      })

      mutate(prompt, {
        onSuccess: async (response, variable) => {
          const reader = response.body.getReader()
          const decoder = new TextDecoder()

          let messageExist = false
          let fullContent = ''
          while (true) {
            const { done, value } = await reader.read()
            if (done) {
              break
            }

            const decodedText = decoder.decode(value)
            const textLines = decodedText.trim().split('\n\n')
            try {
              const jsonChunks = textLines.map((line) =>
                JSON.parse(line.trim().slice(6))
              )
              let content = ''
              jsonChunks.forEach((jsonChunk) => {
                if (
                  jsonChunk.choices[0].delta &&
                  jsonChunk.choices[0].delta.content
                ) {
                  content += jsonChunk.choices[0].delta.content
                }
              })

              fullContent += content
              const fullContentInSinhala = await translateText(
                fullContent,
                'en',
                'si'
              )
              if (!messageExist) {
                addMessage(selectedId, {
                  role: 'assistant',
                  content: fullContentInSinhala,
                })
                messageExist = true
              } else {
                editLastMessage(selectedId, {
                  role: 'assistant',
                  content: fullContentInSinhala,
                })
              }
            } catch (error) {
              console.log('decodedText', decodedText)
              console.log('textLines', textLines)
              console.log('error', error)
            }
          }
          if (selectedRole == 'නව සංවාදයක්' || selectedRole == undefined) {
            editChat(selectedId, { role: promptInSinhala.slice(0, 15) })
          }
          updateScroll()
        },
        onError(error) {
          addMessage(selectedId, {
            role: 'error',
            content: error.message,
          })
          console.log('unexpected', error)
          updateScroll()
        },
      })
    }

    if (selectedId) {
      if (prompt && !isLoading) {
        sendRequest(selectedId)
      }
    } else {
      addChat(sendRequest)
    }
  }

  return (
    <>
      <Stack width='full' height='full' justifyContent='space-between'>
        <Stack
          maxWidth='768px'
          width='full'
          marginX='auto'
          overflow='auto'
          ref={overflowRef}
        >
          <Stack ref={parentRef} height='full'>
            {hasSelectedChat ? (
              selectedChat.content.map(({ role, content }, key) => {
                const getAvatar = () => {
                  switch (role) {
                    case 'assistant':
                      return gptAvatar
                    case 'error':
                      return warning
                    default:
                      return user
                  }
                }

                const getMessage = () => {
                  if (content.slice(0, 2) == '\n\n') {
                    return content.slice(2, Infinity)
                  }

                  return content
                }

                return (
                  <Stack
                    key={key}
                    direction='row'
                    padding={4}
                    rounded={8}
                    backgroundColor={
                      role == 'assistant' ? 'blackAlpha.200' : 'transparent'
                    }
                    spacing={4}
                  >
                    <Avatar name={role} src={getAvatar()} />
                    <div
                      style={{
                        whiteSpace: 'pre-wrap',
                        marginTop: '.75em !important',
                        overflow: 'hidden',
                      }}
                    >
                      <ReactMarkdown
                        components={{
                          pre: ({ children }) => {
                            const codeRef = useRef(null)
                            const handleCopyClick = (event) => {
                              event.preventDefault()
                              const codeSnippet = codeRef.current.innerText
                              navigator.clipboard.writeText(codeSnippet)
                            }
                            return (
                              <Box bg='black' rounded='md' mb='4'>
                                <Flex
                                  alignItems='center'
                                  justifyContent='space-between'
                                  bg='gray.800'
                                  px='4'
                                  py='2'
                                  fontSize='xs'
                                  fontFamily='sans-serif'
                                  roundedTop='md'
                                  color='gray.200'
                                >
                                  <Text></Text>
                                  <IconButton
                                    onClick={handleCopyClick}
                                    aria-label='copy_to_clipboard'
                                    icon={<RxClipboardCopy />}
                                    backgroundColor='transparent'
                                    display='flex'
                                    ml='auto'
                                    gap='2'
                                  />
                                </Flex>
                                <Box p='4' overflowY='auto'>
                                  <pre ref={codeRef}>{children}</pre>
                                </Box>
                              </Box>
                            )
                          },
                        }}
                        children={getMessage()}
                      />
                    </div>
                  </Stack>
                )
              })
            ) : (
              <Instructions onClick={(text) => setValue('input', text)} />
            )}
          </Stack>
        </Stack>
        <Stack
          padding={4}
          backgroundColor='blackAlpha.400'
          justifyContent='center'
          alignItems='center'
        >
          <Stack maxWidth='768px'>
            <Input
              autoFocus={true}
              variant='filled'
              inputRightAddon={
                <IconButton
                  aria-label='send_button'
                  icon={!isLoading ? <FiSend /> : <Spinner />}
                  backgroundColor='transparent'
                  onClick={handleSubmit(handleAsk)}
                />
              }
              {...register('input')}
              onSubmit={console.log}
              onKeyDown={(e) => {
                if (e.key == 'Enter') {
                  handleAsk({ input: e.currentTarget.value })
                }
              }}
            />
            <Text textAlign='center' fontSize='sm' opacity={0.5}>
              &copy;nimsara66 පර්යේෂණ පෙරදසුන.
              <br />
              එන්න හමුවන්න අපගේ Sinhala Chatbota - ඔබේ පළමු සහ අවසාන සිංහල AI
              සහකරු!
              <br />
              {!isSmallHeightAndWidth &&
                `ඔබේ ගනුදෙනුකරුවන් සමඟ සිංහල භාෂාවෙන් සන්නිවේදනය කර ඔබේ ව්‍යාපාර වර්ධනය වැඩි දියුණු කිරීමට ඔබට අවශ්‍යද? තවත් බලන්න එපා! Sinhala Chatbota උදවු කිරීමට මෙහි පැමිණ ඇත!`}
            </Text>
          </Stack>
        </Stack>
      </Stack>
      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader>Error</AlertDialogHeader>
            <AlertDialogBody>
              මෙම සංවාදය තවදුරටත් නොපවතී. කරුණාකර නව සංවාදයක් සාදන්න.
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose}>
                හරි
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  )
}

//Components
import { ChakraProvider } from '@chakra-ui/react'
import { theme } from '../../styles/theme'
import { QueryClientProvider } from 'react-query'
import { query } from '../../services/query'

export const Providers = ({ children, ...props }) => {
  return (
    <QueryClientProvider client={query}>
      <ChakraProvider theme={theme}>{children}</ChakraProvider>
    </QueryClientProvider>
  )
}

import React from 'react'
import { FileUpload } from './FileUpload'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

export const queryClient = new QueryClient()

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <FileUpload />
    </QueryClientProvider>
  )
}

export default App

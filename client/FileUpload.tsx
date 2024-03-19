import React, { useState } from 'react'
import { Form } from './Form'
import JsonView from '@uiw/react-json-view'
import { FormValues } from './types'
import styled from '@emotion/styled'
import { useMutation } from '@tanstack/react-query'

export function FileUpload() {
  const [loading, setLoading] = useState(false)
  const [response, setResponse] = useState(null)
  const [error, setError] = useState<string | null>(null)

  const mutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const res = await fetch('api/upload', {
        method: 'POST',
        body: formData,
      })
      if (res.status === 200) {
        return res.json()
      } else {
        const text = await res.text()
        throw new Error(text)
      }
    },
    onSuccess: (data) => {
      setResponse(data)
      setLoading(false)
    },
    onError: (error: Error) => {
      setError(error.message)
      setLoading(false)
    },
  })

  const handleSubmit = ({ file, invoicingMonth }: FormValues) => {
    if (!file?.[0]) return

    setResponse(null)
    setError(null)
    setLoading(true)

    const formData = new FormData()
    formData.append('file', file[0])
    formData.append('invoicingMonth', invoicingMonth)

    mutation.mutate(formData)
  }

  return (
    <Container>
      <Form onSubmit={handleSubmit} />
      {loading && <div>Loading...</div>}
      {response && (
        <Response>
          <h2>Response:</h2>
          <JsonView value={response} />
        </Response>
      )}
      {error && (
        <Response error>
          <h2>Error:</h2>
          <p>{error}</p>
        </Response>
      )}
    </Container>
  )
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`

const Response = styled.div<{ error?: boolean }>`
  color: ${({ error }) => (error ? 'red' : 'green')};
`

import React, { useState } from 'react'
import { FileUploadForm } from './FileUploadForm'
import styled from '@emotion/styled'
import JsonView from '@uiw/react-json-view'

export type FormValues = {
  invoicingMonth: string
  file: FileList
}

const App: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const [response, setResponse] = useState(null)

  const handleSubmit = ({ file, invoicingMonth }: FormValues) => {
    if (!file?.[0]) return

    setLoading(true)

    const formData = new FormData()
    formData.append('file', file[0])
    formData.append('invoicingMonth', invoicingMonth)

    fetch('api/upload', {
      method: 'POST',
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => {
        setResponse(data)
        setLoading(false)
      })
      .catch((error) => {
        console.error('Error:', error)
        setLoading(false)
        // Handle errors
      })
  }

  console.log(response)

  return (
    <Container>
      <FileUploadForm onSubmit={handleSubmit} />
      {loading && <div>Loading...</div>}
      {response && (
        <div>
          <h2>Response:</h2>
          <JsonView value={response} />
        </div>
      )}
    </Container>
  )
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`

export default App

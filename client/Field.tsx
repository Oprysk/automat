import React from 'react'
import type { PropsWithChildren } from 'react'
import type { FieldError } from 'react-hook-form'
import styled from '@emotion/styled'

type FieldProps = {
  label?: string
  htmlFor?: string
  error?: FieldError
}

export const Field = ({
  label,
  children,
  htmlFor,
  error,
}: PropsWithChildren<FieldProps>) => {
  return (
    <Container errorState={!!error}>
      {label && <Label htmlFor={htmlFor}>{label}</Label>}
      {children}
      {!!error && <ErrorMessage role="alert">{error.message}</ErrorMessage>}
    </Container>
  )
}

const Container = styled.div<{ errorState: boolean }>`
  display: flex;
  flex-direction: column;
  align-content: flex-start;
  justify-content: flex-start;
  margin: 16px 0;
  padding: 0;
  border: none;
  width: 100%;

  input,
  textarea {
    border-color: ${({ errorState }) => (errorState ? 'red' : '#d9d9d9')};
  }
`

const Label = styled.label`
  margin-bottom: 2px;
`

const ErrorMessage = styled.div`
  color: red;
  font-size: 14px;
`

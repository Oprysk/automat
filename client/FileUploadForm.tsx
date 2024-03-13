import React from 'react'
import styled from '@emotion/styled'
import { SubmitHandler, useForm } from 'react-hook-form'
import { FieldSet } from './FieldSet'
import { Field } from './Field'
import { FormValues } from './App'

const DATE_PATTERN = /\d{4}-\d{2}/

export const FileUploadForm = ({
  onSubmit,
}: {
  onSubmit: SubmitHandler<FormValues>
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>()

  return (
    <Container>
      <h1>Upload file</h1>
      <form onSubmit={handleSubmit(onSubmit)}>
        <FieldSet label="Let's upload your invoice">
          <Field
            label="Invoicing Month (YYYY-MM)"
            error={errors.invoicingMonth}
          >
            <Input
              {...register('invoicingMonth', {
                required: 'Invoicing month is required',
                validate: (value) => {
                  return DATE_PATTERN.test(value) || 'Invalid format'
                },
              })}
              placeholder="2024-03"
              type="text"
              id="invoicingMonth"
            />
          </Field>
          <Field label="File" error={errors.file}>
            <Input
              {...register('file', {
                required: 'File is required',
              })}
              accept=".xls, .xlsx"
              type="file"
              id="file"
            />
          </Field>
        </FieldSet>
        <Field>
          <Button>Save</Button>
        </Field>
      </form>
    </Container>
  )
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  max-width: 700px;
`

const Input = styled.input`
  padding: 10px;
  width: 100%;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
`

const Button = styled.button`
  font-size: 14px;
  cursor: pointer;
  padding: 0.6em 1.2em;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  margin-right: auto;
  background-color: #3b82f6;
  color: white;
`

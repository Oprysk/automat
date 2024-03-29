import React from 'react'
import styled from '@emotion/styled'
import { PropsWithChildren } from 'react'

export const FieldSet = ({
  label,
  children,
}: PropsWithChildren<{ label?: string }>) => {
  return (
    <Container>
      {label && <Legend>{label}</Legend>}
      <Wrapper>{children}</Wrapper>
    </Container>
  )
}

const Container = styled.fieldset`
  margin: 16px 0;
  padding: 0;
  border: none;
`

const Wrapper = styled.div`
  display: flex;
  justify-content: space-between;
  flex-direction: column;
  align-items: self-start;
`

const Legend = styled.legend`
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 10px;
`

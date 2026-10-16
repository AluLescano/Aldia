import { useId } from 'react'

interface Props {
  id?: string
  errorMessage?: string
  subText?: string
}

export function useFieldIds({ id, errorMessage, subText }: Props) {
  const generatedId = useId()
  const fieldId = id || generatedId
  const FieldIds = {
    fieldId,
    describedBy: [(subText || errorMessage) && `${fieldId}-description`]
      .filter(Boolean)
      .join(' '),
  }

  return FieldIds
}

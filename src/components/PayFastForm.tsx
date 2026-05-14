'use client'

import { useRef, useEffect } from 'react'

interface PayFastFormProps {
  params: Record<string, string>
  autoSubmit?: boolean
}

export default function PayFastForm({ params, autoSubmit = false }: PayFastFormProps) {
  const formRef = useRef<HTMLFormElement>(null)
  const { _endpoint, ...fields } = params

  useEffect(() => {
    if (autoSubmit && formRef.current) {
      formRef.current.submit()
    }
  }, [autoSubmit])

  return (
    <form
      ref={formRef}
      action={_endpoint}
      method="POST"
      className="hidden"
      aria-hidden="true"
    >
      {Object.entries(fields).map(([name, value]) => (
        <input key={name} type="hidden" name={name} value={value} />
      ))}
    </form>
  )
}

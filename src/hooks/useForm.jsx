import { useState, useCallback } from "react"

const useForm = (initialValues = {}, validators) => {
  const [values, setValues] = useState(initialValues)
  const setFiledValue = useCallback((name, value) => {
    setValues((values) => ({
      ...values,
      [name]: value
    }))
  }, [setValues, validators])
  return { values, setFiledValue }
}

export default useForm

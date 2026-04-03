import { renderHook, act } from '@testing-library/react'
import { z } from 'zod'
import { useFormValidation } from '@/hooks/useFormValidation'

const schema = z.object({
  email: z.string().email('Invalid email address'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  age: z.number().min(18, 'Must be at least 18'),
})

describe('useFormValidation', () => {
  it('returns true for valid data', () => {
    const { result } = renderHook(() => useFormValidation({ schema }))

    let isValid = false
    act(() => {
      isValid = result.current.validate({ email: 'test@test.com', name: 'Alice', age: 25 })
    })

    expect(isValid).toBe(true)
    expect(result.current.errors).toEqual({})
  })

  it('returns false for invalid data', () => {
    const { result } = renderHook(() => useFormValidation({ schema }))

    let isValid = true
    act(() => {
      isValid = result.current.validate({ email: 'bad', name: '', age: 10 })
    })

    expect(isValid).toBe(false)
  })

  it('populates errors for invalid email', () => {
    const { result } = renderHook(() => useFormValidation({ schema }))

    act(() => {
      result.current.validate({ email: 'not-an-email', name: 'Alice', age: 25 })
    })

    expect(result.current.errors.email).toBe('Invalid email address')
  })

  it('populates errors for short name', () => {
    const { result } = renderHook(() => useFormValidation({ schema }))

    act(() => {
      result.current.validate({ email: 'ok@ok.com', name: 'A', age: 25 })
    })

    expect(result.current.errors.name).toBe('Name must be at least 2 characters')
  })

  it('populates errors for underage', () => {
    const { result } = renderHook(() => useFormValidation({ schema }))

    act(() => {
      result.current.validate({ email: 'ok@ok.com', name: 'Alice', age: 10 })
    })

    expect(result.current.errors.age).toBe('Must be at least 18')
  })

  it('populates multiple errors simultaneously', () => {
    const { result } = renderHook(() => useFormValidation({ schema }))

    act(() => {
      result.current.validate({ email: 'bad', name: 'A', age: 5 })
    })

    expect(Object.keys(result.current.errors)).toHaveLength(3)
    expect(result.current.errors.email).toBeDefined()
    expect(result.current.errors.name).toBeDefined()
    expect(result.current.errors.age).toBeDefined()
  })

  it('clears errors when valid data is submitted after invalid', () => {
    const { result } = renderHook(() => useFormValidation({ schema }))

    act(() => {
      result.current.validate({ email: 'bad', name: '', age: 0 })
    })
    expect(Object.keys(result.current.errors).length).toBeGreaterThan(0)

    act(() => {
      result.current.validate({ email: 'ok@ok.com', name: 'Alice', age: 25 })
    })
    expect(result.current.errors).toEqual({})
  })

  it('clearErrors resets all errors', () => {
    const { result } = renderHook(() => useFormValidation({ schema }))

    act(() => {
      result.current.validate({ email: 'bad', name: '', age: 0 })
    })
    expect(Object.keys(result.current.errors).length).toBeGreaterThan(0)

    act(() => {
      result.current.clearErrors()
    })
    expect(result.current.errors).toEqual({})
  })
})

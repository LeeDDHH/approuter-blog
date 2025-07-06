import { renderHook } from '@testing-library/react'
import { useDaysAgo } from '../useDaysAgo'

describe('useDaysAgo', () => {
  beforeEach(() => {
    jest.useFakeTimers()
    jest.setSystemTime(new Date('2024-01-15'))
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('should return 0 for today', () => {
    const { result } = renderHook(() => useDaysAgo('2024-01-15'))
    expect(result.current).toBe('1分前')
  })

  it('should return 1 for yesterday', () => {
    const { result } = renderHook(() => useDaysAgo('2024-01-14'))
    expect(result.current).toBe('1日前')
  })

  it('should return 7 for a week ago', () => {
    const { result } = renderHook(() => useDaysAgo('2024-01-08'))
    expect(result.current).toBe('7日前')
  })

  it('should handle ISO date strings', () => {
    const { result } = renderHook(() => useDaysAgo('2024-01-10T00:00:00Z'))
    expect(result.current).toBe('5日前')
  })

  it('should handle future dates', () => {
    const { result } = renderHook(() => useDaysAgo('2024-01-20'))
    expect(result.current).toBe('1分前')
  })
})
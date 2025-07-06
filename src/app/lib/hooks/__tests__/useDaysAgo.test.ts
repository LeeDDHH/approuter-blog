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

  it('当日の同時間の場合', () => {
    const { result } = renderHook(() => useDaysAgo('2024-01-15'))
    expect(result.current).toBe('1分前')
  })

  it('前日の場合', () => {
    const { result } = renderHook(() => useDaysAgo('2024-01-14'))
    expect(result.current).toBe('1日前')
  })

  it('1週間前の場合', () => {
    const { result } = renderHook(() => useDaysAgo('2024-01-08'))
    expect(result.current).toBe('7日前')
  })

  it('ISO日付データの文字列の場合', () => {
    const { result } = renderHook(() => useDaysAgo('2024-01-10T00:00:00Z'))
    expect(result.current).toBe('5日前')
  })

  it('未来の時間の場合', () => {
    const { result } = renderHook(() => useDaysAgo('2024-01-20'))
    expect(result.current).toBe('1分前')
  })
})
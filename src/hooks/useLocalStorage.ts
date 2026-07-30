import { useEffect, useState } from 'react'

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = window.localStorage.getItem(key)
      return raw ? (JSON.parse(raw) as T) : initialValue
    } catch (error) {
      console.error(`localStorage 키(${key})를 읽는 중 오류가 발생했습니다.`, error)
      return initialValue
    }
  })

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.error(`localStorage 키(${key})에 저장하는 중 오류가 발생했습니다.`, error)
    }
  }, [key, value])

  return [value, setValue] as const
}

import { animate } from 'gitart-animate-number'

export const useAnimateNumber = (onChangeValue: (value: number) => void) => {
  let value = 0
  let stopFn: (null | (() => void)) = null

  const setSmoothly = (to: number, from?: number) => {
    stopFn?.()

    if (from)
      value = from

    stopFn = animate({
      duration: 400,
      from: value,
      to,
      on: (current) => {
        value = current
        onChangeValue(current)
      },
    })
  }

  const setImmediately = (to: number) => {
    value = to
    onChangeValue(to)
  }

  return {
    setSmoothly,
    setImmediately,
  }
}

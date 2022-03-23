import { ref } from 'vue'

export function useIt() {
  const it = ref(true)

  return {
    it,
  }
}

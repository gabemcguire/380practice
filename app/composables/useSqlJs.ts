import { ref } from 'vue'

export function useSqlJs() {
  const SQL = ref(null)
  const isLoading = ref(true)
  const error = ref(null)

  async function initSqlJs() {
    if (SQL.value) return SQL.value

    try {
      isLoading.value = true
      const initSqlJsModule = await import('sql.js')
      const sqlWasm = await fetch('/sql-wasm.wasm').then(res => res.arrayBuffer())
      SQL.value = await initSqlJsModule.default({
        locateFile: () => '/sql-wasm.wasm'
      })
      isLoading.value = false
      return SQL.value
    } catch (e) {
      error.value = e
      isLoading.value = false
      console.error('Failed to load SQL.js', e)
    }
  }

  return {
    SQL,
    initSqlJs,
    isLoading,
    error
  }
}

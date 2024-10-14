// plugins/initDatabase.ts
import { defineNuxtPlugin } from '#app'
import { useQuestionStore } from '~/stores/questionStore'

export default defineNuxtPlugin(async (nuxtApp) => {
  console.log('initializing DATABSE IN PLUGIN')
  const questionStore = useQuestionStore(nuxtApp.$pinia)
  await questionStore.initDatabase()
})

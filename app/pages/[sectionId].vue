<!-- pages/[sectionId].vue -->
<template>
  <div>
    <Question />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuestionStore } from '~/stores/questionStore'
import Question from '~/components/Question.vue'

const route = useRoute()
const router = useRouter()
const store = useQuestionStore()

onMounted(() => {
  const sectionId = route.params.sectionId as string
  store.initDatabase()
  store.selectSection(sectionId)
  if (!store.selectedSection) {
    // If section not found, redirect or handle error
    router.push('/')
  }
})
</script>

<!-- components/SectionSelector.vue -->
<template>
  <div class="w-full max-w-6xl mx-auto">
    <h2 class="text-2xl font-bold mb-6">Select a Topic</h2>
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4 gap-y-6">
      <Card 
        v-for="section in topicSections" 
        :key="section.id"
        class="w-full cursor-pointer hover:shadow-md hover:scale-105 transition-all duration-200 flex flex-col"
        @click="selectSection(section.id)"
      >
        <CardHeader class="pb-2">
          <div class="flex justify-between items-center">
            <CardTitle class="text-xl">{{ section.title }}</CardTitle>
            <Badge :class="[difficultyColors[section.difficulty], 'text-white']" class="p-1">
              {{ section.difficulty }}
            </Badge>
          </div>
        </CardHeader>
        <CardContent class="flex-grow flex flex-col justify-between">
          <p class="text-sm text-gray-600 mb-4">{{ section.description }}</p>
          <div class="flex justify-between items-center mt-auto">
            <span class="text-sm">{{ section.completedQuestions || '-' }} / {{ section.questions.length }} completed</span>
            <Progress :value="(section.completedQuestions / section.totalQuestions) * 100" class="w-1/2" />
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from '#app'
import { useQuestionStore } from '~/stores/questionStore'
import type { Section } from '~/types'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'

const router = useRouter()
const store = useQuestionStore()

const topicSections = computed<Section[]>(() =>
  store.sections.filter(section => section.type === 'topic')
)

const selectSection = (sectionId: string) => {
  router.push(`/quiz/${sectionId}`)
}

const difficultyColors = {
  Easy: 'bg-green-500',
  Medium: 'bg-yellow-500',
  Hard: 'bg-red-500'
}
</script>

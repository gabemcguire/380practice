<!-- components/SectionSelector.vue -->
<template>
  <div class="w-full max-w-6xl mx-auto">
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-2xl font-bold">Select a Topic</h2>
      <Button @click="shuffleSections" variant="outline"> 
        <Icon name="radix-icons:shuffle" class="mr-2 h-4 w-4" />
        Shuffle
      </Button>
    </div>
    <div v-if="loading">
      <p>Loading topics...</p>
    </div>
    <TransitionGroup 
      v-else 
      name="shuffle-list" 
      tag="div" 
      class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4 gap-y-6"
    >
      <Card 
        v-for="section in shuffledSections" 
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
            <Progress :model-value="(section.completedQuestions / section.totalQuestions) * 100" class="w-1/2" />
          </div>
        </CardContent>
      </Card>
    </TransitionGroup>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRouter } from '#app'
import { useQuestionStore } from '~/stores/questionStore'
import type { Section } from '~/types'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'

const router = useRouter()
const store = useQuestionStore()
const loading = ref(true)

const topicSections = computed(() =>
  store.sectionsWithProgress.filter(section => section.type === 'topic')
)

const shuffledSections = ref<Section[]>([])

// Function to save shuffled order to local storage
const saveShuffledOrder = (sections: Section[]) => {
  const orderIds = sections.map(section => section.id)
  localStorage.setItem('shuffledSectionsOrder', JSON.stringify(orderIds))
}

// Function to load shuffled order from local storage
const loadShuffledOrder = (): string[] | null => {
  const savedOrder = localStorage.getItem('shuffledSectionsOrder')
  return savedOrder ? JSON.parse(savedOrder) : null
}

// Function to apply saved order or default to topicSections
const applyShuffledOrder = () => {
  const savedOrder = loadShuffledOrder()
  if (savedOrder) {
    const orderedSections = savedOrder
      .map(id => topicSections.value.find(section => section.id === id))
      .filter(Boolean) as Section[]
    
    // Add any new sections that weren't in the saved order
    const newSections = topicSections.value.filter(section => !savedOrder.includes(section.id))
    shuffledSections.value = [...orderedSections, ...newSections]
  } else {
    shuffledSections.value = [...topicSections.value]
  }
}

// Shuffle function
const shuffleSections = () => {
  shuffledSections.value = [...shuffledSections.value].sort(() => Math.random() - 0.5)
  saveShuffledOrder(shuffledSections.value)
}

// Watch for changes in topicSections and reapply order
watch(topicSections, () => {
  applyShuffledOrder()
}, { deep: true })

onMounted(() => {
  if (store.sections.length > 0) {
    loading.value = false
    applyShuffledOrder()
  }
  
  store.$subscribe(() => {
    if (store.sections.length > 0) {
      loading.value = false
      applyShuffledOrder()
    }
  })
})

const selectSection = (sectionId: string) => {
  router.push(`/quiz/${sectionId}`)
}

const difficultyColors = {
  Easy: 'bg-green-500',
  Medium: 'bg-yellow-500',
  Hard: 'bg-red-500'
}
</script>

<style scoped>
.shuffle-list-move {
  transition: transform 0.5s cubic-bezier(0.0, 1.1, 0.76, 0.97);
}
</style>

<!-- components/SectionSelector.vue -->
<template>
  <div class="w-full max-w-6xl mx-auto px-4">

    <!-- Recently Added Section -->
    <section v-if="newTopicSections.length > 0" class="mb-12">
      <h2 class="text-2xl font-semibold text-amber-500 mb-4">
        Recently Added
      </h2>
      <div class="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-3 xl:grid-cols-3 gap-4 gap-y-6">
        <Card 
          v-for="section in newTopicSections" 
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
      </div>
    </section>

    <!-- All Topics Section -->
    <section>
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-2xl font-bold">All Topics</h2>
        <div class="flex gap-4">
          <Button @click="toggleGrouping" variant="outline" class="gap-2">
            <Icon :name="isGrouped ? 'lucide:list' : 'lucide:layout-grid'" class="h-4 w-4" />
            {{ isGrouped ? 'List View' : 'Grid View' }}
          </Button>
          <Button @click="handleShuffle" variant="outline" class="gap-2"> 
            <Icon name="lucide:shuffle" class="h-4 w-4" />
            Shuffle
          </Button>
        </div>
      </div>

      <div v-if="loading" class="flex justify-center items-center p-12">
        <span class="loading loading-spinner loading-lg"></span>
      </div>

      <!-- Grouped View -->
      <div v-else-if="isGrouped" class="space-y-8">
        <div v-for="(group, groupName) in groupedSections" :key="groupName" class="space-y-4">
          <h3 class="text-xl font-semibold capitalize">{{ groupName }}</h3>
          <TransitionGroup 
            name="shuffle-list" 
            tag="div" 
            class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4"
          >
            <Card 
              v-for="section in group" 
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
      </div>

      <TransitionGroup 
        v-else
        name="shuffle-list" 
        tag="div" 
        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4 gap-y-6"
      >
        <Card 
          v-for="section in displayedSections" 
          :key="section.id"
          class="w-full cursor-pointer hover:shadow-md hover:scale-105 h-24 transition-all duration-200 flex flex-col"
          @click="selectSection(section.id)"
        >
          <CardHeader class="pb-1">
            <div class="flex justify-between items-center gap-2">
              <CardTitle class="text-md truncate max-w-[70%]" :title="section.title">
                {{ section.title }}
              </CardTitle>
              <Badge 
                :class="[difficultyColors[section.difficulty], 'text-white shrink-0']" 
                class="p-1"
              >
                {{ section.difficulty }}
              </Badge>
            </div>
          </CardHeader>
          <CardContent class="flex-grow flex flex-col justify-between">
            <div class="flex justify-between items-center mt-auto">
              <span class="text-sm shrink-0">{{ section.completedQuestions || '-' }} / {{ section.questions.length }} completed</span>
              <Progress :model-value="(section.completedQuestions / section.totalQuestions) * 100" class="w-1/2" />
            </div>
          </CardContent>
        </Card>
      </TransitionGroup>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter } from '#app'
import { useQuestionStore } from '~/stores/questionStore'
import type { Section } from '~/types'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

const router = useRouter()
const store = useQuestionStore()
const loading = ref(true)
const isGrouped = ref(true)
const shuffledOrder = ref<Section[]>([])

// Computed property for sections to display
const displayedSections = computed(() => {
  return shuffledOrder.value.length > 0 ? shuffledOrder.value : topicSections.value
})

const topicSections = computed(() =>
  store.sectionsWithProgress.filter(section => section.type === 'topic')
)

const newTopicSections = computed(() =>
  store.sectionsWithProgress.filter(section => section.type === 'new-topic')
)

// Group sections by category
const groupedSections = computed(() => {
  const groups: Record<string, Section[]> = {
    'SQL': [],
    'Security': [],
    'Optimization': [],
    'Docker & Containers': [],
    'Entity Relationships': [],
    'Cloud Computing': [],
    'Other': []
  }
  
  // Use displayedSections instead of topicSections for grouped view
  displayedSections.value.forEach(section => {
    const title = section.title.toLowerCase()
    
    if (title.includes('entity') || title.includes('erd')) {
      groups['Entity Relationships'].push(section)
    } else if (title.includes('sql') || title.includes('join') || title.includes('key') || title.includes('group') || title.includes('having')) {
      groups['SQL'].push(section)
    } else if (title.includes('security') || title.includes('jwt')) {
      groups['Security'].push(section)
    } else if (title.includes('optimization') || title.includes('performance')) {
      groups['Optimization'].push(section)
    } else if (title.includes('container') || title.includes('docker') || title.includes('build files')) {
      groups['Docker & Containers'].push(section)
    } else if (title.includes('cloud') || title.includes('saas') || 
               title.includes('paas') || title.includes('iaas') ||
               title.includes('virtual server')) {
      groups['Cloud Computing'].push(section)
    } else {
      groups['Other'].push(section)
    }
  })

  // Remove empty groups
  return Object.fromEntries(
    Object.entries(groups).filter(([_, sections]) => sections.length > 0)
  )
})

const toggleGrouping = () => {
  isGrouped.value = !isGrouped.value
  localStorage.setItem('sectionViewPreference', isGrouped.value ? 'grouped' : 'grid')
}

// Fisher-Yates shuffle algorithm
const shuffleArray = <T>(array: T[]): T[] => {
  const newArray = [...array]
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]]
  }
  return newArray
}

// Handle shuffle button click
const handleShuffle = () => {
  shuffledOrder.value = shuffleArray(topicSections.value)
  saveShuffledOrder()
}

// Save shuffled order to localStorage
const saveShuffledOrder = () => {
  const orderIds = shuffledOrder.value.map(section => section.id)
  localStorage.setItem('shuffledSectionsOrder', JSON.stringify(orderIds))
}

// Load shuffled order from localStorage
const loadShuffledOrder = () => {
  const savedOrder = localStorage.getItem('shuffledSectionsOrder')
  if (savedOrder) {
    const orderIds = JSON.parse(savedOrder)
    shuffledOrder.value = orderIds
      .map(id => topicSections.value.find(section => section.id === id))
      .filter((section): section is Section => section !== undefined)
    
    // Add any new sections that weren't in the saved order
    const newSections = topicSections.value.filter(
      section => !orderIds.includes(section.id)
    )
    shuffledOrder.value = [...shuffledOrder.value, ...newSections]
  } else {
    shuffledOrder.value = [...topicSections.value]
  }
}

onMounted(() => {
  // Load view preference
  const viewPreference = localStorage.getItem('sectionViewPreference')
  if (viewPreference) {
    isGrouped.value = viewPreference === 'grouped'
  }

  // Initialize sections
  if (store.sections.length > 0) {
    loading.value = false
    loadShuffledOrder()
  }
  
  // Subscribe to store changes
  store.$subscribe(() => {
    if (store.sections.length > 0) {
      loading.value = false
      loadShuffledOrder()
    }
  })
})

// Watch for changes in topicSections
watch(topicSections, () => {
  loadShuffledOrder()
}, { deep: true })

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

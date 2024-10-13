<!-- pages/quiz/[id].vue -->
<template>
  <div class="container mx-auto px-4 py-8 max-w-2xl">
    <h1 class="text-3xl font-bold mb-6">{{ store.selectedSection?.title }}</h1>
    <!-- Quiz in Progress -->
    <div v-if="!quizCompleted">
      <!-- Display Current Question -->
      <div class="mt-4 mb-2">
        <div class="w-full bg-gray-200 rounded-full h-2.5">
          <div 
            class="bg-emerald-600 h-2.5 mb-1 rounded-full" 
            :style="{ width: progress + '%' }"
          ></div>
        </div>
      </div>
      <Question 
        class="mt-2"
        :question="store.currentQuestion" 
        @answer="handleAnswer"
      />
      
      <!-- Display Feedback -->
      <Feedback
        v-if="showFeedback"
        :isCorrect="isCorrect"
        :explanation="currentExplanation"
        @next="nextQuestion"
      />
    </div>
    
    <!-- Quiz Completed -->
    <div v-else class="text-center">
      <p class="text-xl mb-4">You've completed all questions!</p>
      <p class="text-lg mb-4">Your score: {{ store.score }} / {{ store.totalQuestions }}</p>
      <Button @click="goToHome" class="bg-emerald-600 hover:bg-emerald-500">Back to Topics</Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from '#app'
import { useQuestionStore } from '~/stores/questionStore'
import Question from '~/components/Question.vue'
import Feedback from '~/components/Feedback.vue'
import { Button } from '@/components/ui/button'

const route = useRoute()
const router = useRouter()
const store = useQuestionStore()

const showFeedback = ref(false)
const isCorrect = ref(false)
const currentExplanation = ref('')

// Compute if the quiz is completed
const quizCompleted = computed(() => store.isQuizCompleted)

// Compute progress
const progress = computed(() => store.progress)

// Handle user's answer
const handleAnswer = async (answer: string) => {
  // Await the submission to ensure state is updated
  await store.submitAnswer(answer)
  console.log('correct? ', store.isCorrect); 
  // Determine if the answer is correct
  const correct = store.isCorrect // Update the store to track correctness
  isCorrect.value = correct
  currentExplanation.value = store.currentQuestion?.explanation || ''
  
  showFeedback.value = true
}

// Proceed to the next question
const nextQuestion = () => {  
  showFeedback.value = false
  store.nextQuestion()
}

// Go back to home page
const goToHome = () => {
  store.reset()
  router.push('/')
}

// Load the section when the component is mounted
onMounted(async () => {
  const sectionId = route.params.id as string
  await store.loadProgress() // Load saved progress
  
  // If there's no saved progress or the saved section doesn't match the current route, select the new section
  if (!store.selectedSection || store.selectedSection.id !== sectionId) {
    store.selectSection(sectionId)
  }
})
</script>

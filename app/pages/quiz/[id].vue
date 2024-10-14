<!-- pages/quiz/[id].vue -->
<template>
  <div class="container mx-auto px-4 py-8 max-w-2xl">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold">{{ store.selectedSection?.title }}</h1>
      
      <!-- Restart Button -->
      <Button 
        @click="restartQuiz" 
        variant="outline" 
      >
        Restart Quiz
      </Button>
    </div>
    
    <!-- Quiz in Progress -->
    <div v-if="!quizCompleted">
      <!-- Progress Bar and Navigation Buttons -->
      <div class="flex justify-between items-center mb-4">
        <!-- Progress Bar -->
        <div class="w-full bg-gray-200 rounded-full h-2.5 mr-4">
          <div 
            class="bg-emerald-600 h-2.5 mb-1 rounded-full" 
            :style="{ width: progress + '%' }"
          ></div>
        </div>

        <!-- Navigation Buttons -->
        <div class="flex hidden space-x-2">
          <!-- Back Button -->
          <Button 
            v-if="canGoBack" 
            class="hidden"
            @click="goBack" 
            variant='outline'
          >
            Back
          </Button>
        </div>
      </div>
      
      <!-- Display Current Question -->
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
      
      <div class="text-6xl font-bold text-emerald-500 mb-2">{{ percentageScore }}%</div>
      <p class="text-md text-secondary hidden font-light mb-4">{{ store.score }} / {{ store.totalQuestions }}</p>
      <div class="flex justify-center space-x-4 mt-4 mb-8">
        <div class="text-center">
          <div class="text-3xl font-bold text-emerald-500">{{ store.score }}</div>
          <p class="text-sm text-gray-500">Correct</p>
        </div>
        <div class="text-center">
          <div class="text-3xl font-bold text-red-500">{{ store.totalQuestions - store.score }}</div>
          <p class="text-sm text-gray-500">Incorrect</p>
        </div>
      </div>
      <Button 
        @click="goToHome" 
        class="bg-emerald-600 text-white hover:bg-emerald-500"
      >
        Back to Topics
      </Button>
      <p class="text-xl my-4">or</p>
      <Button 
        @click="restartQuiz" 
        variant="outline" 
      >
        Restart Quiz
      </Button>
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

// Determine if the "Back" button should be shown
const canGoBack = computed(() => store.currentQuestionIndex > 0)

const percentageScore = computed(() => {
  return Math.round((store.score / store.totalQuestions) * 100)
})
// Handle user's answer
const handleAnswer = async (answer: string) => {
  // Await the submission to ensure state is updated
  console.log('Submitting answer:', answer)
  await store.submitAnswer(answer)
  console.log('Is correct?', store.isCorrect)
  
  // Determine if the answer is correct
  isCorrect.value = store.isCorrect
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

// Restart the current quiz
const restartQuiz = async () => {
  if (!store.selectedSection) return
  const confirmRestart = confirm('Are you sure you want to restart the quiz? Your current progress will be lost.')
  if (!confirmRestart) return

  await store.restartSection(store.selectedSection.id)
  await store.selectSection(store.selectedSection.id)

  console.log('After restartSection and selectSection:')
  console.log('currentQuestionIndex:', store.currentQuestionIndex)
  console.log('userAnswers:', store.userAnswers)
  console.log('score:', store.score)
  console.log('isCorrect:', store.isCorrect)

  showFeedback.value = false
}

// Navigate to the previous question
const goBack = () => {
  if (store.currentQuestionIndex > 0) {
    store.currentQuestionIndex--
    showFeedback.value = false
    console.log('Went back to question index:', store.currentQuestionIndex)
    // Optionally, update the score if navigating back affects it
    // For simplicity, we'll not decrement the score here
  }
}

// Load the section when the component is mounted
onMounted(async () => {
  const sectionId = route.params.id as string
  //await store.loadProgress() // Load saved progress
  
  // If there's no saved progress or the saved section doesn't match the current route, select the new section
  if (!store.selectedSection || store.selectedSection.id !== sectionId) {
    await store.selectSection(sectionId)
  }

  console.log('OnMounted - currentQuestionIndex:', store.currentQuestionIndex)
  console.log('OnMounted - userAnswers:', store.userAnswers)
  console.log('OnMounted - score:', store.score)
  console.log('OnMounted - isCorrect:', store.isCorrect)
})
</script>

<style scoped>
/* Add any component-specific styles here */
</style>

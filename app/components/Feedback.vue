<!-- components/Feedback.vue -->
<template>
  <div :class="['feedback', isCorrect ? 'correct' : 'incorrect']">
    <p v-if="isCorrect" class="success">Correct!</p>
    <p v-else class="error">Incorrect.</p>
    <p>Explanation: {{ explanation }}</p>
    <button :class="[ isCorrect ? 'correct-button' : 'incorrect-button']" @click="nextQuestion" class="">Next Question</button>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue'

const props = defineProps<{
  isCorrect: boolean
  explanation: string
}>()

const emit = defineEmits(['next'])

const nextQuestion = () => {
  emit('next')
}
</script>

<style scoped>
.feedback {
  margin-top: 1rem;
  padding: 1rem;
  border-radius: 0.5rem;
}
.correct {
  background-color: #059669;
  color: #022c22;
}
.incorrect {
  background-color: #e11d48;
  color: #4c0519;
}
.success,
.error {
  font-weight: bold;
}
.correct-button {
  margin-top: 1rem;
  padding: 0.5rem 1rem;
  background-color: #a7f3d0;
  border: none;
  border-radius: 0.375rem;
  cursor: pointer;
}
.shadcn-button:hover {
  background-color: #6ee7b7;
}

.incorrect-button {
  margin-top: 1rem;
  padding: 0.5rem 1rem;
  background-color: #fecdd3;
  border: none;
  border-radius: 0.375rem;
  cursor: pointer;
}
</style>

<!-- components/Question.vue -->
<template>
  <SQLQuestion
    v-if="isSQLQuestion"
    :question="question as SQLQuestion"
    @answer="handleAnswer"
  />
  <Card v-else-if="question" class="w-full max-w-2xl mx-auto">
    <CardHeader>
      <CardTitle>Question {{ currentQuestionNumber }} of {{ totalQuestions }}</CardTitle>
      <CardDescription class="text-md">{{ question.question }}</CardDescription>
    </CardHeader>
    <CardContent>
      <div v-if="question.image">
        <img :src="question.image" alt="Question Image" class="mt-4 mb-2 " />
      </div>
      <RadioGroup v-model="selectedOption">
        <div v-for="option in question.options" :key="option" class="flex my-1 items-center space-x-2">
          <RadioGroupItem :value="option" :id="option" />
          <label :for="option" class="text-md font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            {{ option }}
          </label>
        </div>
      </RadioGroup>
    </CardContent>
    <CardFooter>
      <Button class="bg-emerald-500" @click="submit" :disabled="!selectedOption || submitted ">Submit</Button>
    </CardFooter>
  </Card>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { defineProps, defineEmits } from 'vue'
import type { Question } from '~/types'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import SQLQuestion from './SQLQuestion.vue'

const props = defineProps<{
  question: Question | SQLQuestion | null
}>()

const emit = defineEmits(['answer'])

const question = computed(() => props.question)

const store = useQuestionStore()

const currentQuestionNumber = computed(() => store.currentQuestionIndex + 1)
const totalQuestions = computed(() => store.totalQuestions)

const selectedOption = ref<string>('')
const submitted = ref<boolean>(false);

const isSQLQuestion = computed(() => {
  return props.question && 'initialData' in props.question
})

const handleAnswer = (answer: string) => {
  emit('answer', answer)
}
const submit = () => {
  if (!selectedOption.value) return
  //revisit
  //submitted.value = true;
  emit('answer', selectedOption.value)
}
</script>


<!-- pages/progress.vue -->
<template>
  <div class="container mx-auto px-4 py-8">
    <div class="flex justify-between">
      <h1 class="text-3xl font-bold mb-6">Your Progress</h1>
      <UseClient>
      <Popover>
          <PopoverTrigger as-child>
            <Button @click="deleteProgress" variant="outline">
              Delete Progress
            </Button>
          </PopoverTrigger>
          <PopoverContent class="w-80">
            <div class="grid gap-4">
              <div class="space-y-2">
                <h4 class="font-medium leading-none">
                  Are you sure?
                </h4>
                <p class="text-sm text-muted-foreground">
                  This will delete all of your saved progress.
                </p>
                <div class="flex justify-between">
                  <Button variant="outline">Cancel</Button>
                  <Button class="bg-rose-700">Delete Progress</Button>
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </UseClient>
    </div>
    <!-- Module Progress -->
    <Card class="mb-8">
      <CardHeader>
        <CardTitle>Module Progress</CardTitle>
      </CardHeader>
      <CardContent>
        <div v-for="module in modules" :key="module.id" class="mb-4">
          <h3 class="text-xl font-semibold mb-2">{{ module.title }}</h3>
          <Progress :value="module.progress" class="w-full" />
          <p class="mt-1 text-sm text-muted-foreground">
            {{ module.completedQuestions }} / {{ module.totalQuestions }} questions completed
          </p>
        </div>
      </CardContent>
    </Card>

    <!-- Challenge Progress -->
    <Card>
      <CardHeader>
        <CardTitle>Challenge Progress</CardTitle>
      </CardHeader>
      <CardContent>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card v-for="challenge in challenges" :key="challenge.id" class="bg-background">
            <CardHeader>
              <CardTitle>{{ challenge.title }}</CardTitle>
            </CardHeader>
            <CardContent>
              <Badge :variant="challenge.completed ? 'default' : 'secondary'">
                {{ challenge.completed ? 'Completed' : 'Incomplete' }}
              </Badge>
              <p class="mt-2 text-sm text-muted-foreground">
                Difficulty: {{ challenge.difficulty }}
              </p>
            </CardContent>
            <CardFooter>
              <NuxtLink :to="`/challenge/${challenge.id}`">
                <Button variant="outline">Go to Challenge</Button>
              </NuxtLink>
            </CardFooter>
          </Card>
        </div>
      </CardContent>
    </Card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { useQuestionStore } from '~/stores/questionStore'
const store = useQuestionStore()

const deleteProgress = () => {
  console.log('delete progress')
}
// Mock data - replace with actual data fetching logic
const modules = ref([
  { id: 1, title: 'SQL Basics', progress: 75, completedQuestions: 15, totalQuestions: 20 },
  { id: 2, title: 'Advanced Queries', progress: 50, completedQuestions: 5, totalQuestions: 10 },
  { id: 3, title: 'Database Design', progress: 30, completedQuestions: 3, totalQuestions: 10 },
])

const challenges = ref([
  { id: 1, title: 'Optimize Complex Query', completed: true, difficulty: 'Hard' },
  { id: 2, title: 'Data Modeling Challenge', completed: false, difficulty: 'Medium' },
  { id: 3, title: 'Performance Tuning', completed: false, difficulty: 'Expert' },
])
</script>

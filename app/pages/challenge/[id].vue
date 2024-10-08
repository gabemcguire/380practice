<!-- pages/challenge/[id].vue -->
<template>
  <div class="container mx-auto px-4 py-8">
    <NuxtLink to="/challenges">
      <Button variant="outline" class="mb-6">Back to Challenges </Button>
    </NuxtLink>
    <h1 class="text-3xl font-bold mb-6">{{ challenge.title }}</h1>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- Markdown Instructions -->
      <Card class="h-full">
        <CardHeader>
          <CardTitle>Instructions</CardTitle>
        </CardHeader>
        <CardContent>
          <div class="markdown" v-html="renderedInstructions"></div>
        </CardContent>
      </Card>

      <!-- SQL Editor -->
      <Card class="h-full">
        <CardHeader>
          <CardTitle>SQL Editor</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            v-model="userQuery"
            class="w-full h-100 p-2 border rounded"
            placeholder="Enter your SQL query here"
          ></Textarea>
          <Button @click="runQuery" class="mt-4 bg-emerald-600 hover:bg-emerald-500">
            Run Query
          </Button>
        </CardContent>
      </Card>
    </div>

    <!-- Query Result -->
    <Card v-if="queryResult" class="mt-6">
      <CardHeader>
        <CardTitle>Query Result</CardTitle>
      </CardHeader>
      <CardContent>
        <div v-if="queryResult.error" class="text-red-500">
          {{ queryResult.error }}
        </div>
        <table v-else class="w-full border-collapse">
          <thead>
            <tr>
              <th v-for="column in queryResult.columns" :key="column" class="border p-2">{{ column }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, index) in queryResult.values" :key="index">
              <td v-for="(cell, cellIndex) in row" :key="cellIndex" class="border p-2">{{ cell }}</td>
            </tr>
          </tbody>
        </table>
      </CardContent>
    </Card>

    <!-- Feedback -->
    <Card v-if="showFeedback" class="mt-6">
      <CardHeader>
        <CardTitle>Feedback</CardTitle>
      </CardHeader>
      <CardContent>
        <p v-if="isCorrect" class="text-green-600">Correct! Well done!</p>
        <p v-else class="text-red-600">Not quite right. Try again!</p>
        <p class="mt-2">{{ challenge.explanation }}</p>
      </CardContent>
      <CardFooter>
        <Button @click="nextChallenge" class="bg-emerald-600 hover:bg-emerald-500">
          Next Challenge
        </Button>
      </CardFooter>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from '#app'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import initSqlJs from 'sql.js'
import { marked } from 'marked'
import challengesData from '~/data/challenges.json'

const route = useRoute()
const router = useRouter()

const challenge = ref({})
const userQuery = ref('')
const queryResult = ref(null)
const showFeedback = ref(false)
const isCorrect = ref(false)
const db = ref(null)

const renderedInstructions = computed(() => {
  return challenge.value.instructions ? marked(challenge.value.instructions) : ''
})

onMounted(async () => {
  const challengeId = route.params.id
  await loadChallenge(challengeId)
  await initializeDatabase()
})

function loadChallenge(challengeId) {
  const foundChallenge = challengesData.all.find(c => c.id === challengeId)
  if (foundChallenge) {
    challenge.value = foundChallenge
  } else {
    console.error('Challenge not found')
    // Handle the error, maybe redirect to a 404 page
  }
}

async function initializeDatabase() {
  const SQL = await initSqlJs({
    locateFile: file => `/sql-wasm.wasm`
  })
  db.value = new SQL.Database()
  
  if (challenge.value.initialData) {
    const sqlScript = challenge.value.initialData.join('\n')
    db.value.exec(sqlScript)
  }
}

const runQuery = () => {
  if (!userQuery.value || !db.value) return

  try {
    const result = db.value.exec(userQuery.value)
    queryResult.value = result.length > 0 ? result[0] : { columns: [], values: [] }
    checkAnswer()
  } catch (error) {
    queryResult.value = { error: error.message }
  }
}

const checkAnswer = () => {
  if (!challenge.value.expectedResult || !db.value) return

  try {
    const expectedResult = db.value.exec(challenge.value.expectedResult)
    isCorrect.value = JSON.stringify(queryResult.value) === JSON.stringify(expectedResult[0])
    showFeedback.value = true
  } catch (error) {
    console.error("Error in checkAnswer:", error)
    isCorrect.value = false
    showFeedback.value = true
  }
}

const nextChallenge = () => {
  // In a real application, you would navigate to the next challenge
  // For now, we'll just reset the current challenge
  userQuery.value = ''
  queryResult.value = null
  showFeedback.value = false
  isCorrect.value = false
}
</script>
<style scoped>
::v-deep .markdown h1 {
  @apply text-3xl font-bold mb-4;
}

::v-deep .markdown h2 {
  @apply text-2xl font-semibold mb-3;
}

::v-deep .markdown h3 {
  @apply text-xl font-semibold mb-2;
}

::v-deep .markdown p {
  @apply mb-2;
}

::v-deep .markdown ul {
  @apply list-disc list-inside mb-2;
}

::v-deep .markdown ol {
  @apply list-decimal list-inside mb-2;
}

::v-deep .markdown li {
  @apply mb-1;
}

::v-deep .markdown blockquote {
  @apply border-l-4 border-gray-300 pl-4 italic text-gray-600 mb-4;
}

::v-deep .markdown code {
  @apply bg-gray-100 p-1 rounded text-sm;
}

::v-deep .markdown pre {
  @apply bg-gray-100 p-4 rounded overflow-auto mb-4;
}

::v-deep .markdown a {
  @apply text-blue-500 underline;
}

::v-deep .markdown table {
  @apply w-full border-collapse mb-4;
}

::v-deep .markdown th,
::v-deep .markdown td {
  @apply border p-2 text-left;
}

::v-deep .markdown img {
  @apply max-w-full h-auto;
}

::v-deep .markdown hr {
  @apply border-t-2 border-gray-300 my-4;
}
</style>


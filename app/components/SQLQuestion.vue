<!-- components/SQLQuestion.vue -->
<template>
  <Card v-if="question" class="w-full max-w-2xl mx-auto">
    <CardHeader>
      <CardTitle>SQL Question {{ currentQuestionNumber }} of {{ totalQuestions }}</CardTitle>
      <CardDescription class="text-md">{{ question.question }}</CardDescription>
      <div v-if="question.image">
        <img :src="question.image" alt="Question Image" class="mt-4" />
      </div>
    </CardHeader>
    <CardContent>
      <!-- Display database tables -->
      <div class="mt-4">
        <h3 class="text-lg font-semibold">Database Tables:</h3>
        <div v-for="table in dbTables" :key="table.name" class="mt-2">
          <h4 class="font-semibold">{{ table.name }}</h4>
          <table class="table-auto w-full">
            <thead>
              <tr>
                <th v-for="column in table.columns" :key="column" class="px-4 py-2">{{ column }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, index) in table.values" :key="index">
                <td v-for="(cell, idx) in row" :key="idx" class="border px-4 py-2">{{ cell }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <textarea
        v-model="userQuery"
        class="w-full h-32 p-2 border rounded mt-4"
        placeholder="Enter your SQL query here"
      ></textarea>
    </CardContent>
    <CardFooter>
      <Button class="bg-emerald-500" @click="runQuery" :disabled="!userQuery">
        Run Query
      </Button>
    </CardFooter>
  </Card>
  <!-- Display query result -->
  <div v-if="queryResult" class="mt-4">
    <h3 class="text-lg font-semibold">Query Result:</h3>
    <div v-if="queryResult.error">
      <p class="text-red-500">{{ queryResult.error }}</p>
    </div>
    <div v-else>
      <table class="table-auto w-full">
        <thead>
          <tr>
            <th v-for="column in queryResult[0].columns" :key="column" class="px-4 py-2">{{ column }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, index) in queryResult[0].values" :key="index">
            <td v-for="(cell, idx) in row" :key="idx" class="border px-4 py-2">{{ cell }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
  <!-- Display feedback -->
  <div v-if="submitted" class="mt-4">
    <!-- <Feedback :isCorrect="isCorrect" :explanation="explanation" @next="nextQuestion" /> -->
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { defineProps, defineEmits } from 'vue'
import type { SQLQuestion } from '~/types'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import initSqlJs from 'sql.js'
import Feedback from '@/components/Feedback.vue'
import { useQuestionStore } from '@/stores/questionStore'

const props = defineProps<{
  question: SQLQuestion | null
}>()

const emit = defineEmits(['answer'])

const question = computed(() => props.question)
const store = useQuestionStore()
const currentQuestionNumber = computed(() => store.currentQuestionIndex + 1)
const totalQuestions = computed(() => store.totalQuestions)

const userQuery = ref('')
const submitted = ref(false)
const queryResult = ref(null)
const db = ref(null)
const dbTables = ref([])
const isCorrect = ref(false) // Initialize as false
const explanation = computed(() => question.value ? question.value.explanation : '')

// Store the SQL module globally
const SQL = ref(null)

const getDatabaseTables = () => {
  if (!db.value) return

  const tables = db.value.exec("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%';")
  if (tables.length > 0) {
    const tableNames = tables[0].values.flat()
    dbTables.value = []
    tableNames.forEach(tableName => {
      const result = db.value.exec(`SELECT * FROM ${tableName}`)
      if (result.length > 0) {
        dbTables.value.push({
          name: tableName,
          columns: result[0].columns,
          values: result[0].values
        })
      }
    })
  }
}

const initializeDatabase = () => {
  if (!SQL.value || !question.value) return

  db.value = new SQL.value.Database()

  if (question.value.initialData) {
    const sqlScript = question.value.initialData.join('\n')
    db.value.exec(sqlScript)
  }

  getDatabaseTables()
}

onMounted(async () => {
  SQL.value = await initSqlJs({
    locateFile: file => `/sql-wasm.wasm` // Adjust if necessary
  })
  initializeDatabase()
})

watch(question, (newQuestion, oldQuestion) => {
  if (newQuestion !== oldQuestion) {
    // Reset state
    userQuery.value = ''
    submitted.value = false
    queryResult.value = null
    isCorrect.value = false
    db.value = null
    dbTables.value = []
    // Re-initialize the database for the new question
    initializeDatabase()
  }
})

const runQuery = () => {
  if (!userQuery.value || !db.value) return

  try {
    const result = db.value.exec(userQuery.value)
    queryResult.value = result.length > 0 ? result : [{ columns: [], values: [] }]
    submitted.value = true
    getDatabaseTables()
    checkAnswer()
  } catch (error) {
    queryResult.value = { error: error.message }
    submitted.value = true
    isCorrect.value = false
    explanation.value = 'Invalid SQL query.'
    // Emit the answer event even if there's an error
    emit('answer', userQuery.value)
  }
}

const checkAnswer = () => {
  if (!question.value || !SQL.value) return

  const sqlScript = question.value.initialData ? question.value.initialData.join('\n') : ''

  try {
    // Create a fresh database and execute initial data
    const userDb = new SQL.value.Database()
    if (sqlScript) {
      userDb.exec(sqlScript)
    }

    // Execute the user's query
    const userResult = userDb.exec(userQuery.value)

    // Create another fresh database and execute initial data
    const correctDb = new SQL.value.Database()
    if (sqlScript) {
      correctDb.exec(sqlScript)
    }

    // Execute the expected query
    const expectedResult = correctDb.exec(question.value.expectedResult)

    // Compare userResult with expectedResult
    if (JSON.stringify(userResult) === JSON.stringify(expectedResult)) {
      isCorrect.value = true
    } else {
      isCorrect.value = false
    }

    // Emit the answer event after checking
    emit('answer', userQuery.value)
  } catch (error) {
    console.error("Error in checkAnswer:", error)
    isCorrect.value = false
    explanation.value = 'Error executing SQL query.'
    emit('answer', userQuery.value)
  }
}

const nextQuestion = () => {
  emit('next')
  // The watcher on 'question' will handle resetting and re-initializing
}
</script>

<style scoped>
/* Add any component-specific styles here */
</style>

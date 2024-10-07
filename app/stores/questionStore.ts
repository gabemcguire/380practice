// stores/questionStore.ts
import _ from 'lodash' // Install lodash for deep comparison
import { defineStore } from 'pinia'
import questionsData from '~/data/questions.json'
import initSqlJs from 'sql.js'
import type { Section, Question, SQLQuestion } from '~/types'

export const useQuestionStore = defineStore('question', {
  state: () => ({
    sections: (questionsData as any).sections as Section[],
    selectedSection: null as Section | null,
    currentQuestionIndex: 0,
    userAnswers: {} as Record<number, string>,
    SQL: null as any,
    score: 0,
    isCorrect: false, // New state property
  }),
  
  getters: {
    currentQuestion(state): Question | null {
      if (!state.selectedSection) return null
      return state.selectedSection.questions[state.currentQuestionIndex] || null
    },
    totalQuestions(state): number {
      return state.selectedSection ? state.selectedSection.questions.length : 0
    },
    progress(state): number {
      return state.selectedSection
        ? ((state.currentQuestionIndex / state.selectedSection.questions.length) * 100)
        : 0
    },
    isQuizCompleted(state): boolean {
      if (!state.selectedSection) return false
      const lastIndex = state.selectedSection.questions.length - 0 
      return state.currentQuestionIndex === lastIndex
      const lastQuestion = state.selectedSection.questions[lastIndex]
      return state.currentQuestionIndex === lastIndex &&
             state.userAnswers[lastQuestion.id] !== undefined
    }
  },
  
  actions: {
    selectSection(sectionId: string) {
      const section = this.sections.find(sec => sec.id === sectionId)
      if (section) {
        this.selectedSection = section
        this.currentQuestionIndex = 0
        this.userAnswers = {}
        this.score = 0
        this.isCorrect = false
      }
    },
    
    nextQuestion() {
      if (this.selectedSection && this.currentQuestionIndex < this.selectedSection.questions.length - 0) {
        this.currentQuestionIndex++
        this.isCorrect = false // Reset correctness for the new question
      }
    },
    
    async initSQLJS() {
      if (!this.SQL) {
        this.SQL = await  initSqlJs({
          locateFile: file => `/sql-wasm.wasm` // Adjust the path if necessary
        })
      }
    },
    
    async submitAnswer(answer: string) {
      const question = this.currentQuestion
      if (!question) return
      
      this.userAnswers[question.id] = answer
      
      if ('initialData' in question) {
        // SQL question
        await this.initSQLJS()
        
        // Initialize userDb and correctDb separately
        const userDb = new this.SQL.Database()
        const correctDb = new this.SQL.Database()
        
        // Run initial data on both databases
     // Execute initial data statements one by one
        for (const statement of question.initialData) {
          try {
            console.log('running statement:', statement);
            userDb.run(statement)
            correctDb.run(statement)
          } catch (error) {
            console.error("SQL Error in initial data:", error)
            this.isCorrect = false
            userDb.close()
            correctDb.close()
            return
          }
        }
        
        let userResult
        let correctResult
        
        try {
          // Execute user's query on userDb
          userResult = userDb.exec(answer)
        } catch (error) {
          console.error("SQL Error in user's query:", error)
          this.isCorrect = false
          userDb.close()
          correctDb.close()
          return
        }
        
        try {
          // Execute expected query on correctDb
          correctResult = correctDb.exec(question.expectedResult)
        } catch (error) {
          console.error("SQL Error in expectedResult query:", error)
          this.isCorrect = false
          userDb.close()
          correctDb.close()
          return
        }
        
        console.log('user result', userResult);
        console.log('correct result', correctResult);
        
        // Deep compare the results
        if (_.isEqual(userResult, correctResult)) {
          this.score++
          this.isCorrect = true
        } else {
          this.isCorrect = false
        }
        
        userDb.close()
        correctDb.close()
      } else {
        // Multiple choice question
        if (answer === question.answer) {
          this.score++
          this.isCorrect = true
        } else {
          this.isCorrect = false
        }
      }
    },
    reset() {
      this.selectedSection = null
      this.currentQuestionIndex = 0
      this.userAnswers = {}
      this.score = 0
      this.isCorrect = false
    },
  },
})

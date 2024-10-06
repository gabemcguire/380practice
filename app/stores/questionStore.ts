// stores/questionStore.ts
import { defineStore } from 'pinia'
import questionsData from '~/data/questions.json'
import initSqlJs from 'sql.js'
import type { Section, Question } from '~/types'

export const useQuestionStore = defineStore('question', {
  state: () => ({
    sections: (questionsData as any).sections as Section[],
    selectedSection: null as Section | null,
    currentQuestionIndex: 0,
    userAnswers: {} as Record<number, string>,
    SQL: null as any,
    score: 0,
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
      return state.selectedSection !== null && 
             state.currentQuestionIndex >= state.selectedSection.questions.length - 1 &&
             state.userAnswers[state.selectedSection.questions[state.currentQuestionIndex].id] !== undefined
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
      }
    },
    
    nextQuestion() {
      if (this.selectedSection && this.currentQuestionIndex < this.selectedSection.questions.length - 1) {
        this.currentQuestionIndex++
      }
    },
    
    async initSQLJS() {
      if (!this.SQL) {
        this.SQL = await  initSqlJs({
        locateFile: file => `/sql-wasm.wasm` // Adjust the path if necessary
  })      }
    },
    
    async submitAnswer(answer: string) {
      const question = this.currentQuestion
      if (!question) return
      
      this.userAnswers[question.id] = answer
      
      if ('initialData' in question) {
        // SQL question
        await this.initSQLJS()
        const db = new this.SQL.Database()
        question.initialData.forEach(statement => {
          db.run(statement)
        })
        
        try {
          const result = db.exec(answer)
          const expectedResult = db.exec(question.expectedResult)
          if (JSON.stringify(result) === JSON.stringify(expectedResult)) {
            this.score++
          }
        } catch (error) {
          // Invalid SQL query
        }
        
        db.close()
      } else {
        // Multiple choice question
        if (answer === question.answer) {
          this.score++
        }
      }
    },    
    reset() {
      this.selectedSection = null
      this.currentQuestionIndex = 0
      this.userAnswers = {}
      this.score = 0
    },
  },
})

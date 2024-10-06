// stores/questionStore.ts
import { defineStore } from 'pinia'
import questionsData from '~/data/questions.json'
import type { Section, Question } from '~/types'

export const useQuestionStore = defineStore('question', {
  state: () => ({
    sections: (questionsData as any).sections as Section[],
    selectedSection: null as Section | null,
    currentQuestionIndex: 0,
    userAnswers: {} as Record<number, string>,
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
    
    submitAnswer(answer: string) {
      const question = this.currentQuestion
      if (question) {
        this.userAnswers[question.id] = answer
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

// stores/questionStore.ts
import _ from 'lodash' // Ensure lodash is installed
import { defineStore } from 'pinia'
import questionsData from '~/data/questions.json'
import initSqlJs from 'sql.js'
import type { Section, Question, UserProgress } from '~/types'

export const useQuestionStore = defineStore('question', {
  state: () => ({
    db: null as IDBDatabase | null,
    sections: [] as Section[],
    selectedSection: null as Section | null,
    userProgressMap: {} as Record<string, UserProgress>, // New state property
    currentQuestionIndex: 0,
    userAnswers: {} as Record<number, string>,
    SQL: null as any,
    userId: 'localuser',
    score: 0,
    isCorrect: false,
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
      const lastIndex = state.selectedSection.questions.length - 1 
      // const lastQuestion = state.selectedSection.questions[lastIndex]
      return state.currentQuestionIndex > lastIndex
        
      // return state.currentQuestionIndex === (lastIndex +1) &&
      //        state.userAnswers[lastQuestion.id] !== undefined
    },
    
    sectionsWithProgress(state): Array<Section & { completedQuestions: number; totalQuestions: number }> {
      return state.sections.map(section => {
        const progress = state.userProgressMap[section.id]
        const completedQuestions = progress ? Object.keys(progress.userAnswers).length : 0
        return {
          ...section,
          completedQuestions,
          totalQuestions: section.questions.length, // Ensure totalQuestions is set when loading sections
        }
      })
    },
  },
  
  actions: {
    async initDatabase() {
      if (process.client) {
        try {
          this.db = await this.openDB()
          await this.populateInitialData()
          await this.loadSections()
          await this.loadAllProgress(this.userId); // Load all progress here
          console.log('Database initialization complete')
        } catch (error) {
          console.error('Database initialization failed:', error)
        }
      }
    },
    
    async loadAllProgress(userId: string) {
      if (!this.db) return;
      const transaction = this.db.transaction(['userProgress'], 'readonly');
      const store = transaction.objectStore('userProgress');
      const index = store.index('userId');
      const userProgress: UserProgress[] = await new Promise((resolve, reject) => {
        const request = index.getAll(userId);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });

      userProgress.forEach(progress => {
        this.userProgressMap[progress.sectionId] = progress;
      });
    },
    openDB(): Promise<IDBDatabase> {
      return new Promise((resolve, reject) => {
        const request = indexedDB.open('QuizDatabase', 1)
        request.onerror = (event) => reject('IndexedDB error: ' + (event.target as IDBOpenDBRequest).error)
        request.onsuccess = (event) => resolve((event.target as IDBOpenDBRequest).result)
        request.onupgradeneeded = (event) => {
          const db = (event.target as IDBOpenDBRequest).result
          
          if (!db.objectStoreNames.contains('sections')) {
            const sectionsStore = db.createObjectStore('sections', { keyPath: 'id' })
            sectionsStore.createIndex('type', 'type', { unique: false })
          }
          
          if (!db.objectStoreNames.contains('questions')) {
            const questionsStore = db.createObjectStore('questions', { keyPath: 'id' })
            questionsStore.createIndex('sectionId', 'sectionId', { unique: false })
          }
          
          if (!db.objectStoreNames.contains('userProgress')) {
            const progressStore = db.createObjectStore('userProgress', { keyPath: ['userId', 'sectionId'] })
            progressStore.createIndex('userId', 'userId', { unique: false })
            progressStore.createIndex('sectionId', 'sectionId', { unique: false })
          }
          if (!db.objectStoreNames.contains('metadata')) {
            db.createObjectStore('metadata', { keyPath: 'key' });
          }
        }
      })
    },

    async populateInitialData() {
      if (!this.db) return;
      const transaction = this.db.transaction(['sections', 'questions', 'metadata'], 'readwrite');
      const sectionsStore = transaction.objectStore('sections');
      const questionsStore = transaction.objectStore('questions');
      const metadataStore = transaction.objectStore('metadata');

      const storedVersion = await new Promise<number>((resolve) => {
        const request = metadataStore.get('version');
        request.onsuccess = () => resolve(request.result?.version || 0);
      });

      const currentVersion = (questionsData as any).version || 0;

      if (currentVersion > storedVersion) {
        // Clear existing data
        await Promise.all([
          new Promise<void>((resolve) => {
            const clearRequest = sectionsStore.clear();
            clearRequest.onsuccess = () => resolve();
          }),
          new Promise<void>((resolve) => {
            const clearRequest = questionsStore.clear();
            clearRequest.onsuccess = () => resolve();
          })
        ]);

        // Populate with new data
        const sections = (questionsData as any).sections as Section[];
        for (const section of sections) {
          await new Promise<void>((resolve) => {
            const addSectionRequest = sectionsStore.add(section);
            addSectionRequest.onsuccess = () => resolve();
          });

          for (const question of section.questions) {
            await new Promise<void>((resolve) => {
              const addQuestionRequest = questionsStore.add({ ...question, sectionId: section.id });
              addQuestionRequest.onsuccess = () => resolve();
            });
          }
        }

        // Update version in metadata
        await new Promise<void>((resolve) => {
          const updateVersionRequest = metadataStore.put({ key: 'version', version: currentVersion });
          updateVersionRequest.onsuccess = () => resolve();
        });

        console.log(`Database updated to version ${currentVersion}`);
      } else {
        console.log('Database is up to date');
      }
    },


    async loadSections() {
      if (!this.db) return
      const transaction = this.db.transaction(['sections'], 'readonly')
      const store = transaction.objectStore('sections')
      this.sections = await new Promise<Section[]>((resolve) => {
        const request = store.getAll()
        request.onsuccess = () => resolve(request.result)
      })
    },
    /**
     * Restart the quiz for a specific section.
     * This deletes the user's progress for the section and resets state variables.
     */
    async restartSection(sectionId: string) {
      if (!this.db) return

      // Delete progress from IndexedDB
      const transaction = this.db.transaction(['userProgress'], 'readwrite')
      const store = transaction.objectStore('userProgress')
      await new Promise<void>((resolve, reject) => {
        const request = store.delete([this.userId, sectionId])
        request.onsuccess = () => resolve()
        request.onerror = () => reject(request.error)
      })

      // Remove from userProgressMap
      delete this.userProgressMap[sectionId]

      // If the restarted section is currently selected, reset the state
      if (this.selectedSection && this.selectedSection.id === sectionId) {
        this.resetProgress()
        this.currentQuestionIndex = 0
        this.userAnswers = {}
        this.score = 0
        this.isCorrect = false
        // Optionally, reload progress if needed
      }

      console.log(`Progress for section ${sectionId} has been restarted.`)
    },
    async selectSection(sectionId: string) {
      if (!this.db) return
      const section = await this.getSection(sectionId)
      if (section) {
        this.selectedSection = section
        this.selectedSection.questions = await this.getQuestionsForSection(sectionId)
        await this.loadProgress(this.userId, sectionId)
      }
    },

    async getSection(sectionId: string): Promise<Section | undefined> {
      if (!this.db) return undefined
      const transaction = this.db.transaction(['sections'], 'readonly')
      const store = transaction.objectStore('sections')
      return new Promise<Section | undefined>((resolve) => {
        const request = store.get(sectionId)
        request.onsuccess = () => resolve(request.result)
      })
    },

    async getQuestionsForSection(sectionId: string): Promise<Question[]> {
      if (!this.db) return []
      const transaction = this.db.transaction(['questions'], 'readonly')
      const store = transaction.objectStore('questions')
      const index = store.index('sectionId')
      return new Promise<Question[]>((resolve) => {
        const request = index.getAll(sectionId)
        request.onsuccess = () => resolve(request.result)
      })
    },

    async saveProgress() {
      if (!this.db || !this.selectedSection) return
      const progress: UserProgress = {
        userId: this.userId,
        sectionId: this.selectedSection.id,
        currentQuestionIndex: this.currentQuestionIndex,
        // userAnswers: {},
        // userAnswers: this.userAnswers,
        // 
        userAnswers: JSON.parse(JSON.stringify(this.userAnswers)), // Break the proxy and get the actual object
        score: this.score
      }
      console.log('Progress to be saved:', progress) // Debugging log
      const transaction = this.db.transaction(['userProgress'], 'readwrite')
      const store = transaction.objectStore('userProgress')
      await new Promise<void>((resolve, reject) => {
        const request = store.put(progress)
        request.onsuccess = () => resolve()
        request.onerror = () => reject(request.error)
      })
      
      this.userProgressMap[this.selectedSection.id] = progress
    },

    async loadProgress(userId: string, sectionId: string) {
      if (!this.db) return
      const transaction = this.db.transaction(['userProgress'], 'readonly')
      const store = transaction.objectStore('userProgress')
      const progress: UserProgress | undefined = await new Promise((resolve) => {
        const request = store.get([userId, sectionId])
        request.onsuccess = () => resolve(request.result)
      })
      if (progress) {
        this.currentQuestionIndex = progress.currentQuestionIndex
        this.userAnswers = progress.userAnswers
        this.score = progress.score
      } else {
        this.resetProgress()
      }
    },

    resetProgress() {
      this.currentQuestionIndex = 0
      this.userAnswers = {}
      this.score = 0
      this.isCorrect = false
    },
    
    nextQuestion() {
      if (this.selectedSection && this.currentQuestionIndex < this.selectedSection.questions.length - 0) {
        this.currentQuestionIndex++
        this.isCorrect = false // Reset correctness for the new question
        
        this.saveProgress()
      }
    },
    
    async initSQLJS() {
      if (!this.SQL) {
        this.SQL = await initSqlJs({
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
        
        // Run initial data statements on both databases
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
      
      this.saveProgress()
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

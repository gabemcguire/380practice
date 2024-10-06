// types/index.d.ts
export interface Question {
  id: number;
  question: string;
  options: string[];
  answer: string;
  explanation: string;
}

export interface SQLQuestion {
  id: number
  question: string
  initialData: string[]
  expectedResult: any
  explanation: string
}
export interface Section {
  id: string;
  type: 'date' | 'topic';
  title: string;
  questions: Question[];
}

export interface QuestionsData {
  sections: Section[];
}

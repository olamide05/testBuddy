// src/api.ts
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000", // change if your backend runs elsewhere
});

// ---------------------------
// TypeScript interfaces
// ---------------------------
export interface Question {
  id: string;
  text: string;
  options: string[];
  correct: string;
  category: string;
  explanation: string;
  image_url: string | null;
}

export interface SessionResponse {
  session_id: string;
  question: Question;
}

export interface AnswerResponse {
  is_correct: boolean;
  correct_answer: string;
  explanation: string;
  next_question?: Question;
  complete?: boolean;
}

export interface ProgressResponse {
  total_answered: number;
  correct_answers: number;
  overall_accuracy: number;
  category_scores: Record<string, { correct: number; total: number }>;
  weak_categories: string[];
}

// ---------------------------
// API functions
// ---------------------------
export const startSession = async (userId: string): Promise<SessionResponse> => {
  const response = await api.post("/api/session/start", { user_id: userId });
  return response.data;
};

export const submitAnswer = async (
  sessionId: string,
  answer: string
): Promise<AnswerResponse> => {
  const response = await api.post(`/api/session/${sessionId}/answer`, { answer });
  return response.data;
};

export const getProgress = async (
  sessionId: string
): Promise<ProgressResponse> => {
  const response = await api.get(`/api/session/${sessionId}/progress`);
  return response.data;
};

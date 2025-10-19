// src/api.ts
import axios from "axios";

const api = axios.create({ baseURL: "http://localhost:8000" });

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
  next_question?: Question | null;
  complete?: boolean;
}

export const startSession = async (userId: string): Promise<SessionResponse> => {
  const res = await api.post(`/api/session/start`, { user_id: userId });
  return res.data;
};

export const submitAnswer = async (sessionId: string, answer: string): Promise<AnswerResponse> => {
  const res = await api.post(`/api/session/${sessionId}/answer`, { answer });
  return res.data;
};

export const deleteSession = async (sessionId: string): Promise<void> => {
  try {
    await api.delete(`/api/session/${sessionId}`);
  } catch {
    // best-effort; ignore if already gone
  }
};

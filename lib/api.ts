import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('token');
      window.location.href = '/auth/login';
    }
    return Promise.reject(err);
  }
);

export default api;

// ─── Auth ──────────────────────────────────────────────────────────────────
export const authApi = {
  register: (data: { email: string; name: string; password: string; role?: string }) =>
    api.post('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  profile: () => api.get('/auth/profile'),
};

// ─── Children ──────────────────────────────────────────────────────────────
export const childrenApi = {
  create: (data: { name: string; age: number; avatarUrl?: string; grade?: number; email?: string; password?: string }) =>
    api.post('/children', data),
  list: () => api.get('/children'),
  get: (id: string) => api.get(`/children/${id}`),
  update: (id: string, data: Partial<{ name: string; age: number; grade: number }>) =>
    api.patch(`/children/${id}`, data),
  remove: (id: string) => api.delete(`/children/${id}`),
  
  // Social APIs
  getLeaderboard: (id: string) => api.get(`/children/${id}/leaderboard`),
  getAnalytics: (id: string) => api.get(`/children/${id}/analytics`),
  addFriend: (id: string, friendCode: string) => api.post(`/children/${id}/friends`, { friendCode }),
  removeFriend: (id: string, friendId: string) => api.delete(`/children/${id}/friends/${friendId}`),
  createGroup: (id: string, name: string) => api.post(`/children/${id}/groups/create`, { name }),
  joinGroup: (id: string, groupCode: string) => api.post(`/children/${id}/groups/join`, { groupCode }),
  leaveGroup: (id: string) => api.post(`/children/${id}/groups/leave`),
};

// ─── Placement Test ─────────────────────────────────────────────────────────
export const placementTestApi = {
  getQuestions: () => api.get('/placement-test'),
  submit: (data: { childId: string; answers: { questionId: string; selectedIdx: number }[] }) =>
    api.post('/placement-test/submit', data),
  getHistory: (childId: string) => api.get(`/placement-test/history/${childId}`),
  getSubjectQuestions: (subject: string, childId: string) =>
    api.get(`/placement-test/subject/${subject}/questions/${childId}`),
  submitSubjectExam: (data: {
    childId: string;
    subject: string;
    answers: { questionId: string; selectedIdx: number; correctIdx: number }[];
  }) => api.post('/placement-test/subject/submit', data),
};

// ─── Lessons ───────────────────────────────────────────────────────────────
export const lessonsApi = {
  list: (childId: string, subject?: string, grade?: number) =>
    api.get('/lessons', { params: { childId, subject, grade } }),
  get: (id: string, childId?: string) => api.get(`/lessons/${id}`, { params: { childId } }),
  complete: (id: string, childId: string) =>
    api.post(`/lessons/${id}/complete`, { childId }),
  getExercises: (id: string, childId?: string) =>
    api.get(`/lessons/${id}/exercises`, { params: { childId } }),
};

// ─── Exercises ─────────────────────────────────────────────────────────────
export const exercisesApi = {
  list: (childId: string, subject?: string) =>
    api.get('/exercises', { params: { childId, subject } }),
  get: (id: string) => api.get(`/exercises/${id}`),
  generateCustom: (childId: string, subject: string) =>
    api.post('/exercises/custom', { childId, subject }),
  submit: (id: string, childId: string, answers: { questionIdx: number; selectedIdx: number }[]) =>
    api.post(`/exercises/${id}/submit`, { childId, answers }),
};

// ─── Gamification ──────────────────────────────────────────────────────────
export const gamificationApi = {
  listBadges: () => api.get('/badges'),
  listEarnedBadges: (childId: string) => api.get(`/badges/child/${childId}`),
  listChallenges: () => api.get('/daily-challenges'),
  completeChallenge: (id: string, childId: string) =>
    api.post(`/daily-challenges/${id}/complete`, { childId }),
};

// ─── Chat Assistant ────────────────────────────────────────────────────────
export const chatApi = {
  sendMessage: (
    childId: string,
    message: string,
    history: { role: 'user' | 'assistant'; content: string }[],
    currentContext?: {
      page?: string;
      lessonTitle?: string;
      subject?: string;
      language?: string;
    },
  ) => api.post('/chat', { childId, message, history, currentContext }),
};

// ─── AI Tutor ──────────────────────────────────────────────────────────────
export const aiTutorApi = {
  listLessons: (childId: string, subject: string) =>
    api.get(`/ai-tutor/child/${childId}/lessons`, { params: { subject } }),
  sendMessage: (childId: string, lessonId: string, message: string, history: any[], language: string) =>
    api.post('/ai-tutor/chat', { childId, lessonId, message, history, language }),
  editLesson: (childId: string, lessonId: string, currentMarkdown: string, editInstruction: string, language: string) =>
    api.post('/ai-tutor/edit-lesson', { childId, lessonId, currentMarkdown, editInstruction, language }),
  generateExercise: (childId: string, lessonId: string, chatHistory: any[]) =>
    api.post('/ai-tutor/generate-exercise', { childId, lessonId, chatHistory }),
  submitExercise: (childId: string, lessonId: string, exerciseId: string, submissions: any[], timeSpentSeconds: number, chatHistory: any[]) =>
    api.post('/ai-tutor/submit-exercise', { childId, lessonId, exerciseId, submissions, timeSpentSeconds, chatHistory }),
  advance: (childId: string, lessonId: string) =>
    api.post('/ai-tutor/advance', { childId, lessonId }),
  generateTTS: async (text: string) => {
    // Call the AI service directly since it returns an audio file stream
    const aiBaseUrl = process.env.NEXT_PUBLIC_AI_URL || 'http://localhost:8000';
    const res = await fetch(`${aiBaseUrl}/ai/tts/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text })
    });
    if (!res.ok) throw new Error('TTS failed');
    return res.blob();
  },
};

// ─── Virtual Class ─────────────────────────────────────────────────────────
export const virtualClassApi = {
  getQuiz: (childId: string) => api.get(`/virtual-class/quiz/${childId}`),
  submitQuiz: (childId: string, questionId: string, selectedIdx: number) =>
    api.post(`/virtual-class/quiz/${childId}/submit`, { questionId, selectedIdx }),
  getTip: (childId: string) => api.get(`/virtual-class/tip/${childId}`),
};

import {
  Article,
  Category,
  Quiz,
  User,
  SignUpRequest,
  SignInRequest,
  AuthResponse,
  GenerateQuizRequest,
  UserQuizResult,
  SaveQuizResultRequest,
  SubscribeRequest,
} from './types'

const BASE_URL = "http://localhost:8080";

// GET /articles/today
export async function getTodayArticles(): Promise<Article[]> {
  const res = await fetch(`${BASE_URL}/articles/today`)
  if (!res.ok) throw new Error('Failed to fetch today\'s articles')
  return res.json()
}

// GET /category/
export async function getCategories(): Promise<Category[]> {
  const res = await fetch(`${BASE_URL}/category/`)
  if (!res.ok) throw new Error('Failed to fetch categories')
  return res.json()
}

// POST /quiz/generate
export async function generateQuiz(req: GenerateQuizRequest): Promise<Quiz> {
  const token = getToken()
  const res = await fetch(`${BASE_URL}/quiz/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(req),
  })
  if (!res.ok) {
    let message = 'Failed to generate quiz'

    try {
      const data = await res.json()
      if (data && typeof data === 'object' && 'error' in data && typeof (data as any).error === 'string') {
        message = (data as any).error
      }
    } catch {
      // Ignore JSON parse errors and fall back to the default message
    }

    throw new Error(message)
  }

  return res.json()
}

// GET /quiz/view/:id
export async function getQuizById(id: string): Promise<Quiz> {
  const res = await fetch(`${BASE_URL}/quiz/view/${id}`)

  if (!res.ok) {
    let message = 'Failed to fetch scheduled quiz'

    try {
      const data = await res.json()
      if (data && typeof data === 'object' && 'error' in data && typeof (data as any).error === 'string') {
        message = (data as any).error
      }
    } catch {
      // Ignore JSON parse errors and fall back to the default message
    }

    throw new Error(message)
  }

  return res.json()
}

// GET /quiz/daily — returns null if no quiz has been generated yet today
export async function getDailyQuiz(): Promise<Quiz | null> {
  const res = await fetch(`${BASE_URL}/quiz/daily`)
  if (res.status === 404) return null
  if (!res.ok) throw new Error('Failed to fetch daily quiz')
  return res.json()
}


// POST /quiz/results
export async function saveQuizResult(req: SaveQuizResultRequest): Promise<UserQuizResult> {
  const token = getToken()
  if (!token) throw new Error('Not authenticated')

  const res = await fetch(`${BASE_URL}/quiz/results`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(req),
  })
  if (!res.ok) throw new Error('Failed to save quiz result')
  return res.json()
}

// GET /quiz/results
export async function getQuizHistory(): Promise<UserQuizResult[]> {
  const token = getToken()
  if (!token) throw new Error('Not authenticated')

  const res = await fetch(`${BASE_URL}/quiz/results`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  if (!res.ok) throw new Error('Failed to fetch quiz history')
  return res.json()
}

// POST /subscribe
export async function subscribe(req: SubscribeRequest): Promise<{ message: string }> {
  const res = await fetch(`${BASE_URL}/subscribe`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(req),
  })
  if (!res.ok) {
    let message = 'Failed to subscribe'
    try {
      const data = await res.json()
      if (data && typeof data === 'object' && 'error' in data && typeof (data as any).error === 'string') {
        message = (data as any).error
      }
    } catch {
      // ignore
    }
    throw new Error(message)
  }
  return res.json()
}

// POST /auth/signup (start email signup, sends OTP)
export async function signUp(req: SignUpRequest): Promise<{ message: string; email: string; dev_otp?: string }> {
  const res = await fetch(`${BASE_URL}/auth/signup`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(req),
  })
  if (!res.ok) {
    let message = 'Signup failed'

    try {
      const data = await res.json()
      if (data && typeof data === 'object' && 'error' in data && typeof (data as any).error === 'string') {
        message = (data as any).error
      }
    } catch {
      // ignore
    }

    throw new Error(message)
  }
  return res.json()
}

// POST /auth/verify-email (complete email signup with OTP)
export async function verifyEmailSignUp(email: string, otp: string): Promise<AuthResponse> {
  const res = await fetch(`${BASE_URL}/auth/verify-email`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, otp }),
  })
  if (!res.ok) {
    let message = 'Verification failed'

    try {
      const data = await res.json()
      if (data && typeof data === 'object' && 'error' in data && typeof (data as any).error === 'string') {
        message = (data as any).error
      }
    } catch {
      // ignore
    }

    throw new Error(message)
  }
  const authRes: AuthResponse = await res.json()
  return authRes
}

// POST /auth/signin
export async function signIn(req: SignInRequest): Promise<AuthResponse> {
  const res = await fetch(`${BASE_URL}/auth/signin`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(req),
  })
  if (!res.ok) {
    let message = 'Signin failed'

    try {
      const data = await res.json()
      if (data && typeof data === 'object' && 'error' in data && typeof (data as any).error === 'string') {
        message = (data as any).error
      }
    } catch {
      // ignore
    }

    throw new Error(message)
  }
  const authRes: AuthResponse = await res.json()
  return authRes
}

// GET /auth/me
export async function getMe(tokenOverride?: string): Promise<User> {
  const token = tokenOverride ?? getToken()
  if (!token) throw new Error('Not authenticated')
  const res = await fetch(`${BASE_URL}/auth/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  if (!res.ok) throw new Error('Failed to fetch user')
  return res.json()
}

// OAuth
export function loginWithGoogle() {
  window.location.href = `${BASE_URL}/auth/google`
}

export function loginWithGithub() {
  window.location.href = `${BASE_URL}/auth/github`
}

// Token helpers
export function getToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('daymark_token')
}

export function setToken(token: string): void {
  if (typeof window === 'undefined') return
  localStorage.setItem('daymark_token', token)
  // Set as a cookie so Next.js middleware can read it
  document.cookie = `daymark_token=${token}; path=/; max-age=2592000; SameSite=Lax`
}

export function clearToken(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem('daymark_token')
  document.cookie = 'daymark_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
}

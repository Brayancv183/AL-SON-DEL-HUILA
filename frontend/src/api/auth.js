import { API_URL } from './config'

// POST /api/auth/login
export async function login(email, password) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ email, password })
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.message || 'Error al iniciar sesión')
  return data // { user, token }
}

// POST /api/auth/register
export async function register(nombre, email, password) {
  const res = await fetch(`${API_URL}/auth/register`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ nombre, email, password })
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.message || 'Error al registrarse')
  return data // { user, token }
}

// POST /api/auth/logout
export async function logout(token) {
  await fetch(`${API_URL}/auth/logout`, {
    method:  'POST',
    headers: {
      'Content-Type':  'application/json',
      'Authorization': `Bearer ${token}`
    }
  })
}
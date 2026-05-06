import { useEffect } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { useAuthContext } from "../context/AuthContext"

export default function GoogleCallback() {
  const [params]  = useSearchParams()
  const { login } = useAuthContext()
  const navigate  = useNavigate()

useEffect(() => {
  console.log("=== GOOGLE CALLBACK ===")
  console.log("URL completa:", window.location.href)
  console.log("Params:", Object.fromEntries(params))

  const token    = params.get("token")
  const id       = params.get("id")
  const name     = params.get("name")
  const email    = params.get("email")
  const foto     = params.get("foto")
  const provider = params.get("provider")
  const error    = params.get("error")

  console.log("Token:", token)
  console.log("ID:", id)
  console.log("Error:", error)

  if (error || !token || !id) {
    console.log("FALLO: redirigiendo a login")
    navigate("/login?error=google_failed")
    return
  }

  login({ id, name, email, foto, provider, token })

  const quizGuardado = localStorage.getItem("quizRespuestas")
  if (quizGuardado) {
    navigate("/resultado")
  } else {
    navigate("/perfil")
  }
}, [])

  return (
    <div style={{
      minHeight:      "100vh",
      display:        "flex",
      flexDirection:  "column",
      alignItems:     "center",
      justifyContent: "center",
      background:     "var(--color-noche)",
      gap:            "1rem",
      color:          "var(--text-secondary)",
      fontFamily:     "var(--font-body)",
    }}>
      <div style={{
        width:        36,
        height:       36,
        border:       "2px solid #1e1b17",
        borderTopColor: "var(--color-tierra)",
        borderRadius: "50%",
        animation:    "spin 0.8s linear infinite",
      }} />
      <p style={{ fontSize: "0.9rem" }}>Iniciando sesión con Google...</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
import { BrowserRouter, Routes, Route } from "react-router-dom"
import Navbar          from "./components/Navbar"
import Footer          from "./components/Footer"
import CustomCursor    from "./components/CustomCursor"
import ProtectedRoute  from "./components/ProtectedRoute"
import Home            from "./pages/Home"
import Catalogo        from "./pages/Catalogo"
import Mapa            from "./pages/Mapa"
import Login           from "./pages/Login"
import Register        from "./pages/Register"
import Actividades     from "./pages/Actividades"
import Rutas           from "./pages/Rutas"
import Quiz            from "./pages/Quiz"
import Resultado       from "./pages/Resultado"
import Privacidad      from "./pages/Privacidad"
import Terminos        from "./pages/Terminos"
import Perfil          from "./pages/Perfil"
import GoogleCallback from "./pages/GoogleCallback"

function App() {
  return (
    <BrowserRouter>
      <CustomCursor />
      <Navbar />
      <Routes>
        <Route path="/"            element={<Home />}       />
        <Route path="/catalogo"    element={<Catalogo />}   />
        <Route path="/mapa"        element={<Mapa />}       />
        <Route path="/actividades" element={<Actividades />}/>
        <Route path="/rutas"       element={<Rutas />}      />
        <Route path="/login"       element={<Login />}      />
        <Route path="/register"    element={<Register />}   />
        <Route path="/privacidad" element={<Privacidad />} />
        <Route path="/terminos"   element={<Terminos />}   />
        <Route path="/auth/google/callback" element={<GoogleCallback />} />
        {/* Quiz — público pero resultado protegido */}
        
        <Route path="/quiz"        element={<Quiz />}       />
        <Route path="/perfil" element={
          <ProtectedRoute>
          <Perfil />
        </ProtectedRoute>
} />
        {/* Resultado — solo si está logueado */}
        <Route path="/resultado" element={
          <ProtectedRoute>
            <Resultado />
          </ProtectedRoute>
        }/>
      </Routes>
      <Footer />
    </BrowserRouter>
  )
}

export default App
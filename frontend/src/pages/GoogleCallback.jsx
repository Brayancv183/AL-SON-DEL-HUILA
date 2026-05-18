import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";

export default function GoogleCallback() {
  const [params] = useSearchParams();

  useEffect(() => {
    // Si ya hay token, redirigir a la página guardada (o al inicio)
    if (localStorage.getItem("token")) {
      const redirectPath = localStorage.getItem("redirectAfterGoogle") || "/";
      localStorage.removeItem("redirectAfterGoogle");
      window.location.href = redirectPath;
      return;
    }

    const token = params.get("token");
    const id = params.get("id");
    let name = params.get("name") || params.get("nombre");
    const email = params.get("email");
    const foto = params.get("foto");
    const provider = params.get("provider");
    const error = params.get("error");

    if (error || !token || !id) {
      // Si hay error, también limpiamos la redirección pendiente
      localStorage.removeItem("redirectAfterGoogle");
      window.location.href = "/login?error=google_failed";
      return;
    }

    // Si el nombre es "null" (string) o vacío, extraer del email
    if (!name || name === "null" || name === "undefined") {
      name = email ? email.split("@")[0] : "Usuario";
      console.log("Nombre extraído del email:", name);
    }

    const userData = {
      id: id,
      nombre: name,
      email: email,
      foto: foto,
      provider: provider,
      token: token,
    };

    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.removeItem("usuario");

    // Obtener la ruta guardada antes de redirigir a Google
    const redirectPath = localStorage.getItem("redirectAfterGoogle") || "/";
    localStorage.removeItem("redirectAfterGoogle");

    // Redirigir a la página original (no al perfil)
    window.location.href = redirectPath;
  }, []);

  return <div>Iniciando sesión con Google...</div>;
}
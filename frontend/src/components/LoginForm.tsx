import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

type LoginLocationState = {
  from?: string;
};

export default function LoginForm() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, login, isLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const redirectTo = (location.state as LoginLocationState | null)?.from ?? "/home";

  useEffect(() => {
    if (isAuthenticated) {
      navigate(redirectTo, { replace: true });
    }
  }, [isAuthenticated, navigate, redirectTo]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await login({ email, password }, redirectTo);
      setPassword("");
    } catch (submitError) {
      const message =
        submitError instanceof Error ? submitError.message : "Could not sign in";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="mx-auto flex w-full max-w-md flex-1 items-center px-4 py-12">
      <div className="w-full rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">Iniciar sesion</h1>
        <p className="mt-2 text-sm text-slate-600">
          Usa tu cuenta del backend para cargar carrito, ordenes y sesion por cookie.
        </p>
        <p className="mt-1 text-xs text-slate-500">
          Despues de iniciar sesion volveras a la pagina que intentabas abrir.
        </p>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">Email</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-slate-900 outline-none transition focus:border-slate-500"
              placeholder="tu@email.com"
              autoComplete="email"
              required
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">
              Password
            </span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-slate-900 outline-none transition focus:border-slate-500"
              placeholder="******"
              autoComplete="current-password"
              required
            />
          </label>

          {error && (
            <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting || isLoading}
            className="w-full rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </div>
    </section>
  );
}

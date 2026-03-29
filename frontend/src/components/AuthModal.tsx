import { useState } from "react";
import type { FormEvent } from "react";
import { useAuth } from "../hooks/useAuth";

type AuthMode = "login" | "register";

type AuthModalProps = {
  redirectTo?: string;
  title?: string;
  description?: string;
};

export default function AuthModal({
  redirectTo = "/home",
  title = "Inicia sesion para continuar",
  description = "Necesitas una cuenta para completar el checkout.",
}: AuthModalProps) {
  const { isLoading, login, register } = useAuth();
  const [mode, setMode] = useState<AuthMode>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      if (mode === "login") {
        await login({ email, password }, redirectTo);
      } else {
        await register(
          {
            email,
            password,
            name: name.trim() || undefined,
          },
          redirectTo
        );
      }
    } catch (submitError) {
      setError(
        submitError instanceof Error ? submitError.message : "No se pudo continuar."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 px-4">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
            <p className="mt-1 text-sm text-slate-600">{description}</p>
          </div>
          <div className="inline-flex rounded-full bg-slate-100 p-1">
            <button
              type="button"
              onClick={() => setMode("login")}
              className={`rounded-full px-3 py-1 text-sm font-medium transition ${
                mode === "login"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600"
              }`}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => setMode("register")}
              className={`rounded-full px-3 py-1 text-sm font-medium transition ${
                mode === "register"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600"
              }`}
            >
              Registro
            </button>
          </div>
        </div>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          {mode === "register" && (
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-slate-700">
                Nombre
              </span>
              <input
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-slate-900 outline-none transition focus:border-slate-500"
                placeholder="Tu nombre"
                autoComplete="name"
              />
            </label>
          )}

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
              autoComplete={mode === "login" ? "current-password" : "new-password"}
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
            {isSubmitting
              ? "Procesando..."
              : mode === "login"
                ? "Entrar y continuar"
                : "Crear cuenta y continuar"}
          </button>
        </form>
      </div>
    </div>
  );
}

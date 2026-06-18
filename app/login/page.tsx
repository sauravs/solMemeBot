import { signIn } from "@/auth";
import { AuthError } from "next-auth";
import { redirect } from "next/navigation";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  async function authenticate(formData: FormData) {
    "use server";
    try {
      await signIn("credentials", {
        email: formData.get("email"),
        password: formData.get("password"),
        redirectTo: "/dashboard",
      });
    } catch (e) {
      // Invalid credentials -> show the error. Re-throw the NEXT_REDIRECT that
      // a successful sign-in produces so the redirect actually happens.
      if (e instanceof AuthError) {
        redirect("/login?error=1");
      }
      throw e;
    }
  }

  return (
    <main className="auth-shell">
      <div className="auth-card">
        <div className="auth-brand">
          <h1>solMemeBot</h1>
          <p className="muted">Sign in to your private dashboard</p>
        </div>
        <form action={authenticate} className="panel">
          <div className="field">
            <label htmlFor="email">Email</label>
            <input id="email" name="email" type="email" autoComplete="username" required />
          </div>
          <div className="field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
            />
          </div>
          {error ? (
            <p className="error" data-testid="login-error">
              Invalid email or password.
            </p>
          ) : null}
          <button type="submit">Sign in</button>
        </form>
      </div>
    </main>
  );
}

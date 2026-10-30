import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import Navbar from "../components/NavBar";
import Footer from "../components/Footer";
import { authUtils } from "../utils/auth";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    let isMounted = true;

    const checkAuth = async () => {
      const user = await authUtils.getUser();
      if (isMounted && user) {
        if (user.role === "EMPLOYER") {
          router.push("/employer/dashboard");
        } else {
          router.push("/dashboard");
        }
      }
    };

    checkAuth();

    return () => {
      isMounted = false;
    };
  }, [router]);

  const handleLogin = async (event) => {
    event.preventDefault();

    if (!email || !password) {
      setError("Please fill all fields.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const data = await authUtils.login(email, password);
      const user = data.user || (await authUtils.getUser());
      if (user?.role === "EMPLOYER") {
        router.push("/employer/dashboard");
      } else {
        router.push("/dashboard");
      }
    } catch (err) {
      setError(err.message || "Invalid email or password");
      setLoading(false);
    }
  };

  return (
    <div className="page-shell">
      <Navbar />

      <main className="main-content auth-wrap">
        <form className="card auth-card" onSubmit={handleLogin}>
          <h2>Login</h2>
          <p className="muted">Welcome back. Enter your account details.</p>

          <label className="label" htmlFor="email">Email</label>
          <input
            id="email"
            className="input"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />

          <label className="label" htmlFor="password">Password</label>
          <input
            id="password"
            className="input"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />

          {error ? <p className="error-text">{error}</p> : null}

          <button className="button full-width" type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>

          <p className="auth-link-text">
            Do not have an account? <Link href="/signup">Sign up</Link>
          </p>
        </form>
      </main>

      <Footer />
    </div>
  );
}

import { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import Navbar from "../components/NavBar";
import Footer from "../components/Footer";
import { authUtils } from "../utils/auth";

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSignup = async (event) => {
    event.preventDefault();

    if (!name || !email || !password) {
      setError("Please fill all fields.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Signup failed");
        setLoading(false);
        return;
      }

      
      alert("Signup successful! Please login.");
      router.push("/login");
    } catch (err) {
      setError("Server error. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="page-shell">
      <Navbar />

      <main className="main-content auth-wrap">
        <form className="card auth-card" onSubmit={handleSignup}>
          <h2>Sign Up</h2>
          <p className="muted">Create your account in a few seconds.</p>

          <label className="label" htmlFor="name">Full Name</label>
          <input
            id="name"
            className="input"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
          />

          <label className="label" htmlFor="email">Email</label>
          <input
            id="email"
            className="input"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />

          <label className="label" htmlFor="password">Password</label>
          <input
            id="password"
            className="input"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
          />

          {error ? <p className="error-text">{error}</p> : null}

          <button className="button full-width" type="submit" disabled={loading}>
            {loading ? "Registering..." : "Register"}
          </button>

          <p className="auth-link-text">
            Already registered? <Link href="/login">Login</Link>
          </p>
        </form>
      </main>

      <Footer />
    </div>
  );
}

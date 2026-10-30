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
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("JOB_SEEKER");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSignup = async (event) => {
    event.preventDefault();

    if (!name || !email || !password || !phone) {
      setError("Please fill all required fields.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await authUtils.register(name, email, password, phone, role);
      alert("Registration successful! Please login.");
      router.push("/login");
    } catch (err) {
      setError(err.message || "Registration failed. Please try again.");
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

          <label className="label" htmlFor="name">Full Name *</label>
          <input
            id="name"
            className="input"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
            required
          />

          <label className="label" htmlFor="email">Email *</label>
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

          <label className="label" htmlFor="password">Password *</label>
          <input
            id="password"
            className="input"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            required
          />

          <label className="label" htmlFor="phone">Phone Number *</label>
          <input
            id="phone"
            className="input"
            type="tel"
            placeholder="Phone Number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            autoComplete="tel"
            required
          />

          <label className="label" htmlFor="role">Account Type *</label>
          <select
            id="role"
            className="input"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid var(--border)" }}
          >
            <option value="JOB_SEEKER">Job Seeker</option>
            <option value="EMPLOYER">Employer</option>
          </select>

          {error ? <p className="error-text">{error}</p> : null}

          <button className="button full-width" type="submit" disabled={loading} style={{ marginTop: "16px" }}>
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

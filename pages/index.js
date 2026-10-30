import Link from "next/link";
import Navbar from "../components/NavBar";
import Footer from "../components/Footer";

export default function Home() {
  return (
    <div className="page-shell">
      <Navbar />

      <main className="main-content">
        <section className="landing-hero">
          <div className="container landing-hero-grid">
            <div className="landing-copy">
              <span className="landing-badge">Job Portal</span>
              <h1>Discover jobs, save favorites, and sign in when you are ready.</h1>
              <p className="landing-lead">
                This is the first page visitors see. It introduces the platform,
                explains what the app does, and gives two clear next steps: explore
                jobs or sign in to continue.
              </p>

              <div className="hero-actions">
                <Link href="/dashboard" className="button link-button">
                  Explore Jobs
                </Link>
                <Link href="/login" className="button button-alt link-button">
                  Sign In
                </Link>
                <Link href="/signup" className="button button-light link-button">
                  Create Account
                </Link>
              </div>

              <div className="hero-points">
                <span>Job search</span>
                <span>Saved roles</span>
                <span>Profile flow</span>
              </div>
            </div>

            <div className="landing-visual card">
              <div className="landing-visual-header">
                <span className="visual-pill visual-pill-primary">Welcome</span>
                <span className="visual-pill">Start here</span>
              </div>

              <div className="floating-card featured-job">
                <p className="eyebrow">What you can do</p>
                <h3>Browse live roles</h3>
                <p>Search by title, company, location, and job type.</p>
              </div>

              <div className="visual-metrics">
                <div>
                  <strong>Explore</strong>
                  <span>open roles</span>
                </div>
                <div>
                  <strong>Sign in</strong>
                  <span>to save progress</span>
                </div>
                <div>
                  <strong>Start fast</strong>
                  <span>in one click</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="container landing-section">
          <div className="section-heading">
            <p className="section-kicker">About the site</p>
            <h2>A simple job portal built for browsing and tracking opportunities.</h2>
            <p>
              Users can explore listings, inspect job details, save interesting roles,
              and sign in to manage their profile and dashboard.
            </p>
          </div>

          <div className="feature-grid">
            <article className="card feature-card">
              <h3>Explore jobs</h3>
              <p>
                View available roles in a clean dashboard with search and filtering.
              </p>
            </article>
            <article className="card feature-card">
              <h3>Sign in securely</h3>
              <p>
                Return users can log in to access the dashboard, saved jobs, and
                profile pages.
              </p>
            </article>
            <article className="card feature-card">
              <h3>Save and revisit</h3>
              <p>
                Shortlist jobs and come back later when you are ready to apply.
              </p>
            </article>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

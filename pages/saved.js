import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import Navbar from "../components/NavBar";
import Footer from "../components/Footer";
import jobsData from "../data/jobs";
import { authUtils } from "../utils/auth";

export default function SavedJobs() {
  const router = useRouter();
  const [savedIds, setSavedIds] = useState(() => {
    if (typeof window === "undefined") {
      return [];
    }

    const rawSavedJobs = localStorage.getItem("savedJobs");
    const parsedIds = rawSavedJobs ? JSON.parse(rawSavedJobs) : [];
    return Array.isArray(parsedIds) ? parsedIds : [];
  });

  useEffect(() => {
    
    if (!authUtils.isAuthenticated()) {
      router.push("/login");
    }
  }, [router]);

  const savedJobs = jobsData.filter((job) => savedIds.includes(job.id));

  const removeJob = (id) => {
    const nextSavedIds = savedIds.filter((jobId) => jobId !== id);
    setSavedIds(nextSavedIds);
    localStorage.setItem("savedJobs", JSON.stringify(nextSavedIds));
  };

  return (
    <div className="page-shell">
      <Navbar />

      <main className="main-content container">
        <h1 className="page-title">Saved Jobs</h1>
        <p className="muted">Jobs you saved from details page will appear here.</p>

        {savedJobs.length === 0 ? (
          <div className="card">
            <p>No saved jobs right now.</p>
            <Link href="/dashboard" className="button link-button">
              Explore Jobs
            </Link>
          </div>
          
        ) : (
          <div className="jobs-grid">
            {savedJobs.map((job) => (
              <article className="card job-card" key={job.id}>
                <div>
                  <h4>{job.title}</h4>
                  <p style={{ margin: "2px 0", fontSize: "0.9rem" }}>
                    {job.company}
                  </p>
                  <p style={{ margin: "2px 0", fontSize: "0.9rem", color: "var(--muted)" }}>
                    {job.location}
                  </p>
                  <p className="job-card-description">{job.description}</p>
                </div>
                <div className="job-card-actions">
                  <Link href={`/jobs/${job.id}`} className="button">
                    View
                  </Link>
                  <button
                    className="button button-light"
                    onClick={() => removeJob(job.id)}
                  >
                    Remove
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}





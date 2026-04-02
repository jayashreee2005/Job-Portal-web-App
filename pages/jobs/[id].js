import { useRouter } from "next/router";
import Link from "next/link";
import { useState } from "react";
import Navbar from "../../components/NavBar";
import Footer from "../../components/Footer";
import jobsData from "../../data/jobs";

export default function JobDetails() {
  const router = useRouter();
  const { id } = router.query;
  const [savedIds, setSavedIds] = useState(() => {
    if (typeof window === "undefined") {
      return [];
    }

    const rawSavedJobs = localStorage.getItem("savedJobs");
    const parsedIds = rawSavedJobs ? JSON.parse(rawSavedJobs) : [];
    return Array.isArray(parsedIds) ? parsedIds : [];
  });

  if (!id) {
    return (
      <div className="page-shell">
        <Navbar />
        <main className="main-content container">
          <div className="card">
            <p>Loading job details...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const job = jobsData.find((item) => item.id === Number(id));
  const isSaved = savedIds.includes(Number(id));

  const toggleSaveJob = () => {
    const currentJobId = Number(id);
    const nextSavedIds = isSaved
      ? savedIds.filter((savedId) => savedId !== currentJobId)
      : [...savedIds, currentJobId];

    setSavedIds(nextSavedIds);
    localStorage.setItem("savedJobs", JSON.stringify(nextSavedIds));
  };

  if (!job) {
    return (
      <div className="page-shell">
        <Navbar />
        <main className="main-content container">
          <div className="card">
            <h2>Job not found</h2>
            <Link href="/dashboard" className="button link-button">
              Back to Dashboard
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="page-shell">
      <Navbar />

      <main className="main-content container">
        <div className="details-layout">
          <div className="details-main">
            <article className="card">
              <h1>{job.title}</h1>
              <p style={{ color: "var(--muted)", marginTop: "4px" }}>
                {job.company}
              </p>

              <div className="details-info">
                <div className="detail-item">
                  <span className="detail-label">Location</span>
                  <span className="detail-value">{job.location}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Job Type</span>
                  <span className="detail-value">{job.type}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Salary</span>
                  <span className="detail-value salary">{job.salary}</span>
                </div>
              </div>
            </article>

            <article className="card details-description">
              <h3>Job Description</h3>
              <p>{job.description}</p>

              <h3>Requirements</h3>
              <ul>
                {job.requirements.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>

              <div className="details-actions">
                <button
                  className="button"
                  onClick={() => alert("Application submitted (demo).")}
                >
                  Apply Now
                </button>
                <button
                  className={`button ${isSaved ? "button-light" : ""}`}
                  onClick={toggleSaveJob}
                >
                  {isSaved ? "Saved ✓" : "Save Job"}
                </button>
              </div>
            </article>
          </div>

          <div className="card details-sidebar">
            <h3>Skills Required</h3>
            <ul>
              {job.requirements.map((skill) => (
                <li key={skill}>{skill}</li>
              ))}
            </ul>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
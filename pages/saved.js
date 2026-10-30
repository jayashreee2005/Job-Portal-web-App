import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import Navbar from "../components/NavBar";
import Footer from "../components/Footer";
import { api } from "../utils/api";
import { authUtils } from "../utils/auth";

export default function SavedJobs() {
  const router = useRouter();
  const [savedJobs, setSavedJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadSavedJobs = async () => {
      try {
        const currentUser = await authUtils.getUser();
        if (!currentUser) {
          router.push("/login");
          return;
        }

        const raw = localStorage.getItem("saved_job_ids");
        const savedIds = raw ? JSON.parse(raw) : [];

        if (savedIds.length === 0) {
          if (isMounted) {
            setSavedJobs([]);
          }
          return;
        }

        const jobPromises = savedIds.map((id) =>
          api.get(`/jobs/${id}`).catch(() => null)
        );
        const fetchedJobs = await Promise.all(jobPromises);
        const validJobs = fetchedJobs.filter(Boolean);

        if (!isMounted) {
          return;
        }

        setSavedJobs(validJobs);
      } catch (error) {
        if (isMounted) {
          setSavedJobs([]);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadSavedJobs();

    return () => {
      isMounted = false;
    };
  }, [router]);

  const removeJob = (id) => {
    const raw = localStorage.getItem("saved_job_ids");
    const savedIds = raw ? JSON.parse(raw) : [];
    const nextIds = savedIds.filter((jobId) => Number(jobId) !== Number(id));
    localStorage.setItem("saved_job_ids", JSON.stringify(nextIds));
    setSavedJobs((prevJobs) => prevJobs.filter((job) => Number(job.id) !== Number(id)));
  };

  return (
    <div className="page-shell">
      <Navbar />

      <main className="main-content container">
        <h1 className="page-title">Saved Jobs</h1>
        <p className="muted">Jobs you saved will appear here.</p>

        {isLoading ? (
          <div className="card">
            <p>Loading saved jobs...</p>
          </div>
        ) : savedJobs.length === 0 ? (
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
                    {job.companyName || job.company}
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

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import Navbar from "../components/NavBar";
import Footer from "../components/Footer";
import { api } from "../utils/api";
import { authUtils } from "../utils/auth";

export default function AppliedJobs() {
  const router = useRouter();
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState(null);

  const timelineSteps = ["Applied", "Under Review", "Shortlisted", "Interview", "Hired"];

  const getStatusIndex = (status) => {
    const s = String(status || "").toUpperCase();
    if (s === "APPLIED") return 0;
    if (s === "SHORTLISTED") return 2;
    if (s === "HIRED") return 4;
    if (s === "REJECTED") return 0;
    return 0;
  };

  const getReadableStatus = (status) => {
    const s = String(status || "").toUpperCase();
    if (s === "APPLIED") return "Applied";
    if (s === "SHORTLISTED") return "Shortlisted";
    if (s === "REJECTED") return "Rejected";
    if (s === "HIRED") return "Hired";
    return String(status || "Applied");
  };

  useEffect(() => {
    let isMounted = true;

    const loadAppliedJobs = async () => {
      try {
        const currentUser = await authUtils.getUser();
        if (!currentUser) {
          router.push("/login");
          return;
        }

        const payload = await api.get("/applications/my");

        if (!isMounted) {
          return;
        }

        setAppliedJobs(Array.isArray(payload) ? payload : []);
      } catch (error) {
        if (isMounted) {
          setAppliedJobs([]);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadAppliedJobs();

    return () => {
      isMounted = false;
    };
  }, [router]);

  const handleWithdraw = async (applicationId) => {
    const confirmed = window.confirm("Are you sure you want to withdraw this application?");
    if (!confirmed) return;

    try {
      await api.delete(`/applications/${applicationId}`);
      setAppliedJobs((prev) => prev.filter((app) => app.id !== applicationId));
      if (selectedApplication?.id === applicationId) {
        setSelectedApplication(null);
      }
      alert("Application withdrawn successfully.");
    } catch (error) {
      alert(error.message || "Failed to withdraw application.");
    }
  };

  return (
    <div className="page-shell">
      <Navbar />

      <main className="main-content container">
        <h1 className="page-title">Applied Jobs</h1>
        <p className="muted">Track all jobs you applied for in one place.</p>

        {isLoading ? (
          <div className="card">
            <p>Loading applied jobs...</p>
          </div>
        ) : appliedJobs.length === 0 ? (
          <div className="card">
            <p>You have not applied to any jobs yet.</p>
            <Link href="/dashboard" className="button link-button">
              Browse Jobs
            </Link>
          </div>
        ) : (
          <div className="jobs-grid">
            {appliedJobs.map((application) => (
              <article className="card job-card" key={application.id}>
                <div>
                  <h4>{application.jobTitle}</h4>
                  <p className="job-card-description" style={{ marginTop: "8px" }}>
                    Applied on {new Date(application.appliedAt).toLocaleDateString()} • Status: <strong>{getReadableStatus(application.status)}</strong>
                  </p>
                </div>

                <div className="job-card-actions" style={{ marginTop: "12px", display: "flex", gap: "8px" }}>
                  <button
                    className="button button-light"
                    type="button"
                    onClick={() => setSelectedApplication(application)}
                  >
                    View Details
                  </button>
                  <Link href={`/jobs/${application.jobId}`} className="button button-light">
                    View Job
                  </Link>
                  <button
                    className="button button-danger"
                    type="button"
                    onClick={() => handleWithdraw(application.id)}
                    style={{ backgroundColor: "#fed7d7", color: "#9b2c2c", border: "none" }}
                  >
                    Withdraw
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>

      <Footer />

      {selectedApplication ? (
        <div className="modal-overlay" onClick={() => setSelectedApplication(null)}>
          <div className="modal-content" onClick={(event) => event.stopPropagation()}>
            <div className="modal-header">
              <h2>{selectedApplication.jobTitle}</h2>
              <button className="modal-close" onClick={() => setSelectedApplication(null)}>
                ✕
              </button>
            </div>

            <div className="application-form" style={{ gap: "18px" }}>
              <div>
                <h3 style={{ marginTop: 0, marginBottom: "10px" }}>Application Status</h3>
                <div className="status-timeline">
                  {timelineSteps.map((step, index) => {
                    const activeIndex = getStatusIndex(selectedApplication.status);
                    const isDone = index <= activeIndex && selectedApplication.status !== "REJECTED";

                    return (
                      <div
                        key={step}
                        className={`timeline-step ${isDone ? "is-done" : ""}`}
                      >
                        <span className="timeline-dot" />
                        <span className="timeline-label">{step}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="card" style={{ boxShadow: "none" }}>
                <h3 style={{ marginTop: 0, marginBottom: "10px" }}>Application Details</h3>
                <p style={{ margin: "0 0 8px 0" }}>
                  <strong>Status:</strong>{" "}
                  <span className="status-badge" style={{ padding: "4px 8px", borderRadius: "4px", backgroundColor: selectedApplication.status === "REJECTED" ? "#fed7d7" : selectedApplication.status === "HIRED" ? "#c6f6d5" : "#e2e8f0" }}>
                    {getReadableStatus(selectedApplication.status)}
                  </span>
                </p>
                <p style={{ margin: "0 0 8px 0" }}>
                  <strong>Applied On:</strong> {new Date(selectedApplication.appliedAt).toLocaleString()}
                </p>
                <p style={{ margin: "0 0 8px 0" }}>
                  <strong>Applied As:</strong> {selectedApplication.applicantName} ({selectedApplication.applicantEmail})
                </p>
                <p style={{ margin: "0" }}>
                  <strong>Cover Letter:</strong>{" "}
                  {selectedApplication.coverLetter
                    ? selectedApplication.coverLetter
                    : "Not provided"}
                </p>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <button
                  type="button"
                  className="button button-danger"
                  onClick={() => handleWithdraw(selectedApplication.id)}
                  style={{ backgroundColor: "#e53e3e", color: "#fff" }}
                >
                  Withdraw Application
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

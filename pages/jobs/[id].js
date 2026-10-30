import { useRouter } from "next/router";
import Link from "next/link";
import { useEffect, useState } from "react";
import Navbar from "../../components/NavBar";
import Footer from "../../components/Footer";
import { api } from "../../utils/api";
import { authUtils } from "../../utils/auth";

function formatJobType(type) {
  if (!type) return "Full Time";
  const map = {
    FULL_TIME: "Full Time",
    PART_TIME: "Part Time",
    INTERNSHIP: "Internship",
    CONTRACT: "Contract",
  };
  return map[type] || type;
}

export default function JobDetails() {
  const router = useRouter();
  const { id } = router.query;
  const [job, setJob] = useState(null);
  const [relatedJobs, setRelatedJobs] = useState([]);
  const [isPageLoading, setIsPageLoading] = useState(true);

  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [applicationData, setApplicationData] = useState({
    fullName: "",
    email: "",
    phone: "",
    coverLetter: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [applicationStatus, setApplicationStatus] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    if (!id) {
      return;
    }

    let isMounted = true;

    const loadDetails = async () => {
      setIsPageLoading(true);
      setActiveTab("overview");

      try {
        const currentUser = await authUtils.getUser();
        if (!currentUser) {
          router.push("/login");
          return;
        }

        const [jobPayload, allJobsPayload] = await Promise.all([
          api.get(`/jobs/${id}`),
          api.get("/jobs"),
        ]);

        if (!isMounted) {
          return;
        }

        const selectedJob = jobPayload || null;
        const allJobs = Array.isArray(allJobsPayload) ? allJobsPayload : allJobsPayload.jobs || [];

        if (selectedJob) {
          const companyName = selectedJob.companyName || selectedJob.company || "Company";
          const formattedType = formatJobType(selectedJob.jobType || selectedJob.type);
          const skillsList = typeof selectedJob.skills === "string"
            ? selectedJob.skills.split(",").map((s) => s.trim()).filter(Boolean)
            : Array.isArray(selectedJob.requirements) ? selectedJob.requirements : [];

          const normalizedJob = {
            ...selectedJob,
            company: companyName,
            type: formattedType,
            requirements: skillsList,
          };

          setJob(normalizedJob);

          const suggestions = allJobs
            .filter((item) => Number(item.id) !== Number(selectedJob.id))
            .map((item) => {
              const itemCompany = item.companyName || item.company;
              const itemType = formatJobType(item.jobType || item.type);
              const score =
                (itemCompany === companyName ? 3 : 0) +
                (item.location === selectedJob.location ? 2 : 0) +
                (itemType === formattedType ? 2 : 0);

              return { ...item, company: itemCompany, type: itemType, score };
            })
            .sort((first, second) => second.score - first.score)
            .slice(0, 4);

          setRelatedJobs(suggestions);
        } else {
          setJob(null);
          setRelatedJobs([]);
        }

        setApplicationData((prevData) => ({
          ...prevData,
          fullName: currentUser?.name || "",
          email: currentUser?.email || "",
          phone: currentUser?.phone || "",
        }));
      } catch (error) {
        if (isMounted) {
          setJob(null);
        }
      } finally {
        if (isMounted) {
          setIsPageLoading(false);
        }
      }
    };

    loadDetails();

    return () => {
      isMounted = false;
    };
  }, [id, router]);

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

  const postedDate = job?.createdAt ? new Date(job.createdAt) : new Date(Date.now() - Math.max(1, Number(job?.id || 1) * 2) * 86400000);
  const postedDaysAgo = Math.max(1, Math.ceil((Date.now() - postedDate.getTime()) / 86400000));
  const openings = Number(job?.openings) > 0 ? Number(job.openings) : Math.max(1, (Number(job?.id || 1) % 5) + 1);
  const totalApplicants = 18 + Number(job?.id || 0) * 3;
  const companyAbout =
    job?.companyAbout ||
    `${job?.company} is hiring for high-impact roles and values ownership, collaboration, and continuous learning.`;
  const companyInitials = String(job?.company || "JP")
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const roleResponsibilities = [
    `Collaborate with the ${job?.company} team to deliver quality work on time.`,
    `Build, test, and improve features related to ${job?.title}.`,
    "Participate in reviews, debugging sessions, and continuous improvement.",
    `Communicate progress and blockers with stakeholders across ${job?.location} teams.`,
  ];

  const roleBenefits = [
    "Structured onboarding and mentorship support.",
    `Competitive compensation (${job?.salary}).`,
    "Learning resources and internal upskilling opportunities.",
    "Performance-driven growth path with regular feedback.",
  ];

  const hiringProcess = [
    "Application screening",
    "Recruiter/HR short call",
    "Technical or task round",
    "Final discussion and offer",
  ];

  const handleApplicationInputChange = (e) => {
    const { name, value } = e.target;
    setApplicationData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleApplicationSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setApplicationStatus(null);

    try {
      await api.post(`/jobs/${id}/applications`, {
        coverLetter: applicationData.coverLetter || "I am interested in this role.",
      });

      setApplicationStatus({
        type: "success",
        message: "Application submitted successfully!",
      });
      setApplicationData((prev) => ({
        ...prev,
        coverLetter: "",
      }));
      setTimeout(() => {
        setShowApplicationForm(false);
        setApplicationStatus(null);
      }, 2000);
    } catch (error) {
      if (error.status === 409) {
        setApplicationStatus({
          type: "error",
          message: "You have already applied for this job.",
        });
      } else if (error.status === 403) {
        setApplicationStatus({
          type: "error",
          message: error.message || "Only job seekers can apply for jobs.",
        });
      } else {
        setApplicationStatus({
          type: "error",
          message: error.message || "Failed to submit application. Please try again.",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isPageLoading) {
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
              <p className="details-breadcrumb">
                <Link href="/dashboard">Dashboard</Link> / <span>{job.title}</span>
              </p>

              <h1>{job.title}</h1>
              <p style={{ color: "var(--muted)", marginTop: "4px" }}>
                {job.company}
              </p>

              <div className="details-top-meta">
                <span className="details-meta-pill">Posted {postedDaysAgo} days ago</span>
                <span className="details-meta-pill">{totalApplicants} applicants</span>
                <span className="details-meta-pill">{openings} openings</span>
                <span className="details-meta-pill">Immediate joiners preferred</span>
              </div>

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
              <div className="details-tabs">
                <button
                  type="button"
                  className={`details-tab ${activeTab === "overview" ? "active" : ""}`}
                  onClick={() => setActiveTab("overview")}
                >
                  Overview
                </button>
                <button
                  type="button"
                  className={`details-tab ${activeTab === "responsibilities" ? "active" : ""}`}
                  onClick={() => setActiveTab("responsibilities")}
                >
                  Responsibilities
                </button>
                <button
                  type="button"
                  className={`details-tab ${activeTab === "benefits" ? "active" : ""}`}
                  onClick={() => setActiveTab("benefits")}
                >
                  Benefits
                </button>
                <button
                  type="button"
                  className={`details-tab ${activeTab === "hiring" ? "active" : ""}`}
                  onClick={() => setActiveTab("hiring")}
                >
                  Hiring Process
                </button>
              </div>

              {activeTab === "overview" ? (
                <>
                  <h3>About This Role</h3>
                  <p>{job.description}</p>

                  <h3>Must-Have Skills</h3>
                  <div className="skills-tags">
                    {Array.isArray(job.requirements) && job.requirements.length > 0 ? (
                      job.requirements.map((skill) => (
                        <span key={skill} className="skill-tag">{skill}</span>
                      ))
                    ) : (
                      <span className="skill-tag">{job.skills || "Not specified"}</span>
                    )}
                  </div>
                </>
              ) : null}

              {activeTab === "responsibilities" ? (
                <>
                  <h3>Key Responsibilities</h3>
                  <ul>
                    {roleResponsibilities.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </>
              ) : null}

              {activeTab === "benefits" ? (
                <>
                  <h3>Benefits & Perks</h3>
                  <ul>
                    {roleBenefits.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </>
              ) : null}

              {activeTab === "hiring" ? (
                <>
                  <h3>Hiring Process</h3>
                  <ol className="hiring-list">
                    {hiringProcess.map((step) => (
                      <li key={step}>{step}</li>
                    ))}
                  </ol>
                </>
              ) : null}

              <div className="details-actions">
                <button
                  className="button"
                  onClick={() => setShowApplicationForm(true)}
                >
                  Apply Now
                </button>
              </div>
            </article>
          </div>

          <div className="details-sidebar-stack">
            <div className="card details-sidebar">
              <h3>Company Snapshot</h3>
              <div className="company-badge">
                <div className="company-logo company-logo-fallback">{companyInitials}</div>
                <div>
                  <strong>{job.company}</strong>
                  <p className="muted" style={{ margin: "4px 0 0" }}>Growing team • Product focused</p>
                </div>
              </div>
              <p className="company-about">{companyAbout}</p>
              <div className="sidebar-info-list">
                <p><strong>Company:</strong> {job.company}</p>
                <p><strong>Role:</strong> {job.title}</p>
                <p><strong>Location:</strong> {job.location}</p>
                <p><strong>Type:</strong> {job.type}</p>
                <p><strong>Compensation:</strong> {job.salary}</p>
                <p><strong>Posted:</strong> {postedDate.toLocaleDateString()}</p>
                <p><strong>Openings:</strong> {openings}</p>
                <p><strong>Applicants:</strong> {totalApplicants}</p>
              </div>
            </div>

            <div className="card details-sidebar">
              <h3>Quick Actions</h3>
              <div className="details-actions">
                <button
                  className="button"
                  onClick={() => setShowApplicationForm(true)}
                >
                  Apply Now
                </button>
              </div>
            </div>

            {relatedJobs.length > 0 ? (
              <div className="card details-sidebar">
                <h3>Related Jobs</h3>
                <div className="related-jobs-list">
                  {relatedJobs.map((item) => (
                    <Link key={item.id} href={`/jobs/${item.id}`} className="related-job-link">
                      <strong>{item.title}</strong>
                      <span>{item.company} • {item.location}</span>
                    </Link>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </main>

      <Footer />

      {/* Application Form Modal */}
      {showApplicationForm && (
        <div className="modal-overlay" onClick={() => setShowApplicationForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Apply for {job.title}</h2>
              <button
                className="modal-close"
                onClick={() => setShowApplicationForm(false)}
              >
                ✕
              </button>
            </div>

            {applicationStatus && (
              <div className={`alert alert-${applicationStatus.type}`} style={{ padding: "10px", margin: "10px 0", borderRadius: "6px", backgroundColor: applicationStatus.type === "success" ? "#e6fffa" : "#fff5f5", color: applicationStatus.type === "success" ? "#234e52" : "#742a2a" }}>
                {applicationStatus.message}
              </div>
            )}

            <form onSubmit={handleApplicationSubmit} className="application-form">
              <div className="form-group">
                <label htmlFor="fullName">Full Name</label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={applicationData.fullName}
                  readOnly
                  disabled
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={applicationData.email}
                  readOnly
                  disabled
                />
              </div>

              <div className="form-group">
                <label htmlFor="coverLetter">Cover Letter *</label>
                <textarea
                  id="coverLetter"
                  name="coverLetter"
                  value={applicationData.coverLetter}
                  onChange={handleApplicationInputChange}
                  placeholder="Tell us why you're interested in this position..."
                  rows="5"
                  required
                />
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="button button-secondary"
                  onClick={() => setShowApplicationForm(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="button"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Submitting..." : "Submit Application"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
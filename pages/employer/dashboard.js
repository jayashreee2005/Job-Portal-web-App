import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
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

export default function EmployerDashboard() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Modals & Forms state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAppsModal, setShowAppsModal] = useState(false);

  // Selected job for edit/applications
  const [selectedJob, setSelectedJob] = useState(null);
  const [applications, setApplications] = useState([]);
  const [isAppsLoading, setIsAppsLoading] = useState(false);

  // Form states
  const [jobForm, setJobForm] = useState({
    title: "",
    description: "",
    companyName: "",
    location: "",
    salary: "",
    jobType: "FULL_TIME",
    experience: "",
    skills: "",
  });
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadEmployerData = async () => {
      try {
        const user = await authUtils.getUser();
        if (!isMounted) return;

        if (!user) {
          router.push("/login");
          return;
        }

        if (user.role !== "EMPLOYER") {
          router.push("/dashboard");
          return;
        }

        setCurrentUser(user);

        const jobsData = await api.get(`/jobs/employer/${user.id}`);
        if (isMounted) {
          setJobs(Array.isArray(jobsData) ? jobsData : []);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || "Failed to load employer jobs.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadEmployerData();

    return () => {
      isMounted = false;
    };
  }, [router]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setJobForm((prev) => ({ ...prev, [name]: value }));
  };

  const openCreateModal = () => {
    setJobForm({
      title: "",
      description: "",
      companyName: currentUser?.name || "",
      location: "",
      salary: "",
      jobType: "FULL_TIME",
      experience: "",
      skills: "",
    });
    setFormError("");
    setShowCreateModal(true);
  };

  const handleCreateJob = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!jobForm.title || !jobForm.description || !jobForm.companyName || !jobForm.location || !jobForm.jobType) {
      setFormError("Title, Description, Company Name, Location, and Job Type are required.");
      return;
    }

    setIsSubmitting(true);

    try {
      const newJob = await api.post("/jobs", {
        title: jobForm.title,
        description: jobForm.description,
        companyName: jobForm.companyName,
        location: jobForm.location,
        salary: jobForm.salary,
        jobType: jobForm.jobType,
        experience: jobForm.experience,
        skills: jobForm.skills,
      });

      setJobs((prev) => [newJob, ...prev]);
      setShowCreateModal(false);
      setSuccessMessage("Job posted successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      setFormError(err.message || "Failed to create job.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditModal = (job) => {
    setSelectedJob(job);
    setJobForm({
      title: job.title || "",
      description: job.description || "",
      companyName: job.companyName || job.company || "",
      location: job.location || "",
      salary: job.salary || "",
      jobType: job.jobType || "FULL_TIME",
      experience: job.experience || "",
      skills: job.skills || "",
    });
    setFormError("");
    setShowEditModal(true);
  };

  const handleEditJob = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!jobForm.title || !jobForm.description || !jobForm.companyName || !jobForm.location || !jobForm.jobType) {
      setFormError("Title, Description, Company Name, Location, and Job Type are required.");
      return;
    }

    setIsSubmitting(true);

    try {
      const updatedJob = await api.put(`/jobs/${selectedJob.id}`, {
        title: jobForm.title,
        description: jobForm.description,
        companyName: jobForm.companyName,
        location: jobForm.location,
        salary: jobForm.salary,
        jobType: jobForm.jobType,
        experience: jobForm.experience,
        skills: jobForm.skills,
      });

      setJobs((prev) => prev.map((j) => (j.id === selectedJob.id ? updatedJob : j)));
      setShowEditModal(false);
      setSuccessMessage("Job updated successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      setFormError(err.message || "Failed to update job.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteJob = async (jobId) => {
    const confirmed = window.confirm("Are you sure you want to delete this job posting?");
    if (!confirmed) return;

    try {
      await api.delete(`/jobs/${jobId}`);
      setJobs((prev) => prev.filter((j) => j.id !== jobId));
      setSuccessMessage("Job deleted successfully.");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      if (err.status === 403) {
        alert("You do not have permission to delete this job.");
      } else if (err.status === 404) {
        alert("Job not found.");
        setJobs((prev) => prev.filter((j) => j.id !== jobId));
      } else {
        alert(err.message || "Failed to delete job.");
      }
    }
  };

  const openApplicationsModal = async (job) => {
    setSelectedJob(job);
    setShowAppsModal(true);
    setIsAppsLoading(true);
    setApplications([]);

    try {
      const data = await api.get(`/jobs/${job.id}/applications`);
      setApplications(Array.isArray(data) ? data : []);
    } catch (err) {
      alert(err.message || "Failed to load applications for this job.");
    } finally {
      setIsAppsLoading(false);
    }
  };

  const handleUpdateStatus = async (appId, currentStatus, newStatus) => {
    try {
      const updatedApp = await api.patch(`/applications/${appId}/status`, { status: newStatus });
      setApplications((prev) =>
        prev.map((app) => (app.id === appId ? updatedApp : app))
      );
    } catch (err) {
      alert(err.message || "Failed to update status.");
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 font-sans text-slate-900">
      <Navbar />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Employer Dashboard</h1>
            <p className="text-slate-500 mt-1">Manage your posted jobs and review job applications.</p>
          </div>
          <button 
            type="button" 
            onClick={openCreateModal}
            className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 bg-blue-600 text-white hover:bg-blue-700 h-10 px-4 py-2 shadow-sm"
          >
            + Post New Job
          </button>
        </div>

        {successMessage && (
          <div className="mb-6 rounded-md bg-green-50 p-4 border border-green-200">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm font-medium text-green-800">{successMessage}</p>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 rounded-md bg-red-50 p-4 border border-red-200">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm font-medium text-red-800">{error}</p>
              </div>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="rounded-lg border border-slate-200 bg-white shadow-sm p-8 text-center text-slate-500">
            Loading your job listings...
          </div>
        ) : jobs.length === 0 ? (
          <div className="rounded-lg border border-slate-200 bg-white shadow-sm p-12 text-center flex flex-col items-center">
            <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center mb-4">
              <span className="text-xl">💼</span>
            </div>
            <h3 className="text-lg font-semibold text-slate-900">No Jobs Posted Yet</h3>
            <p className="text-slate-500 mt-1 max-w-sm">You haven't posted any jobs. Get started by creating your first job opening to attract top talent.</p>
            <button 
              type="button" 
              onClick={openCreateModal} 
              className="mt-6 inline-flex items-center justify-center rounded-md text-sm font-medium border border-slate-200 bg-white hover:bg-slate-100 hover:text-slate-900 h-10 px-4 py-2 shadow-sm"
            >
              + Create Job
            </button>
          </div>
        ) : (
          <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 text-xs uppercase font-medium tracking-wider">
                  <tr>
                    <th className="h-12 px-6 align-middle">Job Title</th>
                    <th className="h-12 px-6 align-middle">Location</th>
                    <th className="h-12 px-6 align-middle">Type</th>
                    <th className="h-12 px-6 align-middle">Posted</th>
                    <th className="h-12 px-6 align-middle text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {jobs.map((job) => (
                    <tr key={job.id} className="transition-colors hover:bg-slate-50/50 bg-white">
                      <td className="p-6 align-middle">
                        <div className="font-semibold text-slate-900 text-base">{job.title}</div>
                        <div className="text-sm text-blue-600 mt-1">{job.companyName || job.company}</div>
                      </td>
                      <td className="p-6 align-middle text-slate-600">{job.location}</td>
                      <td className="p-6 align-middle">
                        <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                          {formatJobType(job.jobType || job.type)}
                        </span>
                      </td>
                      <td className="p-6 align-middle text-slate-500">
                        {job.createdAt ? new Date(job.createdAt).toLocaleDateString() : "Recently"}
                      </td>
                      <td className="p-6 align-middle">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => openApplicationsModal(job)}
                            className="inline-flex items-center justify-center rounded-md text-xs font-medium border border-slate-200 bg-white hover:bg-slate-100 text-slate-900 h-8 px-3 shadow-sm transition-colors"
                          >
                            Applicants
                          </button>
                          <button
                            onClick={() => openEditModal(job)}
                            className="inline-flex items-center justify-center rounded-md text-xs font-medium border border-slate-200 bg-white hover:bg-slate-100 text-slate-900 h-8 px-3 shadow-sm transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteJob(job.id)}
                            className="inline-flex items-center justify-center rounded-md text-xs font-medium border border-red-200 bg-white text-red-600 hover:bg-red-50 h-8 px-3 shadow-sm transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      <Footer />

      {/* Create Job Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex flex-col space-y-1.5 p-6 border-b border-slate-100 bg-white">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold leading-none tracking-tight text-slate-900">Post a New Job</h2>
                <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
              </div>
              <p className="text-sm text-slate-500">Fill out the details below to create a new job listing.</p>
            </div>

            <div className="overflow-y-auto p-6 bg-slate-50/30">
              {formError && (
                <div className="mb-6 rounded-md bg-red-50 p-4 border border-red-200 text-sm font-medium text-red-800">
                  {formError}
                </div>
              )}

              <form id="createJobForm" onSubmit={handleCreateJob} className="flex flex-col gap-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-900">Job Title <span className="text-red-500">*</span></label>
                    <input name="title" value={jobForm.title} onChange={handleInputChange} placeholder="e.g. Senior React Developer" required 
                      className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-shadow" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-900">Company Name <span className="text-red-500">*</span></label>
                    <input name="companyName" value={jobForm.companyName} onChange={handleInputChange} placeholder="e.g. Acme Corp" required 
                      className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-shadow" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-900">Location <span className="text-red-500">*</span></label>
                    <input name="location" value={jobForm.location} onChange={handleInputChange} placeholder="e.g. Remote, or New York, NY" required 
                      className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-shadow" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-900">Job Type <span className="text-red-500">*</span></label>
                    <select name="jobType" value={jobForm.jobType} onChange={handleInputChange} required 
                      className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-shadow">
                      <option value="FULL_TIME">Full Time</option>
                      <option value="PART_TIME">Part Time</option>
                      <option value="INTERNSHIP">Internship</option>
                      <option value="CONTRACT">Contract</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-900">Salary Range</label>
                    <input name="salary" value={jobForm.salary} onChange={handleInputChange} placeholder="e.g. $100k - $120k" 
                      className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-shadow" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-900">Experience Level</label>
                    <input name="experience" value={jobForm.experience} onChange={handleInputChange} placeholder="e.g. 3-5 years" 
                      className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-shadow" />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium text-slate-900">Required Skills</label>
                    <input name="skills" value={jobForm.skills} onChange={handleInputChange} placeholder="e.g. React, Node.js, TypeScript" 
                      className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-shadow" />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium text-slate-900">Job Description <span className="text-red-500">*</span></label>
                    <textarea name="description" value={jobForm.description} onChange={handleInputChange} placeholder="Provide a detailed description of the role, responsibilities, and benefits..." rows="6" required 
                      className="flex w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-shadow resize-y" />
                  </div>
                </div>
              </form>
            </div>
            
            <div className="flex justify-end gap-3 p-6 border-t border-slate-100 bg-slate-50 rounded-b-lg">
              <button type="button" onClick={() => setShowCreateModal(false)} disabled={isSubmitting} className="inline-flex items-center justify-center rounded-md text-sm font-medium border border-slate-200 bg-white hover:bg-slate-100 hover:text-slate-900 h-10 px-4 py-2 shadow-sm transition-colors">
                Cancel
              </button>
              <button type="submit" form="createJobForm" disabled={isSubmitting} className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 h-10 px-4 py-2 shadow-sm transition-colors disabled:opacity-50">
                {isSubmitting ? "Posting..." : "Post Job"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Job Modal */}
      {showEditModal && selectedJob && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex flex-col space-y-1.5 p-6 border-b border-slate-100 bg-white">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold leading-none tracking-tight text-slate-900">Edit Job Posting</h2>
                <button onClick={() => setShowEditModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
              </div>
            </div>

            <div className="overflow-y-auto p-6 bg-slate-50/30">
              {formError && (
                <div className="mb-6 rounded-md bg-red-50 p-4 border border-red-200 text-sm font-medium text-red-800">
                  {formError}
                </div>
              )}

              <form id="editJobForm" onSubmit={handleEditJob} className="flex flex-col gap-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Same exact grid structure as create form */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-900">Job Title <span className="text-red-500">*</span></label>
                    <input name="title" value={jobForm.title} onChange={handleInputChange} required 
                      className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 transition-shadow" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-900">Company Name <span className="text-red-500">*</span></label>
                    <input name="companyName" value={jobForm.companyName} onChange={handleInputChange} required 
                      className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 transition-shadow" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-900">Location <span className="text-red-500">*</span></label>
                    <input name="location" value={jobForm.location} onChange={handleInputChange} required 
                      className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 transition-shadow" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-900">Job Type <span className="text-red-500">*</span></label>
                    <select name="jobType" value={jobForm.jobType} onChange={handleInputChange} required 
                      className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 transition-shadow">
                      <option value="FULL_TIME">Full Time</option>
                      <option value="PART_TIME">Part Time</option>
                      <option value="INTERNSHIP">Internship</option>
                      <option value="CONTRACT">Contract</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-900">Salary Range</label>
                    <input name="salary" value={jobForm.salary} onChange={handleInputChange} 
                      className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 transition-shadow" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-900">Experience Level</label>
                    <input name="experience" value={jobForm.experience} onChange={handleInputChange} 
                      className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 transition-shadow" />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium text-slate-900">Required Skills</label>
                    <input name="skills" value={jobForm.skills} onChange={handleInputChange} 
                      className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 transition-shadow" />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium text-slate-900">Job Description <span className="text-red-500">*</span></label>
                    <textarea name="description" value={jobForm.description} onChange={handleInputChange} rows="6" required 
                      className="flex w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 transition-shadow resize-y" />
                  </div>
                </div>
              </form>
            </div>
            
            <div className="flex justify-end gap-3 p-6 border-t border-slate-100 bg-slate-50 rounded-b-lg">
              <button type="button" onClick={() => setShowEditModal(false)} disabled={isSubmitting} className="inline-flex items-center justify-center rounded-md text-sm font-medium border border-slate-200 bg-white hover:bg-slate-100 hover:text-slate-900 h-10 px-4 py-2 shadow-sm transition-colors">
                Cancel
              </button>
              <button type="submit" form="editJobForm" disabled={isSubmitting} className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 h-10 px-4 py-2 shadow-sm transition-colors disabled:opacity-50">
                {isSubmitting ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Applications Modal */}
      {showAppsModal && selectedJob && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col border border-slate-200 overflow-hidden">
            <div className="flex flex-col space-y-1.5 p-6 border-b border-slate-100 bg-white">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold leading-none tracking-tight text-slate-900">Applicants for {selectedJob.title}</h2>
                <button onClick={() => setShowAppsModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
              </div>
            </div>

            <div className="overflow-y-auto p-6 bg-slate-50/50 h-full">
              {isAppsLoading ? (
                <div className="flex justify-center p-8 text-slate-500">Loading applications...</div>
              ) : applications.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-slate-200 rounded-lg">
                  <p className="text-slate-500 font-medium">No candidates have applied to this position yet.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {applications.map((app) => (
                    <div key={app.id} className="bg-white rounded-lg border border-slate-200 shadow-sm p-5 transition-shadow hover:shadow-md">
                      <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4 border-b border-slate-100 pb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-slate-900">{app.applicantName}</h3>
                          <div className="text-sm text-slate-500 mt-1 flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                            {app.applicantEmail}
                          </div>
                          <div className="text-xs text-slate-400 mt-2">
                            Applied: {new Date(app.appliedAt).toLocaleString()}
                          </div>
                        </div>
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold
                          ${app.status === "HIRED" ? "bg-green-100 text-green-800" : 
                            app.status === "SHORTLISTED" ? "bg-yellow-100 text-yellow-800" : 
                            app.status === "REJECTED" ? "bg-red-100 text-red-800" : 
                            "bg-slate-100 text-slate-800"}`}>
                          {app.status}
                        </span>
                      </div>

                      <div className="mb-4">
                        <p className="text-sm font-semibold text-slate-900 mb-2">Cover Letter</p>
                        <div className="bg-slate-50 rounded-md p-4 text-sm text-slate-700 whitespace-pre-wrap border border-slate-100">
                          {app.coverLetter || <span className="text-slate-400 italic">No cover letter provided.</span>}
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-2">
                        {app.status === "APPLIED" && (
                          <>
                            <button onClick={() => handleUpdateStatus(app.id, app.status, "SHORTLISTED")} className="inline-flex items-center justify-center rounded-md text-xs font-medium border border-slate-200 bg-white hover:bg-slate-100 text-slate-900 h-8 px-3 transition-colors">
                              Shortlist
                            </button>
                            <button onClick={() => handleUpdateStatus(app.id, app.status, "REJECTED")} className="inline-flex items-center justify-center rounded-md text-xs font-medium border border-red-200 bg-white text-red-600 hover:bg-red-50 h-8 px-3 transition-colors">
                              Reject
                            </button>
                          </>
                        )}

                        {app.status === "SHORTLISTED" && (
                          <>
                            <button onClick={() => handleUpdateStatus(app.id, app.status, "HIRED")} className="inline-flex items-center justify-center rounded-md text-xs font-medium bg-green-600 text-white hover:bg-green-700 h-8 px-3 transition-colors">
                              Hire Candidate
                            </button>
                            <button onClick={() => handleUpdateStatus(app.id, app.status, "REJECTED")} className="inline-flex items-center justify-center rounded-md text-xs font-medium border border-red-200 bg-white text-red-600 hover:bg-red-50 h-8 px-3 transition-colors">
                              Reject
                            </button>
                          </>
                        )}

                        {app.status === "REJECTED" && (
                          <span className="text-sm text-slate-500 italic">Application Rejected</span>
                        )}

                        {app.status === "HIRED" && (
                          <span className="text-sm font-medium text-green-600 flex items-center gap-1">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                            Hired
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import SearchBar from "../components/SearchBar";
import JobCard from "../components/JobCard";
import Filters from "../components/Filters";
import Navbar from "../components/NavBar";
import Footer from "../components/Footer";
import jobsData from "../data/jobs";
import { authUtils } from "../utils/auth";

export default function Dashboard() {
  const router = useRouter();

  useEffect(() => {
    // Redirect if not authenticated
    if (!authUtils.isAuthenticated()) {
      router.push("/login");
    }
  }, [router]);
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("");
  const [selectedTypes, setSelectedTypes] = useState([]);

  const filteredJobs = jobsData.filter((job) => {
    const searchText = search.toLowerCase();
    const matchesSearch =
      job.title.toLowerCase().includes(searchText) ||
      job.company.toLowerCase().includes(searchText);
    const matchesLocation = location ? job.location === location : true;
    const matchesType = selectedTypes.length > 0 ? selectedTypes.includes(job.type) : true;

    return (
      matchesSearch &&
      matchesLocation &&
      matchesType
    );
  });

  return (
    <div className="page-shell">
      <Navbar />

      <main className="main-content container wide-container">
        <h1 className="page-title">Dashboard</h1>
        <p className="muted">Browse jobs, search by role/company, and open details.</p>

        <SearchBar search={search} setSearch={setSearch} />

        <section className="dashboard-grid">
          <Filters
            location={location}
            setLocation={setLocation}
            selectedTypes={selectedTypes}
            setSelectedTypes={setSelectedTypes}
          />

          <div>
            <h2 className="section-title">Available Jobs</h2>

            {filteredJobs.length === 0 ? (
              <div className="card">
                <p>No jobs found for this search.</p>
              </div>
            ) : (
              <div className="jobs-grid">
                {filteredJobs.map((job) => (
                  <JobCard key={job.id} job={job} />
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

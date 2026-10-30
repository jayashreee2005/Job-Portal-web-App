import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import SearchBar from "../components/SearchBar";
import JobCard from "../components/JobCard";
import Filters from "../components/Filters";
import Navbar from "../components/NavBar";
import Footer from "../components/Footer";
import { api } from "../utils/api";
import { authUtils } from "../utils/auth";

function parseSalaryToLpa(salaryText) {
  const text = String(salaryText || "").toLowerCase().trim();

  if (!text) {
    return null;
  }

  if (text.includes("lpa")) {
    const parsed = parseFloat(text);
    return Number.isNaN(parsed) ? null : parsed;
  }

  if (text.includes("k/month") || text.includes("k per month")) {
    const parsed = parseFloat(text);
    if (Number.isNaN(parsed)) {
      return null;
    }
    return (parsed * 12) / 100;
  }

  return null;
}

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

export default function Dashboard() {
  const router = useRouter();
  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("");
  const [company, setCompany] = useState("");
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [minimumSalary, setMinimumSalary] = useState("");
  const [skillQuery, setSkillQuery] = useState("");
  const [remoteOnly, setRemoteOnly] = useState(false);
  const [sortBy, setSortBy] = useState("relevance");
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [lastUpdatedAt, setLastUpdatedAt] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const loadDashboard = async () => {
      try {
        const currentUser = await authUtils.getUser();
        if (!currentUser) {
          router.push("/login");
          return;
        }

        const jobsPayload = await api.get("/jobs");
        const jobList = Array.isArray(jobsPayload) ? jobsPayload : jobsPayload.jobs || [];

        if (!isMounted) {
          return;
        }

        setJobs(jobList);
        setLastUpdatedAt(new Date());
      } catch (error) {
        if (isMounted) {
          setJobs([]);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadDashboard();

    const pollingTimer = setInterval(() => {
      loadDashboard();
    }, 30000);

    return () => {
      isMounted = false;
      clearInterval(pollingTimer);
    };
  }, [router]);

  const locations = [...new Set(jobs.map((job) => job.location).filter(Boolean))];
  const companies = [...new Set(jobs.map((job) => job.companyName || job.company).filter(Boolean))];

  const minimumSalaryValue = Number(minimumSalary);
  const hasSalaryFilter = !Number.isNaN(minimumSalaryValue) && minimumSalary !== "";

  const filteredJobs = jobs.filter((job) => {
    const searchText = search.toLowerCase();
    const skillText = skillQuery.toLowerCase();
    const salaryInLpa = parseSalaryToLpa(job.salary);
    const companyName = (job.companyName || job.company || "").toLowerCase();
    const jobType = job.jobType || job.type || "";
    const skillsString = (job.skills || (Array.isArray(job.requirements) ? job.requirements.join(",") : "")).toLowerCase();

    const matchesSearch =
      job.title.toLowerCase().includes(searchText) ||
      companyName.includes(searchText);

    const matchesLocation = location ? job.location === location : true;
    const matchesCompany = company ? (job.companyName || job.company) === company : true;

    const matchesType = selectedTypes.length > 0 ? selectedTypes.includes(jobType) || selectedTypes.includes(formatJobType(jobType)) : true;

    const matchesSalary = hasSalaryFilter
      ? salaryInLpa !== null && salaryInLpa >= minimumSalaryValue
      : true;

    const matchesSkill = skillText
      ? skillsString.includes(skillText)
      : true;

    const matchesRemote = remoteOnly ? String(job.location).toLowerCase() === "remote" : true;

    return (
      matchesSearch &&
      matchesLocation &&
      matchesCompany &&
      matchesType &&
      matchesSalary &&
      matchesSkill &&
      matchesRemote
    );
  });

  const sortedJobs = [...filteredJobs].sort((first, second) => {
    if (sortBy === "salaryHighToLow") {
      return (parseSalaryToLpa(second.salary) || 0) - (parseSalaryToLpa(first.salary) || 0);
    }

    if (sortBy === "salaryLowToHigh") {
      return (parseSalaryToLpa(first.salary) || 0) - (parseSalaryToLpa(second.salary) || 0);
    }

    if (sortBy === "titleAZ") {
      return String(first.title).localeCompare(String(second.title));
    }

    if (sortBy === "companyAZ") {
      const c1 = first.companyName || first.company || "";
      const c2 = second.companyName || second.company || "";
      return String(c1).localeCompare(String(c2));
    }

    if (sortBy === "latest") {
      return Number(second.id) - Number(first.id);
    }

    return 0;
  });

  const remoteCount = sortedJobs.filter(
    (job) => String(job.location).toLowerCase() === "remote"
  ).length;
  const fullTimeCount = sortedJobs.filter((job) => (job.jobType || job.type) === "FULL_TIME" || (job.jobType || job.type) === "Full Time").length;
  const avgSalary = (() => {
    const salaryValues = sortedJobs
      .map((job) => parseSalaryToLpa(job.salary))
      .filter((value) => value !== null);

    if (salaryValues.length === 0) {
      return null;
    }

    const total = salaryValues.reduce((sum, value) => sum + value, 0);
    return (total / salaryValues.length).toFixed(1);
  })();

  const activeFilterChips = [];
  if (location) activeFilterChips.push(`Location: ${location}`);
  if (company) activeFilterChips.push(`Company: ${company}`);
  if (selectedTypes.length > 0) activeFilterChips.push(`Types: ${selectedTypes.join(", ")}`);
  if (minimumSalary) activeFilterChips.push(`Min salary: ${minimumSalary} LPA`);
  if (skillQuery) activeFilterChips.push(`Skill: ${skillQuery}`);
  if (remoteOnly) activeFilterChips.push("Remote only");
  if (sortBy !== "relevance") activeFilterChips.push(`Sort: ${sortBy}`);

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 font-sans text-slate-900">
      <Navbar />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Dashboard</h1>
          <p className="text-slate-500 mt-1">Browse jobs, search by role/company, and open details.</p>
        </div>

        {isLoading ? (
          <div className="rounded-lg border border-slate-200 bg-white shadow-sm p-8 text-center text-slate-500">
            Loading jobs...
          </div>
        ) : (
          <>
            <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <article className="rounded-xl border border-slate-200 bg-white shadow-sm p-6 flex flex-col justify-center items-center text-center">
                <p className="text-sm font-medium text-slate-500 mb-1">Filtered Jobs</p>
                <h3 className="text-3xl font-bold tracking-tight text-slate-900">{sortedJobs.length}</h3>
              </article>
              <article className="rounded-xl border border-slate-200 bg-white shadow-sm p-6 flex flex-col justify-center items-center text-center">
                <p className="text-sm font-medium text-slate-500 mb-1">Remote Matches</p>
                <h3 className="text-3xl font-bold tracking-tight text-blue-600">{remoteCount}</h3>
              </article>
              <article className="rounded-xl border border-slate-200 bg-white shadow-sm p-6 flex flex-col justify-center items-center text-center">
                <p className="text-sm font-medium text-slate-500 mb-1">Full Time Roles</p>
                <h3 className="text-3xl font-bold tracking-tight text-slate-900">{fullTimeCount}</h3>
              </article>
              <article className="rounded-xl border border-slate-200 bg-white shadow-sm p-6 flex flex-col justify-center items-center text-center">
                <p className="text-sm font-medium text-slate-500 mb-1">Avg Salary</p>
                <h3 className="text-2xl font-bold tracking-tight text-emerald-600 mt-1">{avgSalary ? `${avgSalary} LPA` : "N/A"}</h3>
              </article>
            </section>

            <div className="mb-8">
              <SearchBar search={search} setSearch={setSearch} />
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 lg:hidden">
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-md text-sm font-medium border border-slate-200 bg-white hover:bg-slate-100 text-slate-900 h-10 px-4 py-2 shadow-sm transition-colors"
                onClick={() => setIsFilterDrawerOpen(true)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
                Filter Options
              </button>
            </div>

            <div className="flex justify-between items-center mb-4">
              <div className="flex flex-wrap gap-2">
                {activeFilterChips.map((chip) => (
                  <span key={chip} className="inline-flex items-center rounded-full border border-slate-200 bg-white px-2.5 py-0.5 text-xs font-semibold text-slate-700 shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2">
                    {chip}
                  </span>
                ))}
              </div>
              <p className="text-sm text-slate-500 hidden sm:block">
                Live results: <span className="font-medium text-slate-900">{sortedJobs.length}</span> jobs
                {lastUpdatedAt ? ` • Updated ${lastUpdatedAt.toLocaleTimeString()}` : ""}
              </p>
            </div>

            <section className="flex flex-col lg:flex-row gap-8 items-start">
              {/* Sidebar Filters */}
              <aside className={`w-full lg:w-72 flex-shrink-0 ${isFilterDrawerOpen ? 'fixed inset-y-0 left-0 z-50 bg-white p-6 shadow-2xl overflow-y-auto w-80 transition-transform duration-300 transform translate-x-0' : 'hidden lg:block'}`}>
                {isFilterDrawerOpen && (
                  <div className="flex justify-between items-center mb-6 lg:hidden">
                    <h2 className="text-lg font-semibold">Filters</h2>
                    <button onClick={() => setIsFilterDrawerOpen(false)} className="p-2 text-slate-500 hover:text-slate-900">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                  </div>
                )}
                
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 sticky top-24">
                  <Filters
                    locations={locations}
                    companies={companies}
                    location={location}
                    setLocation={setLocation}
                    company={company}
                    setCompany={setCompany}
                    selectedTypes={selectedTypes}
                    setSelectedTypes={setSelectedTypes}
                    minimumSalary={minimumSalary}
                    setMinimumSalary={setMinimumSalary}
                    skillQuery={skillQuery}
                    setSkillQuery={setSkillQuery}
                    remoteOnly={remoteOnly}
                    setRemoteOnly={setRemoteOnly}
                    sortBy={sortBy}
                    setSortBy={setSortBy}
                    onCloseMobile={() => setIsFilterDrawerOpen(false)}
                    isMobileOpen={isFilterDrawerOpen}
                  />
                </div>
              </aside>

              {/* Main Feed */}
              <div className="flex-1 min-w-0 w-full">
                <h2 className="text-xl font-semibold tracking-tight text-slate-900 mb-6 lg:hidden">Available Jobs</h2>

                {sortedJobs.length === 0 ? (
                  <div className="rounded-lg border border-slate-200 border-dashed bg-white shadow-sm p-12 flex flex-col items-center justify-center text-center">
                    <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center mb-4 text-slate-400">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900">No jobs found</h3>
                    <p className="text-slate-500 mt-1 max-w-sm">We couldn't find any jobs matching your current search and filters. Try adjusting them.</p>
                    <button onClick={() => {
                      setSearch(""); setLocation(""); setCompany(""); setSelectedTypes([]); setMinimumSalary(""); setSkillQuery(""); setRemoteOnly(false);
                    }} className="mt-4 text-sm font-medium text-blue-600 hover:text-blue-700">
                      Clear all filters
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
                    {sortedJobs.map((job) => (
                      <JobCard key={job.id} job={job} />
                    ))}
                  </div>
                )}
              </div>
            </section>

            {isFilterDrawerOpen && (
              <div
                className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden"
                onClick={() => setIsFilterDrawerOpen(false)}
                aria-hidden="true"
              />
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}

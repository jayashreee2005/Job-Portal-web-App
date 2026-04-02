import Link from "next/link";

export default function JobCard({ job }) {
     return (
          <article className="card job-card">
               <h4>{job.title}</h4>
               <p>{job.company}</p>
               <p>{job.location}</p>
               <p>{job.type}</p>
               <p className="salary">{job.salary}</p>

               <Link href={`/jobs/${job.id}`} className="button link-button">
                    View Details
               </Link>
          </article>
     );
}

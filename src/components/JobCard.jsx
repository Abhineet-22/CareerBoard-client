import { useNavigate } from 'react-router-dom';
import '../App.css';

export default function JobCard({ job }) {
  const navigate = useNavigate();

  return (
    <div className={`job-card ${job.featured ? 'featured' : ''}`}>
      <div className="job-top">
        <div className="company-row">
          <div className="company-logo">
            {job.companyName.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <div className="job-title">{job.jobTitle}</div>
            <div className="job-company">{job.companyName}</div>
          </div>
        </div>
      </div>

      <p className="job-desc">{job.description}</p>

      <div className="job-tags">
        <span className="tag tag-exp">{job.experienceLevel}</span>
        <span className="tag tag-type">{job.jobType}</span>
        {job.workArrangement === 'Remote' && (
          <span className="tag tag-remote">Remote</span>
        )}
        {job.skills.slice(0, 3).map((skill) => (
          <span key={skill} className="tag">{skill}</span>
        ))}
      </div>

      <div className="job-footer">
        <span className="job-location">{job.location}</span>
        <div className="job-footer-right">
          {job.salaryMin && job.salaryMax && (
            <span className="job-salary">
              ₹{job.salaryMin} to ₹{job.salaryMax} LPA
            </span>
          )}
          <span className="job-posted">
            {new Date(job.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
          </span>
          <button
            type="button"
            onClick={() => navigate(`/apply/${job._id}`)}
            className="btn btn-primary"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}

export default function JobList({ jobs }) {
  return (
    <ul>
      {jobs.map((job, idx) => (
        <li key={idx}>
          <span>{job.message}</span>
          <span>[{job.status}]</span>
        </li>
      ))}
    </ul>
  );
}

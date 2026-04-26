import { useParams } from 'react-router-dom';

export default function JobDetail() {
  const { id } = useParams();
  
  return (
    <div className="container mt-4 mb-4">
      <h1 className="text-navy mb-4">Job Detail: {id}</h1>
      <p className="text-secondary">This page will display full details and bidding options for a specific job.</p>
    </div>
  );
}

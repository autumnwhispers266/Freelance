import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { BookmarkX, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import { featuredJobs } from '../data/jobs';
import { getSavedJobs, toggleSaveJob } from '../utils/jobState';
import { sortJobs, mergeWithApplicationState } from '../utils/jobEngine';
import JobCard from '../components/JobCard';

export default function SavedItemsPage() {
  const [user, setUser] = useState(null);
  const [renderTrigger, setRenderTrigger] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) setUser(data.user);
      else navigate('/login');
    });
  }, [navigate]);

  const savedMap = getSavedJobs();
  const savedIds = Object.keys(savedMap);
  const savedJobsFull = featuredJobs.filter(j => savedIds.includes(String(j.id)));
  const mergedJobs = mergeWithApplicationState(sortJobs(savedJobsFull));

  const handleRemove = (jobId) => {
    toggleSaveJob(jobId);
    toast.success('Removed from saved items');
    setRenderTrigger(t => t + 1);
  };

  return (
    <div className="w-full">
      <div className="mb-4">
        <h1 className="text-navy flex items-center gap-2" style={{ fontSize: '2rem' }}>
          <BookmarkX size={28} /> Saved Items
        </h1>
        <p className="text-secondary mt-1">Keep track of jobs you're interested in.</p>
      </div>

      {mergedJobs.length === 0 ? (
        <div className="card flex flex-col items-center justify-center p-8 text-center" style={{ minHeight: '400px', background: 'linear-gradient(180deg, var(--bg-surface) 0%, var(--bg-hover) 100%)', border: '1px dashed var(--border-active)' }}>
          <div style={{ width: '80px', height: '80px', backgroundColor: 'rgba(27, 42, 74, 0.06)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
            <Search size={36} style={{ color: 'var(--accent-navy)', opacity: 0.7 }} />
          </div>
          <h3 className="text-navy mb-2" style={{ fontSize: '1.5rem', fontWeight: 800 }}>Your saved items will appear here</h3>
          <p className="text-secondary mb-6 mx-auto" style={{ maxWidth: '450px', lineHeight: '1.6' }}>
            You haven't bookmarked any opportunities yet. When you find a job you like, click the heart icon to save it for later review.
          </p>
          <button className="btn btn-primary" style={{ padding: '12px 28px', fontSize: '1rem', borderRadius: '30px' }} onClick={() => navigate('/jobs')}>
            Explore Opportunities
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
          {mergedJobs.map(job => (
            <JobCard
              key={job.id}
              job={job}
              user={user}
              showRemove={true}
              onRemove={handleRemove}
              onApplicationUpdate={() => setRenderTrigger(t => t + 1)}
              onSaveUpdate={() => setRenderTrigger(t => t + 1)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

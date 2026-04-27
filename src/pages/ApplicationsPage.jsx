import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { Briefcase, Clock, FileText, Search } from 'lucide-react';
import { featuredJobs } from '../data/jobs';
import { getAppliedJobs } from '../utils/jobState';
import { sortJobs, mergeWithApplicationState } from '../utils/jobEngine';
import JobCard from '../components/JobCard';

export default function ApplicationsPage() {
  const [user, setUser] = useState(null);
  const [renderTrigger, setRenderTrigger] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) setUser(data.user);
      else navigate('/login');
    });
  }, [navigate]);

  const appliedMap = getAppliedJobs();
  const appliedIds = Object.keys(appliedMap);

  // Get full job objects for applied jobs
  const appliedJobsFull = featuredJobs.filter(j => appliedIds.includes(String(j.id)));
  const mergedJobs = mergeWithApplicationState(sortJobs(appliedJobsFull));

  // Separate by status
  const pendingJobs = mergedJobs.filter(j => j.appliedStatus === 'pending');
  const acceptedJobs = mergedJobs.filter(j => j.appliedStatus === 'accepted');
  const rejectedJobs = mergedJobs.filter(j => j.appliedStatus === 'rejected');

  return (
    <div className="w-full">
      <div className="mb-4">
        <h1 className="text-navy flex items-center gap-2" style={{ fontSize: '2rem' }}>
          <FileText size={28} /> My Applications
        </h1>
        <p className="text-secondary mt-1">Track the status of all your job applications.</p>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '32px' }}>
        <div className="card p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="text-secondary" style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase' }}>Active</div>
            <Clock size={18} className="text-amber" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800 }}>{pendingJobs.length}</div>
        </div>
        <div className="card p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="text-secondary" style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase' }}>Accepted</div>
            <Briefcase size={18} className="text-green" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800 }}>{acceptedJobs.length}</div>
        </div>
        <div className="card p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="text-secondary" style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase' }}>Total</div>
            <FileText size={18} className="text-navy" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800 }}>{mergedJobs.length}</div>
        </div>
      </div>

      {mergedJobs.length === 0 ? (
        <div className="card flex flex-col items-center justify-center p-8 text-center" style={{ minHeight: '400px', background: 'linear-gradient(180deg, var(--bg-surface) 0%, var(--bg-hover) 100%)', border: '1px dashed var(--border-active)' }}>
          <div style={{ width: '80px', height: '80px', backgroundColor: 'rgba(27, 42, 74, 0.06)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
            <Search size={36} style={{ color: 'var(--accent-navy)', opacity: 0.7 }} />
          </div>
          <h3 className="text-navy mb-2" style={{ fontSize: '1.5rem', fontWeight: 800 }}>No applications yet</h3>
          <p className="text-secondary mb-6 mx-auto" style={{ maxWidth: '400px', lineHeight: '1.6' }}>
            You haven't applied to any jobs yet. Browse opportunities and submit your first application.
          </p>
          <button className="btn btn-primary" style={{ padding: '12px 28px', fontSize: '1rem', borderRadius: '30px' }} onClick={() => navigate('/jobs')}>
            Explore Opportunities
          </button>
        </div>
      ) : (
        <>
          {/* Active Applications */}
          {pendingJobs.length > 0 && (
            <div className="mb-4">
              <h2 className="text-navy mb-3 flex items-center gap-2" style={{ fontSize: '1.25rem' }}>
                <Clock size={20} className="text-amber" /> Active Applications
                <span className="badge badge-amber" style={{ borderRadius: '9999px', fontSize: '0.75rem' }}>{pendingJobs.length}</span>
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
                {pendingJobs.map(job => (
                  <JobCard key={job.id} job={job} user={user} onApplicationUpdate={() => setRenderTrigger(t => t + 1)} />
                ))}
              </div>
            </div>
          )}

          {/* Accepted */}
          {acceptedJobs.length > 0 && (
            <div className="mb-4">
              <h2 className="text-navy mb-3 flex items-center gap-2" style={{ fontSize: '1.25rem' }}>
                <Briefcase size={20} className="text-green" /> Accepted
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
                {acceptedJobs.map(job => (
                  <JobCard key={job.id} job={job} user={user} onApplicationUpdate={() => setRenderTrigger(t => t + 1)} />
                ))}
              </div>
            </div>
          )}

          {/* Rejected */}
          {rejectedJobs.length > 0 && (
            <div className="mb-4">
              <h2 className="text-navy mb-3 flex items-center gap-2" style={{ fontSize: '1.25rem' }}>
                Rejected
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
                {rejectedJobs.map(job => (
                  <JobCard key={job.id} job={job} user={user} onApplicationUpdate={() => setRenderTrigger(t => t + 1)} />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

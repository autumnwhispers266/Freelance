import { useState } from 'react';
import { Heart } from 'lucide-react';
import toast from 'react-hot-toast';
import { saveAppliedJob, isJobApplied, toggleSaveJob } from '../utils/jobState';

export default function JobCard({ job, user, onApplicationUpdate, onSaveUpdate, showRemove, onRemove }) {
  const [isApplying, setIsApplying] = useState(false);
  const [saved, setSaved] = useState(job.isSaved || false);
  const appliedStatus = job.appliedStatus;

  const handleApply = async () => {
    if (!user) {
      toast.error('Login required to apply');
      return;
    }
    if (isJobApplied(job.id)) {
      toast.error('You already applied to this job');
      return;
    }

    setIsApplying(true);
    await new Promise(resolve => setTimeout(resolve, 800));

    saveAppliedJob(job.id);
    toast.success('Application submitted');
    setIsApplying(false);

    if (onApplicationUpdate) onApplicationUpdate();
  };

  const handleSave = () => {
    if (!user) {
      toast.error('Login required to save jobs');
      return;
    }
    const nowSaved = toggleSaveJob(job.id);
    setSaved(nowSaved);
    toast.success(nowSaved ? 'Saved successfully' : 'Removed from saved');
    if (onSaveUpdate) onSaveUpdate();
  };

  return (
    <div className="card job-card p-4 hover-elevation transition-smooth flex flex-col h-full" style={{ position: 'relative' }}>
      {/* Save Heart Button */}
      <button
        onClick={handleSave}
        className="clickable"
        title={saved ? 'Remove from saved' : 'Save job'}
        style={{
          position: 'absolute', top: '16px', right: '16px',
          background: 'none', border: 'none', padding: '6px',
          borderRadius: '50%', zIndex: 2, transition: 'transform 0.2s ease'
        }}
      >
        <Heart
          size={20}
          fill={saved ? '#DC2626' : 'none'}
          color={saved ? '#DC2626' : 'var(--text-secondary)'}
          style={{ transition: 'all 0.2s ease' }}
        />
      </button>

      {/* Header: Category + Status + Budget */}
      <div className="mb-3 flex justify-between items-start" style={{ paddingRight: '32px' }}>
        <div className="flex flex-col gap-2">
          <span className="badge badge-grey" style={{ width: 'fit-content' }}>{job.category}</span>
          {appliedStatus === 'pending' && <span className="badge badge-amber" style={{ width: 'fit-content', borderRadius: '9999px', fontSize: '0.75rem' }}>Pending Verification</span>}
          {appliedStatus === 'accepted' && <span className="badge badge-green" style={{ width: 'fit-content', borderRadius: '9999px', fontSize: '0.75rem' }}>Accepted</span>}
          {appliedStatus === 'rejected' && <span className="badge badge-red" style={{ width: 'fit-content', borderRadius: '9999px', fontSize: '0.75rem' }}>Rejected</span>}
        </div>
        <div className="text-right">
          <div style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '1.125rem' }}>${job.budget}</div>
          <div className="text-secondary" style={{ fontSize: '0.75rem' }}>Payment: Monthly</div>
        </div>
      </div>

      {/* Title */}
      <h3 className="text-navy mb-2 line-clamp-1" style={{ fontSize: '1.25rem', lineHeight: '1.4' }} title={job.title}>
        {job.title}
      </h3>

      {/* Description */}
      <p className="text-secondary mb-4 line-clamp-2" style={{ flexGrow: 1, fontSize: '0.875rem' }}>
        {job.description}
      </p>

      {/* Skills */}
      <div className="flex flex-wrap gap-1 mb-4">
        {job.skills.slice(0, 3).map(skill => (
          <span key={skill} style={{ fontSize: '0.75rem', padding: '4px 10px', backgroundColor: 'var(--bg-hover)', borderRadius: '6px', color: 'var(--text-secondary)', fontWeight: 500 }}>
            {skill}
          </span>
        ))}
        {job.skills.length > 3 && (
          <span style={{ fontSize: '0.75rem', padding: '4px 10px', backgroundColor: 'var(--bg-hover)', borderRadius: '6px', color: 'var(--text-secondary)', fontWeight: 500 }}>
            +{job.skills.length - 3}
          </span>
        )}
      </div>

      {/* Footer: Applicants + Actions */}
      <div className="flex justify-between items-center mt-auto pt-4" style={{ borderTop: '1px solid var(--border-light)' }}>
        <div className="text-secondary" style={{ fontSize: '0.75rem' }}>
          {job.applicants + (appliedStatus ? 1 : 0)} applicants
        </div>
        <div className="flex items-center gap-2">
          {showRemove && onRemove && (
            <button
              className="btn btn-outline"
              style={{ padding: '8px 12px', fontSize: '0.8rem' }}
              onClick={() => onRemove(job.id)}
            >
              Remove
            </button>
          )}
          <button
            className="btn btn-primary"
            style={{
              padding: '8px 16px',
              fontSize: '0.875rem',
              backgroundColor: appliedStatus ? 'var(--text-secondary)' : '#0f172a',
              color: '#fff',
              opacity: appliedStatus || isApplying ? 0.7 : 1,
              cursor: (appliedStatus || isApplying) ? 'not-allowed' : 'pointer',
              pointerEvents: (appliedStatus || isApplying) ? 'none' : 'auto',
              transition: 'all 0.3s ease'
            }}
            onClick={handleApply}
            disabled={isApplying || !!appliedStatus}
          >
            {isApplying ? (
              <span className="flex items-center gap-2">
                <span className="apply-spinner"></span>
                Applying...
              </span>
            ) : appliedStatus === 'pending' ? 'Pending Verification'
              : appliedStatus === 'accepted' ? 'Accepted'
              : appliedStatus === 'rejected' ? 'Rejected'
              : 'Apply Now'}
          </button>
        </div>
      </div>
    </div>
  );
}

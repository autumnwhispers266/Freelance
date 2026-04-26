import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { Briefcase, MapPin, Heart, Trash2, BookmarkX } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SavedItemsPage() {
  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchSavedJobs();
  }, []);

  const fetchSavedJobs = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      navigate('/login');
      return;
    }

    // Fetch favorites for the user and join with jobs
    const { data, error } = await supabase
      .from('favorites')
      .select(`
        job_id,
        jobs (*)
      `)
      .eq('user_id', user.id);

    if (error) {
      toast.error('Error fetching saved items: ' + error.message);
    } else if (data) {
      // Map out the actual jobs from the join
      const jobs = data.map(item => item.jobs).filter(Boolean);
      setSavedJobs(jobs);
    }
    
    setLoading(false);
  };

  const removeFavorite = async (jobId) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('user_id', user.id)
      .eq('job_id', jobId);

    if (error) {
      toast.error('Error removing from saved items.');
    } else {
      setSavedJobs(prev => prev.filter(job => job.id !== jobId));
      toast.success('Removed from saved items');
    }
  };

  const handleApply = async (jobId) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from('applications').insert({ user_id: user.id, job_id: jobId, status: 'pending' });
    if (error) {
      if (error.code === '23505') toast.error('You have already applied to this job.');
      else toast.error('Error applying to job: ' + error.message);
    } else {
      toast.success('Application submitted successfully!');
    }
  };

  return (
    <div className="container mt-4 mb-4">
      <div className="mb-4">
        <h1 className="text-navy flex items-center gap-2">
          <Heart className="text-red" fill="currentColor" /> Saved Items
        </h1>
        <p className="text-secondary">Keep track of jobs you're interested in.</p>
      </div>

      {loading ? (
        <div className="text-center p-4">Loading saved items...</div>
      ) : savedJobs.length === 0 ? (
        <div className="card text-center p-8 animation-fadeIn" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '400px', background: 'linear-gradient(180deg, var(--bg-surface) 0%, var(--bg-hover) 100%)', border: '1px dashed var(--border-active)' }}>
          <div style={{ width: '100px', height: '100px', backgroundColor: 'rgba(27, 42, 74, 0.05)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
            <BookmarkX size={48} style={{ color: 'var(--accent-navy)', opacity: 0.8 }} />
          </div>
          <h3 className="text-navy mb-3" style={{ fontSize: '1.75rem', fontWeight: 800 }}>Your saved items will appear here</h3>
          <p className="text-secondary mx-auto mb-8" style={{ maxWidth: '450px', fontSize: '1rem', lineHeight: '1.6' }}>
            You haven't bookmarked any opportunities yet. When you find a job you like, click the heart icon to save it for later review.
          </p>
          <button className="btn btn-primary shadow-base" style={{ padding: '14px 32px', fontSize: '1rem', borderRadius: '30px' }} onClick={() => navigate('/jobs')}>
            Explore Opportunities
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {savedJobs.map(job => (
            <div key={job.id} className="card relative flex justify-between items-center" style={{ padding: '24px' }}>
              <div style={{ flex: 1 }}>
                <span className="badge badge-grey mb-1">{job.category}</span>
                <h3 className="text-navy mb-1" style={{ fontSize: '1.25rem' }}>{job.title}</h3>
                <p className="text-secondary mb-2" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{job.description}</p>
                <div className="flex gap-4 text-secondary" style={{ fontSize: '0.875rem' }}>
                  <div className="flex items-center gap-1"><Briefcase size={16} /> Budget: ${job.budget}</div>
                  <div className="flex items-center gap-1"><MapPin size={16} /> Remote</div>
                </div>
              </div>
              
              <div className="flex flex-col items-end gap-2 ml-4">
                <button className="btn btn-primary" onClick={() => handleApply(job.id)}>Apply Now</button>
                <button 
                  className="clickable flex items-center gap-1 text-red" 
                  style={{ background: 'none', border: 'none', fontWeight: 700 }}
                  onClick={() => removeFavorite(job.id)}
                >
                  <Trash2 size={16} /> 
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

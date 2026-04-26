import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { Search, MapPin, Briefcase, Heart, Tag, Award, X, SearchX, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import Skeleton from '../components/Skeleton';
import Modal from '../components/Modal';

export default function JobListings() {
  const [searchParams] = useSearchParams();
  const categoryParam = searchParams.get('category');
  const [jobs, setJobs] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Job Detail Modal State
  const [selectedJob, setSelectedJob] = useState(null);

  useEffect(() => {
    fetchJobs();
    fetchFavorites();
  }, [categoryParam]);

  const fetchJobs = async () => {
    setLoading(true);
    let query = supabase.from('jobs').select('*').order('created_at', { ascending: false });
    
    if (categoryParam && categoryParam !== 'Recommended') {
      query = query.eq('category', categoryParam);
    }
    
    // Enforce max jobs limit
    query = query.limit(17);
    
    const { data } = await query;
    if (data) setJobs(data);
    setLoading(false);
  };

  const fetchFavorites = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase.from('favorites').select('job_id').eq('user_id', user.id);
      if (data) setFavorites(data.map(f => f.job_id));
    }
  };

  const toggleFavorite = async (jobId, e) => {
    if (e) e.stopPropagation();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error('Please log in to save favorites');
      return;
    }

    if (favorites.includes(jobId)) {
      await supabase.from('favorites').delete().eq('user_id', user.id).eq('job_id', jobId);
      setFavorites(favorites.filter(id => id !== jobId));
      toast.success('Removed from favorites');
    } else {
      await supabase.from('favorites').insert({ user_id: user.id, job_id: jobId });
      setFavorites([...favorites, jobId]);
      toast.success('Added to favorites');
    }
  };

  const handleApply = async (jobId, e) => {
    if (e) e.stopPropagation();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error('Please log in to apply');
      navigate('/login');
      return;
    }

    const { error } = await supabase.from('applications').insert({ user_id: user.id, job_id: jobId, status: 'pending' });
    if (error) {
      if (error.code === '23505') toast.error('You have already applied to this job.');
      else toast.error('Error applying to job: ' + error.message);
    } else {
      toast.success('Application submitted successfully!');
      setSelectedJob(null);
    }
  };

  // Helper to extract metadata if it was packed into the description string (fallback approach)
  const extractMetadata = (job) => {
    let desc = job.description;
    let meta = { skills: [], experience: 'Intermediate', location: 'Remote' };
    
    // Check if it's stored in real columns
    if (job.skills) meta.skills = job.skills;
    if (job.experience_level) meta.experience = job.experience_level;
    if (job.location_type) meta.location = job.location_type;

    // Check if it's in the description string [META:{...}]
    const metaMatch = desc.match(/\[META:(.*?)\]/);
    if (metaMatch) {
      try {
        const parsed = JSON.parse(metaMatch[1]);
        if (parsed.skills) meta.skills = parsed.skills;
        if (parsed.experience) meta.experience = parsed.experience;
        if (parsed.location) meta.location = parsed.location;
        desc = desc.replace(metaMatch[0], '').trim();
      } catch (e) {
        console.error("Failed to parse meta", e);
      }
    }

    return { desc, meta };
  };

  return (
    <div className="container flex gap-6 mt-4 mb-4">
      {/* Filters Sidebar */}
      <div className="card w-1/4 shadow-base p-0" style={{ alignSelf: 'flex-start', position: 'sticky', top: '100px', overflow: 'hidden', border: 'none' }}>
        <div className="p-5" style={{ borderBottom: '1px solid var(--border-light)' }}>
          <h2 className="text-navy" style={{ fontSize: '1.25rem', fontWeight: 800 }}>Filters</h2>
        </div>
        
        <div className="p-5">
          <label className="block mb-4 font-bold text-secondary" style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Categories</label>
          <div className="flex flex-col gap-2">
            {['Creative and Design', 'Web and IT', 'Writing and Content', 'Marketing and Admin', 'Media and Production', 'Transcription'].map(cat => {
              const isActive = categoryParam === cat;
              return (
                <button
                  key={cat}
                  className="clickable radius-base text-left flex items-center justify-between"
                  style={{ 
                    padding: '12px 16px',
                    backgroundColor: isActive ? 'var(--bg-hover)' : 'transparent',
                    border: isActive ? '1px solid var(--border-active)' : '1px solid transparent',
                    color: isActive ? 'var(--accent-navy)' : 'var(--text-secondary)',
                    fontWeight: isActive ? 700 : 500,
                    transition: 'all 0.3s ease',
                    fontSize: '0.9rem',
                    borderRadius: '8px'
                  }}
                  onClick={() => navigate(`/jobs?category=${encodeURIComponent(cat)}`)}
                >
                  <span>{cat}</span>
                  {isActive && <CheckCircle2 size={18} className="text-navy" />}
                </button>
              );
            })}
          </div>

          {categoryParam && (
            <button 
              className="btn btn-outline w-full mt-6 flex items-center justify-center gap-2" 
              onClick={() => navigate('/jobs')} 
              style={{ 
                fontSize: '0.9rem', 
                padding: '10px', 
                color: 'var(--status-red)', 
                borderColor: 'transparent',
                backgroundColor: 'rgba(220, 38, 38, 0.05)',
                fontWeight: 700
              }}
            >
              <X size={16} /> Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Job List */}
      <div className="w-3/4">
        <div className="mb-4">
          <h1 className="text-navy">Available Jobs {categoryParam && categoryParam !== 'Recommended' && `- ${categoryParam}`}</h1>
          <p className="text-secondary">{jobs.length} jobs found</p>
        </div>

        {loading ? (
          <div className="flex flex-col gap-4">
            {[1,2,3].map(i => <Skeleton key={i} height="160px" />)}
          </div>
        ) : jobs.length === 0 ? (
          <div className="card text-center p-8 animation-fadeIn" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyItems: 'center', justifyContent: 'center', minHeight: '400px', background: 'linear-gradient(180deg, var(--bg-surface) 0%, var(--bg-hover) 100%)', border: '1px dashed var(--border-active)' }}>
            <div style={{ width: '100px', height: '100px', backgroundColor: 'rgba(27, 42, 74, 0.05)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
              <SearchX size={48} style={{ color: 'var(--accent-navy)', opacity: 0.8 }} />
            </div>
            <h3 className="text-navy mb-3" style={{ fontSize: '1.75rem', fontWeight: 800 }}>No opportunities found</h3>
            <p className="text-secondary mx-auto mb-8" style={{ maxWidth: '450px', fontSize: '1rem', lineHeight: '1.6' }}>
              We couldn't find any jobs matching your current filters. Try adjusting your categories or check back later for new postings.
            </p>
            {categoryParam && (
              <button className="btn btn-primary shadow-base" style={{ padding: '14px 32px', fontSize: '1rem', borderRadius: '30px' }} onClick={() => navigate('/jobs')}>
                Reset Filters
              </button>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {jobs.map(job => {
              const { desc, meta } = extractMetadata(job);
              
              return (
                <div 
                  key={job.id} 
                  className="card relative clickable hover-bg" 
                  style={{ padding: '24px', transition: 'all 0.2s', borderLeft: '4px solid var(--accent-navy)' }}
                  onClick={() => setSelectedJob({ ...job, cleanDesc: desc, meta })}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className="badge badge-grey mb-2">{job.category}</span>
                      <h3 className="text-navy mb-1" style={{ fontSize: '1.25rem' }}>{job.title}</h3>
                    </div>
                    <button 
                      className="clickable" 
                      style={{ background: 'none', border: 'none', padding: '4px' }}
                      onClick={(e) => toggleFavorite(job.id, e)}
                    >
                      <Heart size={20} fill={favorites.includes(job.id) ? 'var(--status-red)' : 'none'} color={favorites.includes(job.id) ? 'var(--status-red)' : 'var(--text-secondary)'} /> 
                    </button>
                  </div>
                  
                  <p className="text-secondary mb-3" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{desc}</p>
                  
                  <div className="flex items-center gap-4 text-secondary mb-3" style={{ fontSize: '0.875rem' }}>
                    <div className="flex items-center gap-1 font-bold text-navy"><Briefcase size={16} /> ${job.budget}</div>
                    <div className="flex items-center gap-1"><MapPin size={16} /> {meta.location}</div>
                    <div className="flex items-center gap-1"><Award size={16} /> {meta.experience}</div>
                  </div>

                  {meta.skills && meta.skills.length > 0 && (
                    <div className="flex gap-2">
                      {meta.skills.map((s, i) => (
                        <span key={i} className="badge" style={{ backgroundColor: 'var(--bg-hover)', color: 'var(--accent-navy)', fontSize: '0.75rem' }}>{s}</span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Job Detail Modal */}
      <Modal 
        isOpen={!!selectedJob} 
        onClose={() => setSelectedJob(null)} 
        title="Job Details"
        maxWidth="600px"
      >
        {selectedJob && (
          <div>
            <span className="badge badge-grey mb-2">{selectedJob.category}</span>
            <h2 className="text-navy mb-4" style={{ fontSize: '1.5rem' }}>{selectedJob.title}</h2>
            
            <div className="flex items-center gap-4 text-secondary mb-4 p-3 radius-base border-base bg-hover" style={{ fontSize: '0.875rem' }}>
              <div className="flex items-center gap-1 font-bold text-navy"><Briefcase size={16} /> ${selectedJob.budget} Fixed Price</div>
              <div className="flex items-center gap-1"><MapPin size={16} /> {selectedJob.meta.location}</div>
              <div className="flex items-center gap-1"><Award size={16} /> {selectedJob.meta.experience} Level</div>
            </div>

            <div className="mb-4">
              <h3 className="text-navy mb-2" style={{ fontSize: '1.125rem' }}>Description</h3>
              <p className="text-secondary" style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
                {selectedJob.cleanDesc}
              </p>
            </div>

            {selectedJob.meta.skills && selectedJob.meta.skills.length > 0 && (
              <div className="mb-6">
                <h3 className="text-navy mb-2" style={{ fontSize: '1.125rem' }}><Tag size={16} style={{ display: 'inline' }}/> Required Skills</h3>
                <div className="flex gap-2">
                  {selectedJob.meta.skills.map((s, i) => (
                    <span key={i} className="badge" style={{ backgroundColor: 'var(--accent-navy)', color: '#fff', fontSize: '0.875rem' }}>{s}</span>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-4 border-base" style={{ borderTop: '1px solid var(--border-light)', borderBottom: 'none', borderLeft: 'none', borderRight: 'none' }}>
              <button className="btn btn-primary flex-1" onClick={(e) => handleApply(selectedJob.id, e)}>
                Apply Now
              </button>
              <button 
                className="btn btn-outline" 
                onClick={(e) => toggleFavorite(selectedJob.id, e)}
              >
                {favorites.includes(selectedJob.id) ? 'Remove Save' : 'Save Job'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

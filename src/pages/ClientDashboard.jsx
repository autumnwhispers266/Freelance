import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import toast from 'react-hot-toast';

export default function ClientDashboard() {
  const [profile, setProfile] = useState(null);
  const [activeTab, setActiveTab] = useState('my-jobs');
  const [jobs, setJobs] = useState([]);
  const [freelancers, setFreelancers] = useState([]);
  const [loading, setLoading] = useState(true);

  // New Job Form
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [budget, setBudget] = useState('');
  const [category, setCategory] = useState('Creative and Design');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Fetch Profile
    const { data: prof } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    if (prof) setProfile(prof);

    // Fetch My Jobs
    const { data: myJobs } = await supabase.from('jobs').select('*').eq('client_id', user.id).order('created_at', { ascending: false });
    if (myJobs) setJobs(myJobs);

    // Fetch Freelancers
    const { data: free } = await supabase.from('profiles').select('*').eq('role', 'freelancer');
    if (free) setFreelancers(free);

    setLoading(false);
  };

  const handlePostJob = async (e) => {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();
    
    const { error } = await supabase.from('jobs').insert({
      client_id: user.id,
      title,
      description,
      budget,
      category
    });

    if (error) {
      toast.error('Failed to post job: ' + error.message);
    } else {
      toast.success('Job posted successfully!');
      setTitle(''); setDescription(''); setBudget('');
      fetchData();
      setActiveTab('my-jobs');
    }
  };

  if (loading) return <div className="container mt-4 text-center">Loading dashboard...</div>;

  return (
    <div className="container mt-4 mb-4">
      {/* Profile Summary */}
      <div className="card mb-4 flex items-center gap-4">
        {profile?.avatar_url ? (
          <img src={profile.avatar_url} alt="Profile" style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover' }} />
        ) : (
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: 'var(--accent-navy)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 'bold' }}>
            {profile?.full_name?.charAt(0) || 'C'}
          </div>
        )}
        <div>
          <h1 className="text-navy mb-1" style={{ fontSize: '1.5rem' }}>{profile?.full_name}</h1>
          <p className="text-secondary">Client • {profile?.type_of_product_service || 'No Company specified'}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4 border-base" style={{ borderTop: 'none', borderLeft: 'none', borderRight: 'none', paddingBottom: '8px' }}>
        <button className={`btn ${activeTab === 'my-jobs' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setActiveTab('my-jobs')}>My Jobs</button>
        <button className={`btn ${activeTab === 'post-job' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setActiveTab('post-job')}>Post a Job</button>
        <button className={`btn ${activeTab === 'freelancers' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setActiveTab('freelancers')}>Browse Freelancers</button>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'my-jobs' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
            {jobs.length === 0 ? <p>You haven't posted any jobs yet.</p> : jobs.map(job => (
              <div key={job.id} className="card">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-navy">{job.title}</h3>
                  <span className="badge badge-grey">{job.category}</span>
                </div>
                <p className="text-secondary mb-3">{job.description}</p>
                <div style={{ fontWeight: 700 }}>Budget: ${job.budget}</div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'post-job' && (
          <div className="card max-w-2xl">
            <h2 className="text-navy mb-4">Post a New Job</h2>
            <form onSubmit={handlePostJob}>
              <div className="mb-3">
                <label className="block mb-1 font-bold">Job Title</label>
                <input type="text" className="input-base" required value={title} onChange={e => setTitle(e.target.value)} />
              </div>
              <div className="mb-3">
                <label className="block mb-1 font-bold">Category</label>
                <select className="input-base" required value={category} onChange={e => setCategory(e.target.value)}>
                  <option value="Creative and Design">Creative and Design</option>
                  <option value="Writing and Content">Writing and Content</option>
                  <option value="Web and IT">Web and IT</option>
                  <option value="Marketing and Admin">Marketing and Admin</option>
                  <option value="Media and Production">Media and Production</option>
                  <option value="Transcription">Transcription</option>
                </select>
              </div>
              <div className="mb-3">
                <label className="block mb-1 font-bold">Budget</label>
                <input type="text" className="input-base" required value={budget} onChange={e => setBudget(e.target.value)} placeholder="e.g. 500" />
              </div>
              <div className="mb-4">
                <label className="block mb-1 font-bold">Description</label>
                <textarea className="input-base" required rows={4} value={description} onChange={e => setDescription(e.target.value)}></textarea>
              </div>
              <button type="submit" className="btn btn-primary w-full">Post Job</button>
            </form>
          </div>
        )}

        {activeTab === 'freelancers' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            {freelancers.length === 0 ? <p>No freelancers found.</p> : freelancers.map(free => (
              <div key={free.id} className="card flex items-center gap-4">
                {free.avatar_url ? (
                  <img src={free.avatar_url} alt="Avatar" style={{ width: '64px', height: '64px', borderRadius: '50%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'var(--border-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                    {free.full_name?.charAt(0) || 'F'}
                  </div>
                )}
                <div>
                  <div style={{ fontWeight: 700, fontSize: '1.125rem' }}>{free.full_name}</div>
                  <div className="text-secondary text-sm">{free.primary_category || 'Freelancer'}</div>
                  <button className="btn btn-outline mt-2" style={{ padding: '4px 8px', fontSize: '0.875rem' }}>View Profile</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import toast from 'react-hot-toast';
import { seedPlaceholderJobs } from '../utils/seedData';
import Modal from '../components/Modal';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [featuredJobs, setFeaturedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState(null);

  useEffect(() => {
    if (activeTab === 'users') fetchUsers();
    if (activeTab === 'featured') fetchFeaturedJobs();
  }, [activeTab]);

  const fetchUsers = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
    if (error) toast.error('Failed to fetch users');
    else setUsers(data || []);
    setLoading(false);
  };

  const fetchFeaturedJobs = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('jobs').select('*').order('created_at', { ascending: false }).limit(6);
    if (error) toast.error('Failed to fetch featured jobs');
    else setFeaturedJobs(data || []);
    setLoading(false);
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user? This cannot be undone.')) return;

    // Call the RPC function we defined in SQL
    const { error } = await supabase.rpc('delete_user_as_admin', { target_user_id: userId });

    if (error) {
      toast.error('Failed to delete user: ' + error.message);
    } else {
      toast.success('User deleted successfully.');
      setUsers(users.filter(u => u.id !== userId));
    }
  };

  const handleSaveJob = async (e) => {
    e.preventDefault();
    const { error } = await supabase.from('jobs').update({
      title: editingJob.title,
      description: editingJob.description,
      image_url: editingJob.image_url || null
    }).eq('id', editingJob.id);

    if (error) {
      toast.error('Failed to update job');
    } else {
      toast.success('Featured job updated successfully!');
      setEditModalOpen(false);
      fetchFeaturedJobs();
    }
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-navy" style={{ fontSize: '2rem' }}>Admin Dashboard</h1>
        <div className="flex gap-2">
          <button onClick={seedPlaceholderJobs} className="btn btn-outline">Seed Jobs</button>
        </div>
      </div>

      <div className="flex gap-2 mb-4 border-base" style={{ borderTop: 'none', borderLeft: 'none', borderRight: 'none', paddingBottom: '8px' }}>
        <button className={`btn ${activeTab === 'users' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setActiveTab('users')}>
          Manage Users
        </button>
        <button className={`btn ${activeTab === 'featured' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setActiveTab('featured')}>
          Featured Jobs
        </button>
      </div>

      <div className="card p-0 overflow-hidden">
        {loading ? (
          <div className="p-4 text-center text-secondary">Loading...</div>
        ) : activeTab === 'users' ? (
          users.length === 0 ? <div className="p-4 text-center">No users found.</div> : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-light)', backgroundColor: 'var(--bg-hover)' }}>
                  <th style={{ padding: '12px 16px', textAlign: 'left' }}>User</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left' }}>Role</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                    <td style={{ padding: '12px 16px' }}>{u.full_name || 'No Name'}</td>
                    <td style={{ padding: '12px 16px' }}>{u.role}</td>
                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                      <button onClick={() => handleDeleteUser(u.id)} className="btn btn-outline" style={{ borderColor: 'var(--status-red)', color: 'var(--status-red)', padding: '4px 8px' }}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )
        ) : (
          featuredJobs.length === 0 ? <div className="p-4 text-center">No jobs found. Seed them first.</div> : (
            <div className="p-4 flex flex-col gap-4">
              <p className="text-secondary">These are the newest jobs displayed in the Landing Page carousel. Edit them here to replace their image, text, and description.</p>
              {featuredJobs.map(job => (
                <div key={job.id} className="card p-4 flex justify-between items-start border-base">
                  <div className="flex gap-4">
                    {job.image_url ? (
                      <img src={job.image_url} alt="Job" style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: 'var(--radius-base)' }} />
                    ) : (
                      <div style={{ width: '80px', height: '80px', backgroundColor: 'var(--bg-hover)', borderRadius: 'var(--radius-base)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>No Image</div>
                    )}
                    <div>
                      <h3 className="text-navy">{job.title}</h3>
                      <p className="text-secondary mb-1" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{job.description}</p>
                    </div>
                  </div>
                  <button 
                    className="btn btn-primary" 
                    onClick={() => { setEditingJob(job); setEditModalOpen(true); }}
                  >
                    Edit Job
                  </button>
                </div>
              ))}
            </div>
          )
        )}
      </div>

      <Modal isOpen={isEditModalOpen} onClose={() => setEditModalOpen(false)} title="Edit Featured Job">
        {editingJob && (
          <form onSubmit={handleSaveJob} className="flex flex-col gap-4">
            <div>
              <label className="block font-bold mb-1">Image URL</label>
              <input type="url" className="input-base" value={editingJob.image_url || ''} onChange={e => setEditingJob({...editingJob, image_url: e.target.value})} placeholder="https://..." />
              <div className="text-secondary text-sm mt-1">Image will be shown on the landing page carousel.</div>
            </div>
            <div>
              <label className="block font-bold mb-1">Title</label>
              <input type="text" className="input-base" value={editingJob.title} onChange={e => setEditingJob({...editingJob, title: e.target.value})} />
            </div>
            <div>
              <label className="block font-bold mb-1">Description</label>
              <textarea className="input-base" rows={4} value={editingJob.description} onChange={e => setEditingJob({...editingJob, description: e.target.value})}></textarea>
            </div>
            <button type="submit" className="btn btn-primary mt-2">Save Changes</button>
          </form>
        )}
      </Modal>

    </div>
  );
}

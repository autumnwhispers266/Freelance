import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { 
  Briefcase, CheckCircle2, TrendingUp, Activity, 
  Plus, Edit3, Compass, Clock, Award, Heart 
} from 'lucide-react';
import Skeleton from '../components/Skeleton';

export default function FreelancerDashboard() {
  const [profile, setProfile] = useState(null);
  const [activities, setActivities] = useState([]);
  const [stats, setStats] = useState({ applications: 0, favorites: 0 });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

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

    // Fetch Stats (mock logic for demo: count applications and favorites)
    const { count: appsCount } = await supabase.from('applications').select('*', { count: 'exact', head: true }).eq('user_id', user.id);
    const { count: favsCount } = await supabase.from('favorites').select('*', { count: 'exact', head: true }).eq('user_id', user.id);
    setStats({ applications: appsCount || 0, favorites: favsCount || 0 });

    // Calculate Profile Completion Rate
    let completion = 20; // Base 20% for existing
    if (prof?.avatar_url) completion += 20;
    if (prof?.bio) completion += 20;
    if (prof?.location) completion += 20;
    if (prof?.skills && prof.skills.length > 0) completion += 20;
    
    // Calculate Engagement Score out of 10
    const rawScore = (appsCount || 0) * 1.5 + (favsCount || 0) * 0.5;
    let score = Math.min(10, Math.max(1, rawScore)).toFixed(1);
    if (appsCount === 0 && favsCount === 0) score = "0.0";

    setStats({ 
      applications: appsCount || 0, 
      favorites: favsCount || 0,
      completionRate: completion,
      engagementScore: score
    });

    // Fetch Activities (REAL DATA ONLY)
    // We will merge applications and notifications as "Activity"
    const { data: appsData } = await supabase.from('applications').select('created_at, status').eq('user_id', user.id).order('created_at', { ascending: false }).limit(3);
    const { data: notifs } = await supabase.from('notifications').select('message, created_at').eq('user_id', user.id).order('created_at', { ascending: false }).limit(3);
    
    let combined = [];
    if (appsData) combined = [...combined, ...appsData.map(a => ({ id: Math.random(), message: `Applied for a job (Status: ${a.status})`, created_at: a.created_at }))];
    if (notifs) combined = [...combined, ...notifs.map(n => ({ id: Math.random(), message: n.message, created_at: n.created_at }))];
    
    combined.sort((a,b) => new Date(b.created_at) - new Date(a.created_at));
    setActivities(combined.slice(0, 5));

    setLoading(false);
  };

  if (loading) {
    return (
      <div className="w-full">
        <Skeleton height="100px" className="mb-4" />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '24px', marginBottom: '24px' }}>
          {[1,2,3,4].map(i => <Skeleton key={i} height="120px" />)}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
          <Skeleton height="400px" />
          <Skeleton height="400px" />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Header Section */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-navy mb-1" style={{ fontSize: '2rem' }}>Welcome back, {profile?.full_name?.split(' ')[0] || 'User'}!</h1>
          <p className="text-secondary">Here is what's happening with your account today.</p>
        </div>
        <div className="flex gap-2">
          <button className="btn btn-primary gap-2" onClick={() => navigate('/jobs')}>
            <Plus size={16} /> Find Work
          </button>
        </div>
      </div>

      {/* Quick Actions (Smart Links) */}
      <div className="flex gap-3 mb-4">
        <button className="btn btn-outline flex-1 gap-2 bg-white" onClick={() => navigate('/jobs')}>
          <Compass size={18} /> Browse Marketplace
        </button>
        <button className="btn btn-outline flex-1 gap-2 bg-white" onClick={() => navigate('/profile')}>
          <Edit3 size={18} /> Update Profile
        </button>
        <button className="btn btn-outline flex-1 gap-2 bg-white" onClick={() => navigate('/saved-items')}>
          <Briefcase size={18} /> View Applications
        </button>
      </div>

      {/* Statistics Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', marginBottom: '32px' }}>
        <div className="card p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="text-secondary font-bold" style={{ fontSize: '0.875rem', textTransform: 'uppercase' }}>Active Applications</div>
            <Briefcase size={20} className="text-navy" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800 }}>{stats.applications}</div>
          <div className="text-green flex items-center gap-1 mt-1" style={{ fontSize: '0.875rem' }}><TrendingUp size={14} /> +2 this week</div>
        </div>
        
        <div className="card p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="text-secondary font-bold" style={{ fontSize: '0.875rem', textTransform: 'uppercase' }}>Saved Jobs</div>
            <Heart size={20} className="text-red" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800 }}>{stats.favorites}</div>
          <div className="text-secondary flex items-center gap-1 mt-1" style={{ fontSize: '0.875rem' }}>Awaiting your action</div>
        </div>

        <div className="card p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="text-secondary font-bold" style={{ fontSize: '0.875rem', textTransform: 'uppercase' }}>Completion Rate</div>
            <CheckCircle2 size={20} className="text-green" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800 }}>{stats.completionRate}%</div>
          <div className="text-secondary flex items-center gap-1 mt-1" style={{ fontSize: '0.875rem' }}>Calculated from profile data</div>
        </div>

        <div className="card p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="text-secondary font-bold" style={{ fontSize: '0.875rem', textTransform: 'uppercase' }}>Engagement Score</div>
            <Activity size={20} className="text-amber" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800 }}>{stats.engagementScore}<span style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>/10</span></div>
          <div className="text-secondary flex items-center gap-1 mt-1" style={{ fontSize: '0.875rem' }}>Based on recent activity</div>
        </div>
      </div>

      {/* Main Grid: Activity Feed & Progress */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        
        {/* Left Column: Activity Feed */}
        <div className="card p-0 overflow-hidden">
          <div className="p-4" style={{ borderBottom: '1px solid var(--border-light)', backgroundColor: 'var(--bg-hover)' }}>
            <h2 className="text-navy flex items-center gap-2" style={{ fontSize: '1.25rem' }}>
              <Clock size={20} /> Timeline & Activity
            </h2>
          </div>
          <div className="p-4">
            {activities.length === 0 ? (
              <div className="text-secondary text-center py-4">No recent activity found. Apply to jobs to populate your timeline!</div>
            ) : (
              <div style={{ position: 'relative', paddingLeft: '24px' }}>
                {/* Vertical timeline line */}
                <div style={{ position: 'absolute', left: '7px', top: '8px', bottom: 0, width: '2px', backgroundColor: 'var(--border-light)' }}></div>
                
                {activities.map((act, idx) => (
                  <div key={act.id} className="mb-4" style={{ position: 'relative' }}>
                    {/* Timeline dot */}
                    <div style={{ position: 'absolute', left: '-22px', top: '4px', width: '12px', height: '12px', borderRadius: '50%', backgroundColor: idx === 0 ? 'var(--accent-navy)' : 'var(--border-light)', border: '2px solid #fff' }}></div>
                    
                    <div style={{ fontWeight: 500, marginBottom: '4px' }}>{act.message}</div>
                    <div className="text-secondary" style={{ fontSize: '0.875rem' }}>{new Date(act.created_at).toLocaleString()}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Goals & Trends */}
        <div className="flex flex-col gap-4">
          
          {/* Progress Tracking */}
          <div className="card p-4">
            <h2 className="text-navy mb-3" style={{ fontSize: '1.125rem' }}>Profile Progress</h2>
            
            <div className="mb-3">
              <div className="flex justify-between text-sm mb-1 font-bold">
                <span>Profile Setup</span>
                <span className={stats.completionRate === 100 ? "text-green" : "text-amber"}>{stats.completionRate}%</span>
              </div>
              <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--bg-hover)', borderRadius: '4px' }}>
                <div style={{ width: `${stats.completionRate}%`, height: '100%', backgroundColor: stats.completionRate === 100 ? 'var(--status-green)' : 'var(--status-amber)', borderRadius: '4px' }}></div>
              </div>
            </div>

            <div className="mb-3">
              <div className="flex justify-between text-sm mb-1 font-bold">
                <span>Skill Assessments</span>
                <span className="text-amber">0%</span>
              </div>
              <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--bg-hover)', borderRadius: '4px' }}>
                <div style={{ width: '0%', height: '100%', backgroundColor: 'var(--status-amber)', borderRadius: '4px' }}></div>
              </div>
            </div>

            <button className="text-navy mt-2 clickable" style={{ fontSize: '0.875rem', fontWeight: 700, background: 'none', border: 'none', padding: 0 }} onClick={() => window.location.href='/transcription-test'}>
              + Take tests
            </button>
          </div>

          {/* Goal Milestones */}
          <div className="card p-4">
            <h2 className="text-navy mb-3 flex items-center gap-2" style={{ fontSize: '1.125rem' }}>
              <Award size={20} className="text-amber" /> Activity Milestones
            </h2>
            
            <div className="flex flex-col gap-3">
              <div className="flex items-start gap-2">
                <input type="checkbox" checked={stats.applications >= 1} readOnly style={{ marginTop: '4px' }} />
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.875rem', textDecoration: stats.applications >= 1 ? 'line-through' : 'none', color: stats.applications >= 1 ? 'var(--text-secondary)' : 'var(--text-primary)' }}>Apply to 1 job</div>
                  <div className="text-secondary" style={{ fontSize: '0.75rem' }}>{stats.applications >= 1 ? 'Completed!' : 'Find a job and apply'}</div>
                </div>
              </div>
              
              <div className="flex items-start gap-2">
                <input type="checkbox" checked={stats.completionRate === 100} readOnly style={{ marginTop: '4px' }} />
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.875rem', textDecoration: stats.completionRate === 100 ? 'line-through' : 'none', color: stats.completionRate === 100 ? 'var(--text-secondary)' : 'var(--text-primary)' }}>Complete your profile</div>
                  <div className="text-secondary" style={{ fontSize: '0.75rem' }}>{stats.completionRate === 100 ? 'Completed!' : 'Add avatar, bio, location, etc.'}</div>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <input type="checkbox" checked={stats.favorites > 0} readOnly style={{ marginTop: '4px' }} />
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.875rem', textDecoration: stats.favorites > 0 ? 'line-through' : 'none', color: stats.favorites > 0 ? 'var(--text-secondary)' : 'var(--text-primary)' }}>Save an opportunity</div>
                  <div className="text-secondary" style={{ fontSize: '0.75rem' }}>{stats.favorites > 0 ? 'Completed!' : 'Bookmark a job for later'}</div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}

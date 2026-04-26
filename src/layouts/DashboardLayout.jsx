import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Bell, Grid, User, Heart, Briefcase, Settings, 
  LogOut, PlayCircle, Star, Edit3, ChevronLeft, ChevronRight, X 
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import toast from 'react-hot-toast';
import Skeleton from '../components/Skeleton';

export default function DashboardLayout() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [isNotificationsOpen, setNotificationsOpen] = useState(false);
  const [pendingTasksCount, setPendingTasksCount] = useState(2); // Mocked for UI
  const [loading, setLoading] = useState(true);
  
  const [isCollapsed, setIsCollapsed] = useState(() => {
    return localStorage.getItem('sidebar_collapsed') === 'true';
  });

  const toggleSidebar = () => {
    const newVal = !isCollapsed;
    setIsCollapsed(newVal);
    localStorage.setItem('sidebar_collapsed', newVal);
  };
  
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    checkUser();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        navigate('/login');
      } else {
        setUser(session.user);
        fetchProfileData(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate('/login');
    } else {
      setUser(session.user);
      await fetchProfileData(session.user.id);
      setLoading(false);
    }
  };

  const fetchProfileData = async (userId) => {
    const { data: prof } = await supabase.from('profiles').select('*').eq('id', userId).single();
    if (prof) setProfile(prof);

    const { data: notifs } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (notifs) {
      setNotifications(notifs);
      setUnreadCount(notifs.filter(n => !n.is_read).length);
    }
  };

  const markNotificationsRead = async () => {
    if (unreadCount > 0 && user) {
      await supabase.from('notifications').update({ is_read: true }).eq('user_id', user.id).eq('is_read', false);
      setUnreadCount(0);
      setNotifications(notifications.map(n => ({ ...n, is_read: true })));
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const dashboardRoute = profile?.role === 'client' ? '/client-dashboard' : profile?.role === 'admin' ? '/admin' : '/dashboard';

  const NavItem = ({ to, icon: Icon, label, badge, active, onClick }) => {
    const isActive = active || location.pathname === to;
    return (
      <Link 
        to={to} 
        onClick={onClick}
        className="flex items-center justify-between p-3 radius-base clickable mb-1"
        style={{
          backgroundColor: isActive ? 'var(--bg-hover)' : 'transparent',
          color: isActive ? 'var(--accent-navy)' : 'var(--text-secondary)',
          fontWeight: isActive ? 700 : 500,
          textDecoration: 'none',
          transition: 'all 0.2s ease',
          position: 'relative'
        }}
        title={isCollapsed ? label : undefined}
      >
        <div className="flex items-center gap-3 w-full" style={{ justifyContent: isCollapsed ? 'center' : 'flex-start' }}>
          <Icon size={20} color={isActive ? 'var(--accent-navy)' : 'var(--text-secondary)'} />
          {!isCollapsed && <span>{label}</span>}
        </div>
        {!isCollapsed && badge > 0 && (
          <div style={{ backgroundColor: 'var(--status-red)', color: '#fff', fontSize: '0.75rem', fontWeight: 700, padding: '2px 6px', borderRadius: '12px' }}>
            {badge}
          </div>
        )}
        {isCollapsed && badge > 0 && (
          <div style={{ position: 'absolute', top: '8px', right: '8px', width: '8px', height: '8px', backgroundColor: 'var(--status-red)', borderRadius: '50%' }}></div>
        )}
      </Link>
    );
  };

  if (loading) {
    return (
      <div className="flex h-screen w-full bg-offwhite p-4">
        <div style={{ width: '280px' }}><Skeleton height="100%" /></div>
        <div className="flex-1 ml-4"><Skeleton height="100%" /></div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-primary)' }}>
      {/* Side Panel (Persistent Navigation) */}
      <aside 
        style={{ 
          width: isCollapsed ? '80px' : '280px', 
          backgroundColor: 'var(--bg-surface)', 
          borderRight: '1px solid var(--border-light)',
          position: 'fixed',
          top: 0,
          bottom: 0,
          left: 0,
          display: 'flex',
          flexDirection: 'column',
          overflowY: 'auto',
          zIndex: 40,
          transition: 'width 0.3s ease'
        }}
      >
        {/* Logo */}
        <div className="p-4 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border-light)' }}>
          {!isCollapsed && <Link to="/" className="text-navy" style={{ fontSize: '1.5rem', fontWeight: 800 }}>Outlier</Link>}
          <button onClick={toggleSidebar} className="clickable hover-bg radius-base flex items-center justify-center" style={{ padding: '8px', border: 'none', background: 'none', margin: isCollapsed ? '0 auto' : '0' }}>
            {isCollapsed ? <ChevronRight size={20} className="text-secondary" /> : <ChevronLeft size={20} className="text-secondary" />}
          </button>
        </div>

        {/* Profile Mini Card */}
        {!isCollapsed && (
          <div className="p-4" style={{ borderBottom: '1px solid var(--border-light)' }}>
            <div className="flex items-center gap-3">
              <div style={{ position: 'relative' }}>
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="Profile" style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'var(--accent-navy)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.25rem' }}>
                    {profile?.full_name?.charAt(0) || 'U'}
                  </div>
                )}
              </div>
              <div style={{ flex: 1, overflow: 'hidden' }}>
                <div style={{ fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{profile?.full_name || 'User'}</div>
                <div className="text-secondary" style={{ fontSize: '0.875rem', textTransform: 'capitalize' }}>{profile?.role || 'Member'}</div>
              </div>
              <button onClick={() => navigate('/profile')} className="clickable text-secondary hover-bg" style={{ padding: '8px', border: 'none', background: 'none', borderRadius: '50%' }}>
                <Edit3 size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Main Navigation Links */}
        <div className="p-3" style={{ flex: 1 }}>
          {!isCollapsed && <div className="text-secondary mb-2 px-3" style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Menu</div>}
          <NavItem to={dashboardRoute} icon={Grid} label="Dashboard" active={location.pathname === '/dashboard' || location.pathname === '/client-dashboard' || location.pathname === '/admin'} />
          <NavItem to="/profile" icon={User} label="My Profile" />
          <NavItem to="/saved-items" icon={Heart} label="Saved Items" />
          <NavItem to="/jobs" icon={Briefcase} label="Jobs / Applications" />
          <NavItem to="#" icon={Bell} label="Notifications" badge={unreadCount} onClick={(e) => { e.preventDefault(); setNotificationsOpen(true); markNotificationsRead(); }} />
          <NavItem to="/settings" icon={Settings} label="Settings" />
          
          {/* Smart Shortcuts Section */}
          {!isCollapsed && (
            <>
              <div className="text-secondary mt-4 mb-2 px-3" style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Shortcuts</div>
              
              <div className="card p-3 mb-2 bg-hover border-base clickable" onClick={() => navigate('/jobs')}>
                <div className="flex items-start gap-2">
                  <PlayCircle size={16} className="text-navy mt-1" />
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.875rem' }}>Continue where you left off</div>
                    <div className="text-secondary" style={{ fontSize: '0.75rem' }}>View pending applications</div>
                  </div>
                </div>
              </div>

              <div className="card p-3 bg-hover border-base clickable" onClick={() => navigate('/jobs?category=Recommended')}>
                <div className="flex items-start gap-2">
                  <Star size={16} className="text-amber mt-1" />
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.875rem' }}>Recommended for you</div>
                    <div className="text-secondary" style={{ fontSize: '0.75rem' }}>Find matched jobs</div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Logout */}
        <div className="p-4" style={{ borderTop: '1px solid var(--border-light)' }}>
          <button onClick={handleLogout} className="flex items-center gap-3 text-secondary clickable w-full" style={{ background: 'none', border: 'none', padding: '8px', fontWeight: 700, justifyContent: isCollapsed ? 'center' : 'flex-start' }}>
            <LogOut size={20} /> {!isCollapsed && "Logout"}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main style={{ marginLeft: isCollapsed ? '80px' : '280px', flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh', padding: '32px', transition: 'margin-left 0.3s ease' }}>
        <Outlet />
      </main>

      {/* Notifications Dropdown Modal Overlay */}
      {isNotificationsOpen && (
        <>
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 45 }} onClick={() => setNotificationsOpen(false)}></div>
          <div className="card shadow-base animation-fadeIn" style={{ position: 'fixed', top: '100px', left: isCollapsed ? '90px' : '290px', width: '360px', zIndex: 50, maxHeight: '500px', overflowY: 'auto' }}>
            <div className="p-4 flex items-center justify-between border-base" style={{ borderTop: 'none', borderLeft: 'none', borderRight: 'none', backgroundColor: 'var(--bg-hover)' }}>
              <h3 className="text-navy" style={{ fontSize: '1.125rem' }}>Notifications</h3>
              <button onClick={() => setNotificationsOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={16} className="text-secondary" /></button>
            </div>
            <div>
              {notifications.length === 0 ? (
                <div className="p-6 text-center text-secondary">No notifications found.</div>
              ) : (
                notifications.map(n => (
                  <div key={n.id} className="p-4 border-base hover-bg" style={{ borderTop: 'none', borderLeft: 'none', borderRight: 'none' }}>
                    <div className="flex items-start gap-3">
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: n.is_read ? 'transparent' : 'var(--accent-navy)', marginTop: '6px' }}></div>
                      <div>
                        <p style={{ fontSize: '0.875rem', fontWeight: 500 }}>{n.message}</p>
                        <p className="text-secondary mt-1" style={{ fontSize: '0.75rem' }}>{new Date(n.created_at).toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

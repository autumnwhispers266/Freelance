import { Outlet, Link, useNavigate } from 'react-router-dom';
import { Bell, ChevronDown, User, Settings, LogOut, Moon, X, Heart, Grid } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabaseClient';
import toast from 'react-hot-toast';

export default function RootLayout() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();

  const dropdownRef = useRef(null);
  const notifRef = useRef(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchProfileData(session.user.id);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchProfileData(session.user.id);
      else setProfile(null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    // Close dropdowns on outside click
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) setShowDropdown(false);
      if (notifRef.current && !notifRef.current.contains(event.target)) setShowNotifications(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchProfileData = async (userId) => {
    const { data: prof } = await supabase.from('profiles').select('*').eq('id', userId).single();
    if (prof) setProfile(prof);

    const { data: notifs } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (notifs) {
      setNotifications(notifs);
      setUnreadCount(notifs.filter(n => !n.is_read).length);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const removeNotification = async (id, e) => {
    e.stopPropagation();
    // For the UI modal, we just remove it from view. In the backend, it stays for the Activity tab, 
    // so we can mark it as 'read' or have a 'dismissed' flag. The prompt says "removes from current view".
    setNotifications(prev => prev.filter(n => n.id !== id));
    // Optionally update DB to mark as read
    await supabase.from('notifications').update({ is_read: true }).eq('id', id);
  };

  const dashboardRoute = profile?.role === 'client' ? '/client-dashboard' : profile?.role === 'admin' ? '/admin' : '/dashboard';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <header className="bg-white border-base" style={{ borderTop: 'none', borderLeft: 'none', borderRight: 'none', position: 'sticky', top: 0, zIndex: 50 }}>
        <div className="container flex items-center justify-between" style={{ height: '72px' }}>
          <div className="flex items-center gap-4">
            <Link to="/" className="text-navy" style={{ fontSize: '1.5rem', fontWeight: 700, cursor: 'pointer' }}>Outlier</Link>
          </div>
          
          <nav className="flex items-center gap-3">
            <a href="/#jobs" onClick={(e) => { if(window.location.pathname==='/') { e.preventDefault(); document.getElementById('jobs')?.scrollIntoView({behavior: 'smooth'}) } }} className="text-secondary" style={{ fontWeight: 700, cursor: 'pointer' }}>Jobs</a>
            <a href="/#how-it-works" onClick={(e) => { if(window.location.pathname==='/') { e.preventDefault(); document.getElementById('how-it-works')?.scrollIntoView({behavior: 'smooth'}) } }} className="text-secondary" style={{ fontWeight: 700, cursor: 'pointer' }}>How It Works</a>
            <a href="/#categories" onClick={(e) => { if(window.location.pathname==='/') { e.preventDefault(); document.getElementById('categories')?.scrollIntoView({behavior: 'smooth'}) } }} className="text-secondary" style={{ fontWeight: 700, cursor: 'pointer' }}>Categories</a>
            <a href="/#about" onClick={(e) => { if(window.location.pathname==='/') { e.preventDefault(); document.getElementById('about')?.scrollIntoView({behavior: 'smooth'}) } }} className="text-secondary" style={{ fontWeight: 700, cursor: 'pointer' }}>About</a>
          </nav>

          <div className="flex items-center gap-2">
            {!user ? (
              <>
                <Link to="/login" className="btn btn-outline">Login</Link>
                <Link to="/signup" className="btn btn-primary">Get Started</Link>
              </>
            ) : (
              <div className="flex items-center gap-4">
                {/* Notifications */}
                <div style={{ position: 'relative' }} ref={notifRef}>
                  <button className="clickable" onClick={() => setShowNotifications(!showNotifications)} style={{ background: 'transparent', border: 'none', position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <Bell className="text-secondary" size={24} />
                    {unreadCount > 0 && (
                      <span style={{ position: 'absolute', top: -4, right: -4, background: 'var(--status-red)', width: '12px', height: '12px', borderRadius: '50%', border: '2px solid #fff' }}></span>
                    )}
                  </button>

                  {showNotifications && (
                    <div className="card shadow-base" style={{ position: 'absolute', top: '100%', right: 0, width: '320px', marginTop: '16px', zIndex: 100, padding: 0 }}>
                      <div className="p-2" style={{ borderBottom: '1px solid var(--border-light)', fontWeight: 700 }}>Notifications</div>
                      <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                        {notifications.length === 0 ? (
                          <div className="p-2 text-secondary text-center">No new notifications</div>
                        ) : (
                          notifications.map(n => (
                            <div key={n.id} className="flex justify-between items-start p-2" style={{ borderBottom: '1px solid var(--border-light)', backgroundColor: n.is_read ? 'transparent' : 'var(--bg-hover)' }}>
                              <div>
                                <div style={{ fontSize: '0.875rem' }}>{n.message}</div>
                                <div className="text-secondary" style={{ fontSize: '0.75rem', marginTop: '4px' }}>{new Date(n.created_at).toLocaleString()}</div>
                              </div>
                              <button className="clickable text-secondary" style={{ background: 'none', border: 'none' }} onClick={(e) => removeNotification(n.id, e)}>
                                <X size={16} />
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                      <div className="p-2 text-center" style={{ borderTop: '1px solid var(--border-light)' }}>
                        <Link to={`${dashboardRoute}?tab=activities`} onClick={() => setShowNotifications(false)} className="text-navy" style={{ fontSize: '0.875rem', fontWeight: 700 }}>View All Activity</Link>
                      </div>
                    </div>
                  )}
                </div>

                {/* Profile Dropdown */}
                <div style={{ position: 'relative' }} ref={dropdownRef}>
                  <div className="flex items-center gap-1 clickable" onClick={() => setShowDropdown(!showDropdown)}>
                    {profile?.avatar_url ? (
                      <img src={profile.avatar_url} alt="Avatar" style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'var(--accent-navy)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                        {user.email?.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <ChevronDown className="text-secondary" size={16} />
                  </div>

                  {showDropdown && (
                    <div className="card shadow-base" style={{ position: 'absolute', top: '100%', right: 0, width: '280px', marginTop: '16px', zIndex: 100, padding: 0, overflow: 'hidden' }}>
                      
                      {/* Account Info Section */}
                      <div className="p-4" style={{ backgroundColor: 'var(--bg-hover)', borderBottom: '1px solid var(--border-light)' }}>
                        <div style={{ fontWeight: 700, fontSize: '1.125rem', color: 'var(--text-primary)' }}>{profile?.full_name || 'User'}</div>
                        <div className="text-secondary" style={{ fontSize: '0.875rem', textTransform: 'capitalize' }}>{profile?.role || 'User'}</div>
                      </div>
                      
                      {/* Navigation Section */}
                      <div className="p-2" style={{ borderBottom: '1px solid var(--border-light)' }}>
                        <div className="text-secondary mb-1 px-3" style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Menu</div>
                        <Link to={dashboardRoute} onClick={() => setShowDropdown(false)} className="flex items-center gap-3 px-3 py-2 text-primary clickable" style={{ textDecoration: 'none', borderRadius: 'var(--radius-sm)' }}>
                          <Grid size={18} className="text-secondary" /> 
                          <span style={{ fontWeight: 500 }}>Dashboard</span>
                        </Link>
                        <Link to="/profile" onClick={() => setShowDropdown(false)} className="flex items-center gap-3 px-3 py-2 text-primary clickable" style={{ textDecoration: 'none', borderRadius: 'var(--radius-sm)' }}>
                          <User size={18} className="text-secondary" /> 
                          <span style={{ fontWeight: 500 }}>My Profile</span>
                        </Link>
                        <Link to="/saved-items" onClick={() => setShowDropdown(false)} className="flex items-center gap-3 px-3 py-2 text-primary clickable" style={{ textDecoration: 'none', borderRadius: 'var(--radius-sm)' }}>
                          <Heart size={18} className="text-secondary" /> 
                          <span style={{ fontWeight: 500 }}>Saved Items</span>
                        </Link>
                      </div>

                      {/* Settings Section */}
                      <div className="p-2" style={{ borderBottom: '1px solid var(--border-light)' }}>
                        <div className="text-secondary mb-1 px-3" style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Preferences</div>
                        <Link to="/settings" onClick={() => setShowDropdown(false)} className="flex items-center gap-3 px-3 py-2 text-primary clickable" style={{ textDecoration: 'none', borderRadius: 'var(--radius-sm)' }}>
                          <Settings size={18} className="text-secondary" /> 
                          <span style={{ fontWeight: 500 }}>Account Settings</span>
                        </Link>
                        <Link to="/preferences" onClick={() => setShowDropdown(false)} className="flex items-center gap-3 px-3 py-2 text-primary clickable" style={{ textDecoration: 'none', borderRadius: 'var(--radius-sm)' }}>
                          <Moon size={18} className="text-secondary" /> 
                          <span style={{ fontWeight: 500 }}>Display & Themes</span>
                        </Link>
                      </div>
                      
                      {/* Logout Section */}
                      <div className="p-2">
                        <button onClick={() => { setShowDropdown(false); handleLogout(); }} className="flex items-center gap-3 px-3 py-2 text-red clickable w-full" style={{ background: 'none', border: 'none', textAlign: 'left', borderRadius: 'var(--radius-sm)' }}>
                          <LogOut size={18} /> 
                          <span style={{ fontWeight: 700 }}>Log Out</span>
                        </button>
                      </div>

                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      <main style={{ flex: 1 }}>
        <Outlet />
      </main>

      <footer className="bg-offwhite border-base" style={{ borderBottom: 'none', borderLeft: 'none', borderRight: 'none', padding: '48px 0' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '32px', marginBottom: '48px' }}>
            <div>
              <div className="text-navy mb-2" style={{ fontSize: '1.5rem', fontWeight: 700 }}>Outlier</div>
              <p className="text-secondary">Work. Linked. Find skilled freelancers built for real work.</p>
            </div>
            <div className="flex-col gap-1">
              <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>For Clients</div>
              <Link to="#" className="text-secondary">Post a Job</Link>
              <Link to="#" className="text-secondary">Browse Freelancers</Link>
            </div>
            <div className="flex-col gap-1">
              <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>For Freelancers</div>
              <Link to="#" className="text-secondary">Find Work</Link>
              <Link to="#" className="text-secondary">Create Profile</Link>
            </div>
            <div className="flex-col gap-1">
              <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>Company</div>
              <Link to="/about" className="text-secondary">About Us</Link>
              <Link to="/contact" className="text-secondary">Contact Support</Link>
              <Link to="/privacy" className="text-secondary">Privacy Policy</Link>
              <Link to="/terms" className="text-secondary">Terms of Agreement</Link>
            </div>
          </div>
          <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '24px', textAlign: 'center' }}>
            <p className="text-secondary" style={{ fontSize: '0.875rem' }}>&copy; 2026 Outlier. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

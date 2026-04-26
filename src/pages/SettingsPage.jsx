import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import toast from 'react-hot-toast';
import { 
  User, Lock, Bell, Eye, Monitor, 
  Download, Trash2, Moon, Globe 
} from 'lucide-react';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('account');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [email, setEmail] = useState('');

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setEmail(user.email);
    });
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters.');
      return;
    }
    
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    
    if (error) {
      toast.error('Error updating password: ' + error.message);
    } else {
      toast.success('Password updated successfully!');
      setPassword('');
    }
    setLoading(false);
  };

  const handleMockAction = (actionName) => {
    toast.success(`${actionName} completed successfully.`);
  };

  const handleDeleteAccount = () => {
    if (window.confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      toast.error("Account deletion is disabled in this demo environment.");
    }
  };

  const TabButton = ({ id, icon: Icon, label }) => (
    <button
      onClick={() => setActiveTab(id)}
      className="flex items-center gap-3 p-3 w-full text-left radius-base clickable"
      style={{
        backgroundColor: activeTab === id ? 'var(--bg-hover)' : 'transparent',
        color: activeTab === id ? 'var(--accent-navy)' : 'var(--text-secondary)',
        fontWeight: activeTab === id ? 700 : 500,
        border: 'none',
        transition: 'all 0.2s'
      }}
    >
      <Icon size={18} />
      {label}
    </button>
  );

  return (
    <div className="w-full h-full flex flex-col">
      <div className="mb-4">
        <h1 className="text-navy" style={{ fontSize: '2rem' }}>Settings</h1>
        <p className="text-secondary">Manage your account settings and preferences.</p>
      </div>

      <div className="flex gap-4" style={{ flex: 1 }}>
        
        {/* Settings Sidebar */}
        <div className="card p-2" style={{ width: '250px', alignSelf: 'flex-start' }}>
          <TabButton id="account" icon={User} label="Account Management" />
          <TabButton id="preferences" icon={Moon} label="Preferences" />
          <TabButton id="privacy" icon={ShieldIcon} label="Privacy & Security" />
          <TabButton id="data" icon={Download} label="Data Controls" />
        </div>

        {/* Settings Content Area */}
        <div className="card p-4 flex-1">
          
          {/* ACCOUNT MANAGEMENT */}
          {activeTab === 'account' && (
            <div className="animation-fadeIn">
              <h2 className="text-navy mb-4 border-base" style={{ borderTop: 'none', borderLeft: 'none', borderRight: 'none', paddingBottom: '16px' }}>
                Account Management
              </h2>
              
              <div className="mb-4">
                <label className="block font-bold mb-1">Email Address</label>
                <div className="flex gap-2">
                  <input type="email" className="input-base" disabled value={email} style={{ backgroundColor: 'var(--bg-hover)', color: 'var(--text-secondary)' }} />
                  <button className="btn btn-outline" onClick={() => handleMockAction('Email change request sent')}>Change</button>
                </div>
              </div>

              <form onSubmit={handleUpdatePassword} className="mb-4 pt-4 border-base" style={{ borderTop: '1px solid var(--border-light)', borderBottom: 'none', borderLeft: 'none', borderRight: 'none' }}>
                <label className="block font-bold mb-1">Change Password</label>
                <div className="flex gap-2">
                  <input 
                    type="password" 
                    className="input-base" 
                    required 
                    value={password} 
                    onChange={e => setPassword(e.target.value)} 
                    placeholder="Enter new password"
                  />
                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? 'Updating...' : 'Update'}
                  </button>
                </div>
              </form>

              <div className="pt-4 border-base flex justify-between items-center" style={{ borderTop: '1px solid var(--border-light)', borderBottom: 'none', borderLeft: 'none', borderRight: 'none' }}>
                <div>
                  <div style={{ fontWeight: 700 }}>Logout Sessions</div>
                  <div className="text-secondary" style={{ fontSize: '0.875rem' }}>Sign out of all other active devices.</div>
                </div>
                <button className="btn btn-outline" onClick={() => handleMockAction('Logged out of all other sessions')}>Logout All</button>
              </div>

              <div className="pt-4 mt-4 border-base flex justify-between items-center" style={{ borderTop: '1px solid var(--border-light)', borderBottom: 'none', borderLeft: 'none', borderRight: 'none' }}>
                <div>
                  <div style={{ fontWeight: 700, color: 'var(--status-red)' }}>Delete Account</div>
                  <div className="text-secondary" style={{ fontSize: '0.875rem' }}>Permanently remove your account and all data.</div>
                </div>
                <button className="btn btn-outline" style={{ borderColor: 'var(--status-red)', color: 'var(--status-red)' }} onClick={handleDeleteAccount}>
                  Delete Account
                </button>
              </div>
            </div>
          )}

          {/* PREFERENCES */}
          {activeTab === 'preferences' && (
            <div className="animation-fadeIn">
              <h2 className="text-navy mb-4 border-base" style={{ borderTop: 'none', borderLeft: 'none', borderRight: 'none', paddingBottom: '16px' }}>
                Preferences
              </h2>

              <div className="mb-4">
                <label className="block font-bold mb-2 flex items-center gap-2"><Moon size={16}/> Theme</label>
                <div className="flex gap-2">
                  <button className={`btn ${theme === 'light' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setTheme('light')}>Light</button>
                  <button className={`btn ${theme === 'dark' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setTheme('dark')}>Dark</button>
                  <button className={`btn ${theme === 'system' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setTheme('system')}>System</button>
                </div>
              </div>

              <div className="mb-4 pt-4 border-base" style={{ borderTop: '1px solid var(--border-light)', borderBottom: 'none', borderLeft: 'none', borderRight: 'none' }}>
                <label className="block font-bold mb-2 flex items-center gap-2"><Globe size={16}/> Language</label>
                <select className="input-base" style={{ maxWidth: '200px' }} defaultValue="en">
                  <option value="en">English (US)</option>
                  <option value="es">Español</option>
                  <option value="fr">Français</option>
                </select>
              </div>

              <div className="pt-4 border-base" style={{ borderTop: '1px solid var(--border-light)', borderBottom: 'none', borderLeft: 'none', borderRight: 'none' }}>
                <label className="block font-bold mb-3 flex items-center gap-2"><Bell size={16}/> Notifications</label>
                
                <div className="flex items-center justify-between p-3 radius-base border-base mb-2">
                  <div>
                    <div style={{ fontWeight: 700 }}>Email Notifications</div>
                    <div className="text-secondary" style={{ fontSize: '0.875rem' }}>Receive updates directly to your inbox</div>
                  </div>
                  <input type="checkbox" defaultChecked />
                </div>
                
                <div className="flex items-center justify-between p-3 radius-base border-base mb-2">
                  <div>
                    <div style={{ fontWeight: 700 }}>Push Notifications</div>
                    <div className="text-secondary" style={{ fontSize: '0.875rem' }}>Receive alerts on your device</div>
                  </div>
                  <input type="checkbox" defaultChecked />
                </div>
                
                <div className="flex items-center justify-between p-3 radius-base border-base">
                  <div>
                    <div style={{ fontWeight: 700 }}>In-App Notifications</div>
                    <div className="text-secondary" style={{ fontSize: '0.875rem' }}>Show notifications within the platform</div>
                  </div>
                  <input type="checkbox" defaultChecked />
                </div>
              </div>
            </div>
          )}

          {/* PRIVACY & SECURITY */}
          {activeTab === 'privacy' && (
            <div className="animation-fadeIn">
              <h2 className="text-navy mb-4 border-base" style={{ borderTop: 'none', borderLeft: 'none', borderRight: 'none', paddingBottom: '16px' }}>
                Privacy & Security
              </h2>

              <div className="mb-4">
                <label className="block font-bold mb-3 flex items-center gap-2"><Eye size={16}/> Profile Visibility</label>
                <select className="input-base" style={{ maxWidth: '300px' }} defaultValue="public">
                  <option value="public">Public (Visible to everyone)</option>
                  <option value="clients">Clients Only</option>
                  <option value="private">Private (Hidden from search)</option>
                </select>
              </div>

              <div className="mb-4 pt-4 border-base" style={{ borderTop: '1px solid var(--border-light)', borderBottom: 'none', borderLeft: 'none', borderRight: 'none' }}>
                <label className="block font-bold mb-3 flex items-center gap-2"><Activity size={16}/> Activity Visibility</label>
                <div className="flex items-center gap-2 mb-2">
                  <input type="checkbox" id="show-online" defaultChecked />
                  <label htmlFor="show-online" className="clickable">Show when I am online</label>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="show-activity" defaultChecked />
                  <label htmlFor="show-activity" className="clickable">Show my recent applications to followers</label>
                </div>
              </div>

              <div className="pt-4 border-base" style={{ borderTop: '1px solid var(--border-light)', borderBottom: 'none', borderLeft: 'none', borderRight: 'none' }}>
                <label className="block font-bold mb-3 flex items-center gap-2"><Monitor size={16}/> Active Device Sessions</label>
                <div className="card p-3 bg-hover">
                  <div className="flex justify-between items-center">
                    <div>
                      <div style={{ fontWeight: 700 }}>Windows 11 • Chrome</div>
                      <div className="text-secondary" style={{ fontSize: '0.875rem' }}>Current session • New York, US</div>
                    </div>
                    <span className="badge badge-green">Active Now</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* DATA CONTROLS */}
          {activeTab === 'data' && (
            <div className="animation-fadeIn">
              <h2 className="text-navy mb-4 border-base" style={{ borderTop: 'none', borderLeft: 'none', borderRight: 'none', paddingBottom: '16px' }}>
                Data Controls
              </h2>

              <div className="flex justify-between items-center p-4 border-base radius-base mb-4">
                <div>
                  <div className="flex items-center gap-2 font-bold"><Download size={18} /> Export Data</div>
                  <div className="text-secondary mt-1" style={{ fontSize: '0.875rem', maxWidth: '400px' }}>
                    Download a copy of your profile data, applications, and activity history in JSON format.
                  </div>
                </div>
                <button className="btn btn-outline" onClick={() => handleMockAction('Data export started. Check your email.')}>
                  Export Data
                </button>
              </div>

              <div className="flex justify-between items-center p-4 border-base radius-base">
                <div>
                  <div className="flex items-center gap-2 font-bold text-red"><Trash2 size={18} /> Clear Activity History</div>
                  <div className="text-secondary mt-1" style={{ fontSize: '0.875rem', maxWidth: '400px' }}>
                    Permanently delete all your timeline activity, recent views, and search history.
                  </div>
                </div>
                <button className="btn btn-outline" style={{ borderColor: 'var(--status-red)', color: 'var(--status-red)' }} onClick={() => handleMockAction('Activity history cleared')}>
                  Clear History
                </button>
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
}

// Quick inline icon component to avoid import errors if missing
function ShieldIcon(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={props.size||24} height={props.size||24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
    </svg>
  );
}

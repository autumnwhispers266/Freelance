import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { supabase } from '../supabaseClient';
import toast from 'react-hot-toast';

export default function ResetPasswordPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.onAuthStateChange(async (event, session) => {
      if (event == "PASSWORD_RECOVERY") {
        toast.success("Ready to reset your password");
      }
    });
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.updateUser({ password });

    setLoading(false);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Password updated successfully!');
      navigate('/login');
    }
  };

  return (
    <div className="container flex items-center justify-center" style={{ minHeight: '80vh' }}>
      <div className="card p-4" style={{ width: '100%', maxWidth: '400px' }}>
        <div className="text-center mb-3">
          <div className="text-navy" style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '8px' }}>Outlier</div>
          <h1 className="text-navy" style={{ fontSize: '1.5rem' }}>Update Password</h1>
          <p className="text-secondary mt-1">Enter your new password below.</p>
        </div>

        <form onSubmit={handleUpdate}>
          <div className="mb-3" style={{ position: 'relative' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 700 }}>New Password</label>
            <input 
              type={showPassword ? "text" : "password"} 
              className="input-base" 
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              style={{ paddingRight: '40px' }}
            />
            <button 
              type="button"
              className="clickable"
              onClick={() => setShowPassword(!showPassword)}
              style={{ position: 'absolute', right: '12px', top: '38px', background: 'none', border: 'none', color: 'var(--text-secondary)' }}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          <button type="submit" className="btn btn-primary w-full mb-3" disabled={loading}>
            {loading ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
}

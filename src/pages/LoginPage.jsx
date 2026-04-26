import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { supabase } from '../supabaseClient';

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      setError(error.message);
    } else {
      navigate('/dashboard'); // or back to where they were
    }
  };

  return (
    <div className="container flex items-center justify-center" style={{ minHeight: '80vh' }}>
      <div className="card p-4" style={{ width: '100%', maxWidth: '400px' }}>
        <div className="text-center mb-3">
          <div className="text-navy" style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '8px' }}>Worklin</div>
          <h1 className="text-navy" style={{ fontSize: '1.5rem' }}>Welcome back</h1>
        </div>

        {error && <div className="text-red mb-2 text-center">{error}</div>}

        <form onSubmit={handleLogin}>
          <div className="mb-2">
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 700 }}>Email Address</label>
            <input 
              type="email" 
              className="input-base" 
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>

          <div className="mb-2" style={{ position: 'relative' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 700 }}>Password</label>
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

          <div className="flex items-center justify-between mb-4">
            <label className="flex items-center gap-1 clickable">
              <input type="checkbox" className="clickable" />
              <span className="text-secondary" style={{ fontSize: '0.875rem' }}>Remember me</span>
            </label>
            <Link to="/forgot-password" className="text-navy clickable" style={{ fontSize: '0.875rem', fontWeight: 700 }}>Forgot password?</Link>
          </div>

          <button type="submit" className="btn btn-primary w-full mb-3" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="text-center text-secondary">
          Don't have an account? <Link to="/signup" className="text-navy clickable" style={{ fontWeight: 700 }}>Sign Up</Link>
        </div>
      </div>
    </div>
  );
}

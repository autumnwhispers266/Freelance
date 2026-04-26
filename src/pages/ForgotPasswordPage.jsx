import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import toast from 'react-hot-toast';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(c => c - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleReset = async (e) => {
    e.preventDefault();
    if (countdown > 0) return;
    
    setLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    setLoading(false);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Password reset email sent! Check your inbox.');
      setCountdown(60); // Start 60 second cooldown
    }
  };

  return (
    <div className="container flex items-center justify-center" style={{ minHeight: '80vh' }}>
      <div className="card p-4" style={{ width: '100%', maxWidth: '400px' }}>
        <div className="text-center mb-3">
          <div className="text-navy" style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '8px' }}>Outlier</div>
          <h1 className="text-navy" style={{ fontSize: '1.5rem' }}>Reset Password</h1>
          <p className="text-secondary mt-1">Enter your email and we'll send you a link.</p>
        </div>

        <form onSubmit={handleReset}>
          <div className="mb-3">
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 700 }}>Email Address</label>
            <input 
              type="email" 
              className="input-base" 
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              disabled={countdown > 0}
            />
          </div>

          <button 
            type="submit" 
            className={`btn w-full mb-3 ${countdown > 0 ? 'btn-outline' : 'btn-primary'}`} 
            disabled={loading || countdown > 0}
            style={{ cursor: countdown > 0 ? 'not-allowed' : 'pointer' }}
          >
            {loading ? 'Sending...' : countdown > 0 ? `Resend available in ${countdown}s` : 'Send Reset Link'}
          </button>
        </form>

        <div className="text-center text-secondary">
          Remembered your password? <Link to="/login" className="text-navy clickable" style={{ fontWeight: 700 }}>Login</Link>
        </div>
      </div>
    </div>
  );
}

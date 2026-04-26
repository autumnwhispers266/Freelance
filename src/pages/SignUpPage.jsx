import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Upload } from 'lucide-react';
import { supabase } from '../supabaseClient';
import toast from 'react-hot-toast';

export default function SignUpPage() {
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Step 1 Data
  const [role, setRole] = useState('freelancer');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Step 2 Data
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [paypalEmail, setPaypalEmail] = useState('');
  const [niche, setNiche] = useState('Creative and Design');
  const [typeOfService, setTypeOfService] = useState('');
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);

  const handleNext = (e) => {
    e.preventDefault();
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }
    setStep(2);
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const uploadAvatar = async (userId) => {
    if (!avatarFile) return null;
    const fileExt = avatarFile.name.split('.').pop();
    const fileName = `${userId}-${Math.random()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, avatarFile);

    if (uploadError) {
      throw uploadError;
    }

    const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
    return data.publicUrl;
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Sign up user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            role: role,
            full_name: fullName
          }
        }
      });

      if (authError) throw authError;

      const userId = authData.user?.id;
      if (!userId) throw new Error("Could not get user ID after signup.");

      // 2. Upload Avatar if selected
      let publicAvatarUrl = null;
      if (avatarFile) {
        publicAvatarUrl = await uploadAvatar(userId);
      }

      // 3. Update profile with extra data
      const updatePayload = {
        full_name: fullName,
        phone_number: phone,
        avatar_url: publicAvatarUrl
      };

      if (role === 'freelancer') {
        updatePayload.paypal_email = paypalEmail;
        updatePayload.primary_category = niche;
      } else {
        updatePayload.type_of_product_service = typeOfService;
      }

      const { error: profileError } = await supabase
        .from('profiles')
        .update(updatePayload)
        .eq('id', userId);

      if (profileError) throw profileError;

      toast.success("Account created successfully!");
      navigate(role === 'freelancer' ? '/dashboard' : '/client-dashboard');
      
    } catch (error) {
      toast.error(error.message || "An error occurred during signup.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container flex items-center justify-center" style={{ minHeight: '80vh', padding: '48px 0' }}>
      <div className="card p-4" style={{ width: '100%', maxWidth: '500px' }}>
        <div className="text-center mb-3">
          <div className="text-navy" style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '8px' }}>Outlier</div>
          <h1 className="text-navy" style={{ fontSize: '1.5rem' }}>Create your account</h1>
          <p className="text-secondary mt-1">Step {step} of 2</p>
          <div style={{ width: '100%', height: '6px', backgroundColor: 'var(--border-light)', borderRadius: '3px', marginTop: '16px', overflow: 'hidden' }}>
            <div style={{ 
              width: step === 1 ? '50%' : '100%', 
              height: '100%', 
              backgroundColor: 'var(--accent-navy)', 
              transition: 'width 0.3s ease' 
            }}></div>
          </div>
        </div>

        {step === 1 ? (
          <form onSubmit={handleNext}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 700 }}>Account Type</label>
            <div className="flex gap-2 mb-4">
              <div 
                className="card p-2 clickable" 
                style={{ 
                  flex: 1, 
                  border: role === 'freelancer' ? '1px solid var(--accent-navy)' : '1px solid var(--border-light)',
                  backgroundColor: role === 'freelancer' ? 'var(--bg-hover)' : 'var(--bg-surface)'
                }}
                onClick={() => setRole('freelancer')}
              >
                <div style={{ fontWeight: 700, marginBottom: '4px', color: 'var(--accent-navy)' }}>I am a Freelancer</div>
                <div className="text-secondary" style={{ fontSize: '0.875rem' }}>I want to find work.</div>
              </div>
              <div 
                className="card p-2 clickable" 
                style={{ 
                  flex: 1, 
                  border: role === 'client' ? '1px solid var(--accent-navy)' : '1px solid var(--border-light)',
                  backgroundColor: role === 'client' ? 'var(--bg-hover)' : 'var(--bg-surface)'
                }}
                onClick={() => setRole('client')}
              >
                <div style={{ fontWeight: 700, marginBottom: '4px', color: 'var(--accent-navy)' }}>I am a Client</div>
                <div className="text-secondary" style={{ fontSize: '0.875rem' }}>I want to hire.</div>
              </div>
            </div>

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

            <div className="mb-4" style={{ position: 'relative' }}>
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

            <button type="submit" className="btn btn-primary w-full mb-3">
              Next Step
            </button>
          </form>
        ) : (
          <form onSubmit={handleSignUp}>
            <div className="mb-4 flex flex-col items-center">
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 700 }}>Profile Picture</label>
              <label className="clickable" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100px', height: '100px', borderRadius: '50%', border: '2px dashed var(--border-light)', overflow: 'hidden', backgroundColor: 'var(--bg-hover)', cursor: 'pointer' }}>
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <Upload className="text-secondary" />
                )}
                <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatarChange} />
              </label>
            </div>

            <div className="mb-2">
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 700 }}>Full Name</label>
              <input type="text" className="input-base" required value={fullName} onChange={e => setFullName(e.target.value)} />
            </div>

            <div className="mb-2">
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 700 }}>Phone Number</label>
              <input type="tel" className="input-base" required value={phone} onChange={e => setPhone(e.target.value)} />
            </div>

            {role === 'freelancer' ? (
              <>
                <div className="mb-2">
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 700 }}>PayPal Email</label>
                  <input type="email" className="input-base" required value={paypalEmail} onChange={e => setPaypalEmail(e.target.value)} />
                </div>
                <div className="mb-4">
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 700 }}>Niche / Category</label>
                  <select className="input-base" value={niche} onChange={e => setNiche(e.target.value)}>
                    <option value="Creative and Design">Creative and Design</option>
                    <option value="Writing and Content">Writing and Content</option>
                    <option value="Web and IT">Web and IT</option>
                    <option value="Marketing and Admin">Marketing and Admin</option>
                    <option value="Media and Production">Media and Production</option>
                    <option value="Transcription">Transcription</option>
                  </select>
                </div>
              </>
            ) : (
              <div className="mb-4">
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 700 }}>Type of Product/Service</label>
                <input type="text" className="input-base" required value={typeOfService} onChange={e => setTypeOfService(e.target.value)} placeholder="e.g. Fintech App, Blog" />
              </div>
            )}

            <div className="flex gap-2 mb-3">
              <button type="button" onClick={() => setStep(1)} className="btn btn-outline" style={{ flex: 1 }} disabled={loading}>
                Back
              </button>
              <button type="submit" className="btn btn-primary" style={{ flex: 2 }} disabled={loading}>
                {loading ? 'Creating...' : 'Create Account'}
              </button>
            </div>
          </form>
        )}

        <div className="text-center text-secondary">
          Already have an account? <Link to="/login" className="text-navy clickable" style={{ fontWeight: 700 }}>Login</Link>
        </div>
      </div>
    </div>
  );
}

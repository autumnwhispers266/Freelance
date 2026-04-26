import { useNavigate } from 'react-router-dom';
import { Home, Compass } from 'lucide-react';

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-4 animation-fadeIn" style={{ minHeight: '100vh', backgroundColor: 'var(--bg-primary)' }}>
      <div className="text-center" style={{ maxWidth: '500px' }}>
        <div style={{ width: '120px', height: '120px', backgroundColor: 'var(--bg-hover)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center', margin: '0 auto 32px' }}>
          <Compass size={64} className="text-navy" />
        </div>
        <h1 className="text-navy mb-4" style={{ fontSize: '3rem', fontWeight: 800, lineHeight: 1.2 }}>
          404<br/>Page Not Found
        </h1>
        <p className="text-secondary mb-8" style={{ fontSize: '1.25rem', lineHeight: 1.6 }}>
          The page you’re looking for doesn’t exist or may have been moved. Let's get you back on track.
        </p>
        <div className="flex justify-center gap-4">
          <button 
            className="btn btn-primary" 
            style={{ padding: '12px 24px', fontSize: '1.125rem' }}
            onClick={() => navigate('/dashboard')}
          >
            Go back to Dashboard
          </button>
          <button 
            className="btn btn-outline" 
            style={{ padding: '12px 24px', fontSize: '1.125rem' }}
            onClick={() => navigate('/')}
          >
            <Home size={20} className="mr-2" style={{ marginRight: '8px' }}/> Return Home
          </button>
        </div>
      </div>
    </div>
  );
}

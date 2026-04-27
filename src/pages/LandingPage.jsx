import { Bookmark } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import creativeImg from '../assets/creative.jpg';
import writingImg from '../assets/writing.jpg';
import webImg from '../assets/web.jpg';
import marketingImg from '../assets/marketing.jpg';
import mediaImg from '../assets/media.jpg';
import transcriptionImg from '../assets/transcription.jpg';
import heroImg from '../assets/hero.jpg';

import { featuredJobs } from '../data/jobs';
import { sortJobs, filterJobs, mergeWithApplicationState } from '../utils/jobEngine';
import JobCard from '../components/JobCard';

const CATEGORIES = [
  { name: 'Creative and Design', img: creativeImg },
  { name: 'Writing and Content', img: writingImg },
  { name: 'Web and IT', img: webImg },
  { name: 'Marketing and Admin', img: marketingImg },
  { name: 'Media and Production', img: mediaImg },
  { name: 'Transcription', img: transcriptionImg }
];

export default function LandingPage() {
  const [activeTab, setActiveTab] = useState('All');
  const [user, setUser] = useState(null);
  const [renderTrigger, setRenderTrigger] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) setUser(data.user);
    });
  }, []);

  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  const renderJobs = () => {
    const jobsToRender = mergeWithApplicationState(sortJobs(filterJobs(featuredJobs, activeTab)));

    if (jobsToRender.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center p-8 text-center border-base radius-base" style={{ minHeight: '300px' }}>
          <div style={{ padding: '16px', backgroundColor: 'var(--bg-hover)', borderRadius: '50%', marginBottom: '16px' }}>
            <Bookmark size={32} className="text-secondary" />
          </div>
          <h3 className="text-navy mb-2" style={{ fontSize: '1.5rem' }}>0 jobs found</h3>
          <p className="text-secondary">No matching opportunities found. Try another category.</p>
        </div>
      );
    }

    return (
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
        gap: '24px' 
      }}>
        {jobsToRender.slice(0, 10).map(job => (
          <JobCard 
            key={job.id} 
            job={job} 
            user={user} 
            onApplicationUpdate={() => setRenderTrigger(t => t + 1)} 
          />
        ))}
      </div>
    );
  };

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="container mt-4 mb-4" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '48px', alignItems: 'center', minHeight: '60vh' }}>
        <div>
          <h1 className="text-navy" style={{ fontSize: '3.5rem', marginBottom: '16px' }}>Find skilled freelancers built for real work</h1>
          <p className="text-secondary mb-4" style={{ fontSize: '1.25rem' }}>The professional marketplace connecting serious clients with expert talent. No hassle, just results.</p>
          <button onClick={() => scrollToSection('jobs')} className="btn btn-primary" style={{ padding: '12px 24px', fontSize: '1.125rem' }}>Browse Jobs</button>
        </div>
        <div style={{ padding: '24px' }}>
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <img src={heroImg} alt="Clean workspace" style={{ width: '100%', height: 'auto', display: 'block' }} />
          </div>
        </div>
      </section>

      {/* Category Tabs & Featured Jobs */}
      <section id="jobs" className="container mb-4" style={{ paddingTop: '24px' }}>
        <div className="flex gap-2 mb-4" style={{ overflowX: 'auto', paddingBottom: '8px' }}>
          {['All', 'Creative and Design', 'Web and IT', 'Writing and Content', 'Marketing and Admin', 'Media and Production', 'Transcription'].map(tab => (
            <button 
              key={tab}
              onClick={() => handleTabClick(tab)}
              className="clickable"
              style={{
                padding: '8px 16px',
                border: '1px solid',
                borderColor: activeTab === tab ? 'var(--accent-navy)' : 'var(--border-light)',
                backgroundColor: activeTab === tab ? 'var(--accent-navy)' : '#fff',
                color: activeTab === tab ? '#fff' : 'var(--text-primary)',
                fontWeight: 700,
                borderRadius: 'var(--radius-base)',
                whiteSpace: 'nowrap'
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between mb-4">
          <h2 className="text-navy" style={{ fontSize: '2rem' }}>Featured Jobs</h2>
        </div>
        
        {renderJobs()}
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="bg-white border-base mb-4" style={{ padding: '64px 0', borderLeft: 'none', borderRight: 'none' }}>
        <div className="container">
          <h2 className="text-navy mb-4 text-center" style={{ fontSize: '2rem' }}>How It Works</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '32px' }}>
            {[
              { num: '1', title: 'Post or Find', desc: 'Clients post detailed job requirements. Freelancers browse and filter opportunities.' },
              { num: '2', title: 'Connect & Bid', desc: 'Freelancers submit competitive bids with cover notes. Clients review and engage.' },
              { num: '3', title: 'Work & Earn', desc: 'Collaborate directly. Secure payments are processed at the end of each milestone.' }
            ].map(step => (
              <div key={step.num} style={{ position: 'relative', padding: '24px' }}>
                <div style={{ position: 'absolute', top: '-20px', left: '16px', fontSize: '8rem', fontWeight: 700, color: 'var(--border-light)', zIndex: 0, lineHeight: 1 }}>{step.num}</div>
                <div style={{ position: 'relative', zIndex: 1 }}>
                  <h3 className="text-navy mb-1" style={{ fontSize: '1.5rem', marginTop: '40px' }}>{step.title}</h3>
                  <p className="text-secondary">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section id="categories" className="container mb-4" style={{ paddingTop: '24px' }}>
        <h2 className="text-navy mb-3 text-center" style={{ fontSize: '2rem' }}>Explore Categories</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '24px' }}>
          {CATEGORIES.map(cat => {
            const slug = cat.name.toLowerCase().replace(/ /g, '-').replace(/&/g, 'and');
            return (
              <div 
                key={cat.name} 
                className="card clickable" 
                onClick={() => navigate(`/categories/${slug}`)}
                style={{ padding: 0, height: '240px', position: 'relative', overflow: 'hidden' }}
              >
                <img src={cat.img} alt={cat.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(0,0,0,0.8)', padding: '16px' }}>
                  <span style={{ color: '#fff', fontWeight: 700, fontSize: '1.125rem' }}>{cat.name}</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>
      
      {/* About Section */}
      <section id="about" className="bg-white border-base mb-4" style={{ padding: '64px 0', borderLeft: 'none', borderRight: 'none' }}>
        <div className="container text-center">
          <h2 className="text-navy mb-3" style={{ fontSize: '2rem' }}>About Worklin</h2>
          <p className="text-secondary mx-auto" style={{ maxWidth: '800px', fontSize: '1.125rem' }}>
            Worklin was founded with a simple mission: to connect serious professionals with meaningful projects. 
            We provide a minimal, corporate-grade environment where the focus remains entirely on the quality of work.
          </p>
        </div>
      </section>
    </div>
  );
}

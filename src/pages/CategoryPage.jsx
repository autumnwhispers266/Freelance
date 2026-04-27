import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { Bookmark, ArrowLeft } from 'lucide-react';
import creativeImg from '../assets/creative.jpg';
import writingImg from '../assets/writing.jpg';
import webImg from '../assets/web.jpg';
import marketingImg from '../assets/marketing.jpg';
import mediaImg from '../assets/media.jpg';
import transcriptionImg from '../assets/transcription.jpg';

import { featuredJobs } from '../data/jobs';
import { sortJobs, filterJobs, mergeWithApplicationState } from '../utils/jobEngine';
import JobCard from '../components/JobCard';

const CATEGORY_DATA = {
  'creative-and-design': {
    name: 'Creative and Design',
    description: 'Find top-tier designers, illustrators, and creative directors for your next big project. From brand identity to UI/UX, connect with creative professionals who can bring your vision to life.',
    img: creativeImg
  },
  'writing-and-content': {
    name: 'Writing and Content',
    description: 'Expert copywriters, technical writers, and content strategists. Engage your audience with high-quality articles, marketing copy, and comprehensive documentation.',
    img: writingImg
  },
  'web-and-it': {
    name: 'Web and IT',
    description: 'Hire skilled software engineers, full-stack developers, and IT consultants. Build robust web applications, enterprise software, and scalable infrastructure.',
    img: webImg
  },
  'marketing-and-admin': {
    name: 'Marketing and Admin',
    description: 'Grow your business with digital marketing experts, SEO specialists, and highly organized virtual assistants. Streamline your operations and increase your reach.',
    img: marketingImg
  },
  'media-and-production': {
    name: 'Media and Production',
    description: 'Connect with video editors, animators, and audio engineers. Produce professional-grade media content for marketing, entertainment, and educational purposes.',
    img: mediaImg
  },
  'transcription': {
    name: 'Transcription',
    description: 'Fast, accurate, and reliable transcription services for medical, legal, and general audio. Connect with certified professionals who type as fast as you speak.',
    img: transcriptionImg
  }
};

export default function CategoryPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [renderTrigger, setRenderTrigger] = useState(0);

  const category = CATEGORY_DATA[slug];

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) setUser(data.user);
    });
  }, []);

  if (!category) {
    return (
      <div className="container mt-4 mb-4 text-center">
        <h2>Category not found</h2>
        <button className="btn btn-primary mt-2" onClick={() => navigate('/')}>Return Home</button>
      </div>
    );
  }

  const jobsToRender = mergeWithApplicationState(sortJobs(filterJobs(featuredJobs, category.name)));

  return (
    <div className="w-full">
      {/* Category Hero */}
      <div style={{ position: 'relative', height: '300px', backgroundColor: 'var(--accent-navy)' }}>
        <img 
          src={category.img} 
          alt={category.name} 
          style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.4 }} 
        />
        <div className="container" style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <button 
            onClick={() => navigate(-1)} 
            className="clickable flex items-center gap-1 text-white mb-2" 
            style={{ background: 'none', border: 'none', width: 'fit-content', padding: 0 }}
          >
            <ArrowLeft size={20} /> Back
          </button>
          <h1 className="text-white" style={{ fontSize: '3rem', marginBottom: '8px' }}>{category.name}</h1>
          <p className="text-white" style={{ fontSize: '1.125rem', maxWidth: '600px', opacity: 0.9 }}>
            {category.description}
          </p>
        </div>
      </div>

      <div className="container mt-4 mb-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-navy">Related Jobs & Tasks</h2>
          <button 
            className="btn btn-outline" 
            onClick={() => navigate(`/jobs?category=${encodeURIComponent(category.name)}`)}
          >
            View All in {category.name}
          </button>
        </div>

        {jobsToRender.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center border-base radius-base" style={{ minHeight: '300px' }}>
            <div style={{ padding: '16px', backgroundColor: 'var(--bg-hover)', borderRadius: '50%', marginBottom: '16px' }}>
              <Bookmark size={32} className="text-secondary" />
            </div>
            <h3 className="text-navy mb-2" style={{ fontSize: '1.5rem' }}>0 jobs found</h3>
            <p className="text-secondary">No matching opportunities found. Try another category.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
            {jobsToRender.slice(0, 8).map(job => (
              <JobCard 
                key={job.id} 
                job={job} 
                user={user} 
                onApplicationUpdate={() => setRenderTrigger(t => t + 1)} 
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

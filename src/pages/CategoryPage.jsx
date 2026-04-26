import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { Briefcase, MapPin, ArrowLeft } from 'lucide-react';
import creativeImg from '../assets/creative.jpg';
import writingImg from '../assets/writing.jpg';
import webImg from '../assets/web.jpg';
import marketingImg from '../assets/marketing.jpg';
import mediaImg from '../assets/media.jpg';
import transcriptionImg from '../assets/transcription.jpg';

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
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  const category = CATEGORY_DATA[slug];

  useEffect(() => {
    if (category) {
      fetchJobs(category.name);
    }
  }, [category]);

  const fetchJobs = async (categoryName) => {
    setLoading(true);
    const { data } = await supabase
      .from('jobs')
      .select('*')
      .eq('category', categoryName)
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (data) setJobs(data);
    setLoading(false);
  };

  if (!category) {
    return (
      <div className="container mt-4 mb-4 text-center">
        <h2>Category not found</h2>
        <button className="btn btn-primary mt-2" onClick={() => navigate('/')}>Return Home</button>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Category Hero */}
      <div style={{ position: 'relative', height: '300px', backgroundColor: 'var(--navy)' }}>
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

        {loading ? (
          <div className="text-center p-4">Loading related jobs...</div>
        ) : jobs.length === 0 ? (
          <div className="card text-center p-4 text-secondary">
            No related jobs currently available in this category.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            {jobs.map(job => (
              <div key={job.id} className="card p-3">
                <span className="badge badge-grey mb-1">{job.category}</span>
                <h3 className="text-navy mb-1" style={{ fontSize: '1.25rem' }}>{job.title}</h3>
                <p className="text-secondary mb-3" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {job.description}
                </p>
                <div className="flex gap-4 text-secondary mb-3" style={{ fontSize: '0.875rem' }}>
                  <div className="flex items-center gap-1"><Briefcase size={16} /> ${job.budget}</div>
                  <div className="flex items-center gap-1"><MapPin size={16} /> Remote</div>
                </div>
                <button 
                  className="btn btn-primary w-full" 
                  onClick={() => navigate(`/jobs?category=${encodeURIComponent(job.category)}`)}
                >
                  View Details
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

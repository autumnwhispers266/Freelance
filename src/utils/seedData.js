import { supabase } from '../supabaseClient';
import toast from 'react-hot-toast';

// Helper to generate jobs
const generateJobs = () => {
  const categories = [
    {
      name: 'Creative and Design',
      roles: ['UI/UX Landing Page Designer', 'Brand Identity Specialist', 'Children Book Illustrator', 'Motion Graphics Animator', '3D Product Renderer', 'Packaging Designer', 'Logo Designer', 'Web Banner Creator', 'Figma Prototyper', 'Print Layout Designer'],
      skills: [['Figma', 'UI/UX'], ['Branding', 'Illustrator'], ['Illustration', 'Procreate'], ['After Effects', 'Animation'], ['Blender', '3D'], ['Print', 'Packaging'], ['Logo', 'Vector'], ['Photoshop', 'Ads'], ['Figma', 'Prototyping'], ['InDesign', 'Print']]
    },
    {
      name: 'Web and IT',
      roles: ['React Developer for SaaS Dashboard', 'Node.js Backend Engineer', 'Shopify Custom Theme Developer', 'Full Stack Next.js Architect', 'Python Data Scraper', 'WordPress Speed Optimizer', 'AWS DevOps Engineer', 'Flutter Mobile App Dev', 'Solidity Smart Contract Dev', 'Vue.js Frontend Specialist'],
      skills: [['React', 'Tailwind'], ['Node.js', 'Express'], ['Shopify', 'Liquid'], ['Next.js', 'Supabase'], ['Python', 'BeautifulSoup'], ['WordPress', 'Performance'], ['AWS', 'Docker'], ['Flutter', 'Dart'], ['Solidity', 'Web3'], ['Vue.js', 'Nuxt']]
    },
    {
      name: 'Writing and Content',
      roles: ['SEO Blog Writer (Tech niche)', 'SaaS Landing Page Copywriter', 'Technical API Documenter', 'Email Newsletter Creator', 'E-commerce Product Describer', 'Whitepaper Author (Finance)', 'Grant Proposal Writer', 'Ghostwriter for LinkedIn', 'Video Script Writer', 'UX Microcopy Writer'],
      skills: [['SEO', 'Tech Writing'], ['Copywriting', 'Conversion'], ['Technical Writing', 'API'], ['Email Marketing', 'Copy'], ['E-commerce', 'Writing'], ['Finance', 'Research'], ['Grant Writing', 'Non-profit'], ['LinkedIn', 'Ghostwriting'], ['Scriptwriting', 'YouTube'], ['UX Writing', 'Microcopy']]
    },
    {
      name: 'Marketing and Admin',
      roles: ['Social Media Manager for Startup', 'Google Ads Campaign Specialist', 'Virtual Assistant (Data Entry)', 'Cold Email Outreach Expert', 'SEO Audit Consultant', 'Facebook Ads Media Buyer', 'CRM Automation Setup', 'B2B Lead Generation', 'Community Manager (Discord)', 'Customer Support Rep (Zendesk)'],
      skills: [['Social Media', 'Instagram'], ['Google Ads', 'PPC'], ['Data Entry', 'Admin'], ['Outreach', 'Sales'], ['SEO', 'Audit'], ['Facebook Ads', 'Marketing'], ['CRM', 'Zapier'], ['Lead Gen', 'B2B'], ['Discord', 'Community'], ['Zendesk', 'Support']]
    },
    {
      name: 'Media and Production',
      roles: ['Video Editor (Short-form content)', 'Podcast Audio Mixer', 'YouTube VLOG Editor', 'Colorist for Short Film', 'Voiceover Artist (Corporate)', 'Music Producer for Game', 'Subtitler for Documentary', '2D Explainer Animator', 'Audio Cleanup Specialist', 'Thumbnail Designer'],
      skills: [['Premiere', 'TikTok'], ['Audition', 'Mixing'], ['Final Cut', 'YouTube'], ['DaVinci Resolve', 'Color'], ['Voiceover', 'Audio'], ['Ableton', 'Music'], ['Subtitling', 'SRT'], ['After Effects', '2D'], ['Audio Repair', 'iZotope'], ['Photoshop', 'Thumbnails']]
    },
    {
      name: 'Transcription',
      roles: ['Audio Transcription Specialist', 'Medical Conference Transcriber', 'Legal Deposition Typist', 'Strict Verbatim Interview Transcriber', 'Focus Group Transcription', 'Podcast Transcriber', 'Academic Lecture Transcriber', 'Sermon Transcription', 'Financial Earnings Call Typist', 'Bilingual (ES/EN) Transcriber'],
      skills: [['Typing', 'Audio'], ['Medical', 'Terminology'], ['Legal', 'Accuracy'], ['Verbatim', 'Research'], ['Focus Group', 'Multiple Speakers'], ['Podcast', 'Transcription'], ['Academic', 'Lectures'], ['Sermon', 'Typing'], ['Finance', 'Earnings'], ['Bilingual', 'Translation']]
    }
  ];

  const levels = ['Beginner', 'Intermediate', 'Expert'];
  const locations = ['Remote', 'On-site', 'Hybrid'];
  
  let jobs = [];
  
  categories.forEach(cat => {
    cat.roles.forEach((role, i) => {
      // Generate some deterministic variation
      const level = levels[i % levels.length];
      const loc = locations[(i * 2) % locations.length];
      const budget = (i + 1) * 150 + 50;

      jobs.push({
        title: role,
        category: cat.name,
        description: `We are looking for an experienced ${role} to join our team. You must be highly skilled in ${cat.skills[i].join(' and ')}. This is a great opportunity to work on exciting projects with a growing team. Please apply with your portfolio and previous experience.`,
        budget: budget,
        status: 'open',
        // Optional JSON fields we can add to description or actual columns if DB supports
        // Since we can't alter DB schema safely, we will serialize extra metadata into the description 
        // OR rely on the UI to parse it if we use a JSON column, but Supabase might reject unknown columns.
        // Let's pack them into a structured JSON string in a known field? No, just add them, if they exist they save, else we fail gracefully.
        // Actually, if we just pass unknown columns, Supabase throws an error.
        // Let's stringify them into `description` to be safe, then parse them in UI.
        // BUT the prompt implies we should have these. Let's just pass them as columns: `skills`, `experience_level`, `location_type`.
        // If it fails, we fall back to not saving them.
        skills: cat.skills[i],
        experience_level: level,
        location_type: loc
      });
    });
  });

  return jobs;
};

export const seedPlaceholderJobs = async () => {
  try {
    const { count, error: countError } = await supabase
      .from('jobs')
      .select('*', { count: 'exact', head: true });
      
    if (countError) throw countError;
    
    if (count && count > 0) {
      toast.error('Jobs table is not empty. Skipping seed to prevent duplicates.');
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error('You must be logged in as an admin to seed data.');
      return;
    }

    const jobsData = generateJobs();
    
    // Attempt 1: With extra fields
    const jobsWithExtraFields = jobsData.map(job => ({
      ...job,
      user_id: user.id
    }));

    let insertError = null;
    const res = await supabase.from('jobs').insert(jobsWithExtraFields);
    insertError = res.error;

    // If schema rejects extra fields (skills, experience_level, location_type), fallback to core fields
    if (insertError && insertError.code === 'PGRST204' || insertError?.message?.includes('column')) {
      console.warn('DB rejected extra columns. Falling back to core fields and appending metadata to description.');
      
      const jobsCoreOnly = jobsData.map(job => ({
        title: job.title,
        category: job.category,
        // Append metadata to description so UI can parse it
        description: `${job.description}\n\n[META:{"skills":${JSON.stringify(job.skills)},"experience":"${job.experience_level}","location":"${job.location_type}"}]`,
        budget: job.budget,
        status: job.status,
        user_id: user.id
      }));

      const { error: retryError } = await supabase.from('jobs').insert(jobsCoreOnly);
      if (retryError) throw retryError;
    } else if (insertError) {
      throw insertError;
    }

    toast.success(`Successfully seeded ${jobsData.length} placeholder jobs!`);
    
  } catch (error) {
    console.error('Seeding error:', error);
    toast.error('Failed to seed jobs: ' + error.message);
  }
};

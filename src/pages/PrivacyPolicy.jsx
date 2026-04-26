import { useState, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';

export default function PrivacyPolicy() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    // Simulate loading the policy from an external source or DB
    const timer = setTimeout(() => {
      // For demo purposes, we will load it successfully
      setLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="container mt-4 mb-4 flex justify-center items-center" style={{ minHeight: '400px' }}>
        <div className="text-secondary font-bold">Loading policy...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-4 mb-4 flex flex-col justify-center items-center" style={{ minHeight: '400px' }}>
        <AlertCircle size={48} className="text-red mb-4" />
        <h2 className="text-navy mb-2">Unable to load policy</h2>
        <p className="text-secondary">Please try again later.</p>
      </div>
    );
  }

  return (
    <div className="container mt-4 mb-4 animation-fadeIn" style={{ maxWidth: '800px' }}>
      <h1 className="text-navy mb-3">Privacy Policy</h1>
      <div className="card p-6 border-base shadow-base">
        <p className="text-secondary mb-4" style={{ fontWeight: 700 }}>Effective Date: April 2026</p>
        <p className="mb-4" style={{ fontSize: '1.125rem' }}>Your privacy is important to us. This Privacy Policy explains how Outlier collects, uses, and protects your information when using our freelance marketplace platform.</p>
        
        <h3 className="text-navy mt-6 mb-2" style={{ fontSize: '1.25rem' }}>1. Information We Collect</h3>
        <p className="mb-4 text-secondary">We collect information you provide directly to us. For example, we collect information when you create an account, fill out your profile, apply for jobs, or communicate with us. The types of information we may collect include your name, email address, phone number, payment information, and any other information you choose to provide.</p>

        <h3 className="text-navy mt-6 mb-2" style={{ fontSize: '1.25rem' }}>2. How We Use Information</h3>
        <p className="mb-4 text-secondary">We use your information to operate our platform, facilitate transactions, communicate with you about your account, monitor and analyze trends, usage, and activities in connection with our Services, and detect, investigate and prevent fraudulent transactions and other illegal activities and protect the rights and property of Outlier and others.</p>

        <h3 className="text-navy mt-6 mb-2" style={{ fontSize: '1.25rem' }}>3. Data Security</h3>
        <p className="mb-4 text-secondary">We implement reasonable security measures designed to protect your personal information from unauthorized access, use, or disclosure. However, no security measure is completely foolproof, and we cannot guarantee the absolute security of your information.</p>
      </div>
    </div>
  );
}

export default function TermsOfAgreement() {
  return (
    <div className="container mt-4 mb-4" style={{ maxWidth: '800px' }}>
      <h1 className="text-navy mb-3">Terms of Agreement</h1>
      <div className="card p-4">
        <p className="text-secondary mb-2">Effective Date: April 2026</p>
        <p className="mb-2">By accessing or using Outlier, you agree to be bound by these Terms of Agreement.</p>
        
        <h3 className="text-navy mt-3 mb-1">1. Account Responsibilities</h3>
        <p className="mb-2">You are responsible for maintaining the security of your account and password. We are not liable for any loss or damage from your failure to comply.</p>

        <h3 className="text-navy mt-3 mb-1">2. User Conduct</h3>
        <p className="mb-2">You agree not to engage in any activity that disrupts or interferes with our services. Freelancers must provide accurate representation of their skills.</p>

        <h3 className="text-navy mt-3 mb-1">3. Payments</h3>
        <p className="mb-2">All payments are processed securely. Outlier retains a percentage fee as described in our fee schedule.</p>
      </div>
    </div>
  );
}

export const getAppliedJobs = () => {
  try {
    const stored = localStorage.getItem('appliedJobs');
    return stored ? JSON.parse(stored) : {};
  } catch (e) {
    return {};
  }
};

export const saveAppliedJob = (jobId) => {
  const current = getAppliedJobs();
  current[jobId] = {
    jobId,
    status: 'pending',
    appliedAt: new Date().toISOString()
  };
  localStorage.setItem('appliedJobs', JSON.stringify(current));
  return current;
};

export const isJobApplied = (jobId) => {
  const current = getAppliedJobs();
  return !!current[jobId];
};

export const getJobStatus = (jobId) => {
  const current = getAppliedJobs();
  return current[jobId]?.status;
};

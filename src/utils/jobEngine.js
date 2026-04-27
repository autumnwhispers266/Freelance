import { getJobStatus, isJobSaved } from './jobState';

export const sortJobs = (jobsArray) => {
  return [...jobsArray].sort((a, b) => {
    // Primary: most recent (postedAt DESC)
    const dateA = new Date(a.postedAt).getTime();
    const dateB = new Date(b.postedAt).getTime();
    if (dateA !== dateB) return dateB - dateA;
    // Secondary: highest budget
    if (a.budget !== b.budget) return b.budget - a.budget;
    // Tertiary: lowest applicants
    return a.applicants - b.applicants;
  });
};

export const filterJobs = (jobsArray, category) => {
  if (!category || category === 'All') return jobsArray;
  return jobsArray.filter(j => j.category.toLowerCase() === category.toLowerCase());
};

export const mergeWithApplicationState = (jobsArray) => {
  return jobsArray.map(job => ({
    ...job,
    appliedStatus: getJobStatus(job.id),
    isSaved: isJobSaved(job.id)
  }));
};

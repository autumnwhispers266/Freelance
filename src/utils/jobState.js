// ============================================
// Application State (localStorage: appliedJobs)
// ============================================

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
  addNotification('Application submitted', `You applied for a new job opportunity.`, 'application');
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

// ============================================
// Saved Jobs State (localStorage: savedJobs)
// ============================================

export const getSavedJobs = () => {
  try {
    const stored = localStorage.getItem('savedJobs');
    return stored ? JSON.parse(stored) : {};
  } catch (e) {
    return {};
  }
};

export const toggleSaveJob = (jobId) => {
  const current = getSavedJobs();
  if (current[jobId]) {
    delete current[jobId];
    localStorage.setItem('savedJobs', JSON.stringify(current));
    addNotification('Job unsaved', 'A job was removed from your saved list.', 'save');
    return false;
  } else {
    current[jobId] = { jobId, savedAt: new Date().toISOString() };
    localStorage.setItem('savedJobs', JSON.stringify(current));
    addNotification('Saved successfully', 'A job was added to your saved list.', 'save');
    return true;
  }
};

export const isJobSaved = (jobId) => {
  const current = getSavedJobs();
  return !!current[jobId];
};

// ============================================
// Notifications (localStorage: notifications)
// ============================================

export const getNotifications = () => {
  try {
    const stored = localStorage.getItem('worklin_notifications');
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    return [];
  }
};

export const addNotification = (title, message, type = 'info') => {
  const notifications = getNotifications();
  const newNotif = {
    id: Date.now() + Math.random(),
    title,
    message,
    type,
    timestamp: new Date().toISOString(),
    read: false
  };
  notifications.unshift(newNotif);
  // Keep only last 15
  const trimmed = notifications.slice(0, 15);
  localStorage.setItem('worklin_notifications', JSON.stringify(trimmed));
  return trimmed;
};

export const markAllNotificationsRead = () => {
  const notifications = getNotifications();
  const updated = notifications.map(n => ({ ...n, read: true }));
  localStorage.setItem('worklin_notifications', JSON.stringify(updated));
  return updated;
};

export const clearNotification = (id) => {
  const notifications = getNotifications();
  const filtered = notifications.filter(n => n.id !== id);
  localStorage.setItem('worklin_notifications', JSON.stringify(filtered));
  return filtered;
};

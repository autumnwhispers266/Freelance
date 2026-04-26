import { useState, useEffect } from 'react';

export default function PreferencesPage() {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  return (
    <div className="container mt-4 mb-4 flex justify-center">
      <div className="card w-full max-w-2xl">
        <h1 className="text-navy mb-4">Preferences</h1>
        
        <div className="mb-4">
          <label className="block mb-2 font-bold">Theme</label>
          <div className="flex gap-2">
            <button 
              className={`btn ${theme === 'light' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setTheme('light')}
            >
              Light Mode
            </button>
            <button 
              className={`btn ${theme === 'dark' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setTheme('dark')}
            >
              Dark Mode
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

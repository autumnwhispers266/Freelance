import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, PlayCircle, AlertCircle, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';

const MCQ_QUESTIONS = [
  {
    question: "Which of the following is the correct spelling?",
    options: ["Accommodate", "Accomodate", "Acomodate", "Acommodate"],
    correct: 0
  },
  {
    question: "Choose the grammatically correct sentence:",
    options: [
      "Their going to the store for supplies.",
      "They're going to the store for supplies.",
      "There going to the store for supplies.",
      "They going to the store for supplies."
    ],
    correct: 1
  },
  {
    question: "In a 'Strict Verbatim' transcription, how should you transcribe: 'I um, I ain't got no time for that.'?",
    options: [
      "I do not have time for that.",
      "I don't have any time for that.",
      "I, um, I ain't got no time for that.",
      "I ain't got no time for that."
    ],
    correct: 2
  }
];

const CORRECT_TRANSCRIPT = "The quarterly report indicates a significant increase in revenue. However, we must remain cautious about our Q3 projections due to market volatility.";
const SYSTEM_TRANSCRIPT = "The quarter report indicates a signifcant increse in revenue, however we must remain caution about our Q3 projections do to market volatility.";
// Errors: quarter (quarterly), signifcant (significant), increse (increase), however (However,), caution (cautious), do (due) - 6 errors.

export default function TranscriptionTestPage() {
  const [stage, setStage] = useState('intro'); // intro, mcq, audio-intro, audio-task, success
  const [mcqIndex, setMcqIndex] = useState(0);
  const [mcqScore, setMcqScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  
  const [userTranscript, setUserTranscript] = useState(SYSTEM_TRANSCRIPT);
  const [audioSubmitted, setAudioSubmitted] = useState(false);

  const navigate = useNavigate();

  const handleMcqSubmit = () => {
    if (selectedOption === null) return;
    
    if (selectedOption === MCQ_QUESTIONS[mcqIndex].correct) {
      setMcqScore(s => s + 1);
    }
    
    if (mcqIndex < MCQ_QUESTIONS.length - 1) {
      setMcqIndex(i => i + 1);
      setSelectedOption(null);
    } else {
      setStage('audio-intro');
    }
  };

  const handleAudioSubmit = () => {
    // Normalize both strings to compare easily (remove double spaces, match case, trim)
    const normalize = (str) => str.trim().replace(/\s+/g, ' ').toLowerCase();
    
    if (normalize(userTranscript) === normalize(CORRECT_TRANSCRIPT)) {
      setAudioSubmitted(true);
      setTimeout(() => setStage('success'), 1500);
    } else {
      toast.error('There are still errors in the transcript. Please listen closely and correct them.');
    }
  };

  const calculateProgress = () => {
    if (stage === 'intro') return 0;
    if (stage === 'mcq') return ((mcqIndex) / (MCQ_QUESTIONS.length + 1)) * 100;
    if (stage === 'audio-intro') return 75;
    if (stage === 'audio-task') return 85;
    if (stage === 'success') return 100;
    return 0;
  };

  return (
    <div className="container mt-4 mb-4 flex justify-center">
      <div className="card w-full max-w-3xl p-0 overflow-hidden shadow-base">
        
        {/* Progress Bar Header */}
        <div className="bg-navy p-4 text-white">
          <h1 className="mb-2" style={{ fontSize: '1.5rem', color: '#fff' }}>Transcription Assessment</h1>
          <div style={{ width: '100%', height: '8px', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{ 
              width: `${calculateProgress()}%`, 
              height: '100%', 
              backgroundColor: 'var(--status-green)', 
              transition: 'width 0.4s ease' 
            }}></div>
          </div>
          <div className="flex justify-between mt-2" style={{ fontSize: '0.875rem', opacity: 0.8 }}>
            <span>Multiple Choice</span>
            <span>Audio Correction</span>
          </div>
        </div>

        <div className="p-4" style={{ minHeight: '400px' }}>
          {/* STAGE: INTRO */}
          {stage === 'intro' && (
            <div className="text-center py-8 animation-fadeIn">
              <div style={{ width: '64px', height: '64px', backgroundColor: 'var(--bg-hover)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                <CheckCircle2 size={32} className="text-navy" />
              </div>
              <h2 className="text-navy mb-4" style={{ fontSize: '2rem', fontWeight: 800 }}>Transcription Assessment</h2>
              <p className="text-secondary mb-6 mx-auto" style={{ maxWidth: '600px', fontSize: '1.125rem', lineHeight: 1.6 }}>
                To unlock premium transcription and QA projects, you must complete this certification. Prove your attention to detail, grammar skills, and listening accuracy.
              </p>
              
              <div className="flex flex-col gap-4 mb-8 mx-auto" style={{ maxWidth: '500px', textAlign: 'left' }}>
                <div className="card p-4 border-base" style={{ borderLeft: '4px solid var(--accent-navy)', display: 'flex', gap: '16px', alignItems: 'center' }}>
                  <div style={{ backgroundColor: 'var(--bg-hover)', padding: '12px', borderRadius: '50%' }}><AlertCircle size={24} className="text-navy" /></div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '1.125rem', color: 'var(--text-primary)' }}>Part 1: MCQ Test</div>
                    <div className="text-secondary" style={{ fontSize: '0.875rem' }}>3 questions testing strict verbatim guidelines and grammar rules.</div>
                  </div>
                </div>

                <div className="card p-4 border-base" style={{ borderLeft: '4px solid var(--accent-navy)', display: 'flex', gap: '16px', alignItems: 'center' }}>
                  <div style={{ backgroundColor: 'var(--bg-hover)', padding: '12px', borderRadius: '50%' }}><PlayCircle size={24} className="text-navy" /></div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '1.125rem', color: 'var(--text-primary)' }}>Part 2: QA Editor</div>
                    <div className="text-secondary" style={{ fontSize: '0.875rem' }}>Listen to sample audio and correct an AI-generated transcript.</div>
                  </div>
                </div>
              </div>

              <button className="btn btn-primary" style={{ padding: '12px 32px', fontSize: '1.125rem' }} onClick={() => setStage('mcq')}>
                Start Assessment
              </button>
            </div>
          )}

          {/* STAGE: MCQ */}
          {stage === 'mcq' && (
            <div>
              <div className="text-secondary mb-3 font-bold">Question {mcqIndex + 1} of {MCQ_QUESTIONS.length}</div>
              <h2 className="text-navy mb-4">{MCQ_QUESTIONS[mcqIndex].question}</h2>
              
              <div className="flex flex-col gap-2 mb-4">
                {MCQ_QUESTIONS[mcqIndex].options.map((opt, idx) => (
                  <button 
                    key={idx}
                    onClick={() => setSelectedOption(idx)}
                    className="clickable p-3 text-left border-base radius-base"
                    style={{
                      backgroundColor: selectedOption === idx ? 'var(--bg-hover)' : '#fff',
                      borderColor: selectedOption === idx ? 'var(--accent-navy)' : 'var(--border-light)',
                      fontWeight: selectedOption === idx ? 700 : 400
                    }}
                  >
                    {opt}
                  </button>
                ))}
              </div>

              <div className="flex justify-end">
                <button 
                  className="btn btn-primary flex items-center gap-1" 
                  disabled={selectedOption === null}
                  onClick={handleMcqSubmit}
                >
                  Next <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* STAGE: AUDIO INTRO */}
          {stage === 'audio-intro' && (
            <div className="text-center py-4">
              <CheckCircle2 size={48} className="text-green mx-auto mb-3" />
              <h2 className="text-navy mb-3">Part 1 Complete!</h2>
              <p className="text-secondary mb-4 mx-auto" style={{ maxWidth: '500px' }}>
                You scored {mcqScore} out of {MCQ_QUESTIONS.length} on the grammar test. 
                Now, you will act as a QA Editor. We will provide an audio snippet and an AI-generated transcript containing <strong>6 errors</strong>. 
                Your task is to listen closely and correct the text.
              </p>
              <button className="btn btn-primary" onClick={() => setStage('audio-task')}>Start Audio Challenge</button>
            </div>
          )}

          {/* STAGE: AUDIO TASK */}
          {stage === 'audio-task' && (
            <div>
              <h2 className="text-navy mb-3">Audio QA Editor</h2>
              
              {/* Real HTML5 Audio Player */}
              <div className="mb-4">
                <audio 
                  controls 
                  src="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" 
                  style={{ width: '100%', borderRadius: 'var(--radius-base)', outline: 'none' }} 
                >
                  Your browser does not support the audio element.
                </audio>
                <div className="text-secondary mt-1 text-center" style={{ fontSize: '0.75rem' }}>
                  (Demo Placeholder Audio)
                </div>
              </div>

              <div className="bg-red-light p-3 radius-base mb-4 flex gap-2 items-start" style={{ backgroundColor: '#fef2f2', color: '#991b1b', border: '1px solid #fecaca' }}>
                <AlertCircle size={20} style={{ flexShrink: 0 }} />
                <div style={{ fontSize: '0.875rem' }}>
                  <strong>Task:</strong> The system generated transcript below contains 6 errors (misspellings, wrong words, or punctuation). Edit the text to match the audio perfectly.
                </div>
              </div>

              <div className="mb-4">
                <label className="block mb-2 font-bold">Generated Transcript (Editable)</label>
                <textarea 
                  className="input-base" 
                  rows={4} 
                  value={userTranscript}
                  onChange={(e) => setUserTranscript(e.target.value)}
                  style={{ 
                    fontSize: '1.125rem', 
                    lineHeight: '1.5',
                    borderColor: audioSubmitted ? 'var(--status-green)' : 'var(--border-light)'
                  }}
                ></textarea>
              </div>

              <button 
                className="btn btn-primary w-full flex items-center justify-center gap-2" 
                onClick={handleAudioSubmit}
                disabled={audioSubmitted}
              >
                {audioSubmitted ? 'Perfect Match!' : 'Submit Corrections'}
              </button>
            </div>
          )}

          {/* STAGE: SUCCESS */}
          {stage === 'success' && (
            <div className="text-center py-4">
              <CheckCircle2 size={64} className="text-green mx-auto mb-3" />
              <h2 className="text-navy mb-3">Assessment Passed!</h2>
              <p className="text-secondary mb-4 mx-auto" style={{ maxWidth: '500px' }}>
                Congratulations! You successfully corrected all errors and passed the literacy assessment. You are now qualified to apply for Transcription and QA jobs.
              </p>
              <button className="btn btn-primary" onClick={() => navigate('/jobs?category=Transcription')}>
                Browse Transcription Jobs
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

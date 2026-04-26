import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Play, Pause } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { Stepper } from "./onboarding";

export const Route = createFileRoute("/transcription-test")({
  component: TranscriptionTest,
  head: () => ({ meta: [{ title: "English Comprehension Check — Worklin" }] }),
});

const CLIPS = [
  {
    url: "https://archive.org/download/SoundsofnatureTreefroginpond/Sounds%20of%20nature%20-%20Tree%20frog%20in%20pond.mp3",
    // For demo: a fixed reference sentence shown to user expectations is impractical without real spoken audio.
    // We use short, well-known public-domain reference text the user is expected to type after listening.
    reference: "The quick brown fox jumps over the lazy dog near the riverbank.",
  },
  {
    url: "https://archive.org/download/SoundsofnatureTreefroginpond/Sounds%20of%20nature%20-%20Tree%20frog%20in%20pond.mp3",
    reference: "She sells fresh seashells on the sunny seashore every Saturday morning.",
  },
  {
    url: "https://archive.org/download/SoundsofnatureTreefroginpond/Sounds%20of%20nature%20-%20Tree%20frog%20in%20pond.mp3",
    reference: "Please email the contract draft to the legal team before five o'clock today.",
  },
];

function similarity(a: string, b: string) {
  const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9 ]/g, "").split(/\s+/).filter(Boolean);
  const aw = norm(a), bw = norm(b);
  if (aw.length === 0) return 0;
  let matched = 0;
  const used = new Set<number>();
  for (const w of aw) {
    const idx = bw.findIndex((x, i) => !used.has(i) && x === w);
    if (idx >= 0) { matched++; used.add(idx); }
  }
  return Math.round((matched / Math.max(aw.length, bw.length)) * 100);
}

function TranscriptionTest() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [testIdx, setTestIdx] = useState(0);
  const [attempt, setAttempt] = useState(1);
  const [text, setText] = useState("");
  const [scores, setScores] = useState<number[]>([]);
  const [done, setDone] = useState(false);
  const [finalPass, setFinalPass] = useState(false);
  const [showRef, setShowRef] = useState(false);

  const submit = async () => {
    const score = similarity(text, CLIPS[testIdx].reference);
    const passed = score >= 70;
    if (user) {
      await supabase.from("transcription_attempts").insert({
        user_id: user.id, test_number: testIdx + 1, attempt_number: attempt, score, passed,
      });
    }
    if (passed) {
      const newScores = [...scores, score];
      setScores(newScores);
      setText("");
      setAttempt(1);
      setShowRef(false);
      if (testIdx + 1 >= CLIPS.length) {
        const avg = Math.round(newScores.reduce((a, b) => a + b, 0) / newScores.length);
        const overall = avg >= 70;
        setFinalPass(overall);
        setDone(true);
        if (user) {
          await supabase.from("profiles").update({ test_score: avg, verification: overall ? "verified" : "pending" }).eq("id", user.id);
        }
      } else {
        setTestIdx(testIdx + 1);
      }
    } else {
      if (attempt >= 3) {
        const newScores = [...scores, score];
        const avg = Math.round(newScores.reduce((a, b) => a + b, 0) / newScores.length);
        setFinalPass(false);
        setDone(true);
        if (user) {
          await supabase.from("profiles").update({ test_score: avg, verification: "rejected" }).eq("id", user.id);
        }
      } else {
        setAttempt(attempt + 1);
        setText("");
      }
    }
  };

  if (done) {
    const avg = Math.round(scores.reduce((a, b) => a + b, 0) / Math.max(scores.length, 1));
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
        <div className="w-full max-w-md text-center wl-card p-10">
          <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Result</div>
          <div className="mt-4 text-6xl font-bold">{avg}%</div>
          <div className={`mt-3 text-lg font-semibold ${finalPass ? "text-success" : "text-destructive"}`}>
            {finalPass ? "Pass" : "Fail"}
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            {finalPass ? "You passed the English comprehension check. Your transcription role is verified." : "You did not meet the threshold this time. You can retry from your dashboard."}
          </p>
          <button onClick={() => navigate({ to: "/dashboard" })} className="mt-6 inline-flex h-11 items-center justify-center rounded-[4px] bg-primary px-6 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
            Continue to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background px-4 py-12">
      <div className="mx-auto max-w-2xl">
        <Stepper step={testIdx + 1} labels={["Test 1 of 3", "Test 2 of 3", "Test 3 of 3"]} />
        <div className="mt-8 wl-card p-8">
          <h1 className="text-2xl font-bold">English Comprehension Check</h1>
          <p className="mt-1 text-sm text-muted-foreground">Listen carefully and type exactly what you hear.</p>
          <div className="mt-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Attempt {attempt} of 3</div>

          <div className="mt-6">
            <FlatPlayer src={CLIPS[testIdx].url} />
          </div>

          <button type="button" onClick={() => setShowRef((s) => !s)} className="mt-3 text-xs font-medium text-primary hover:underline">
            {showRef ? "Hide reference" : "Reveal reference (demo only)"}
          </button>
          {showRef && <div className="mt-2 rounded-[4px] border border-dashed border-border bg-surface px-3 py-2 text-sm">{CLIPS[testIdx].reference}</div>}

          <div className="mt-6">
            <label className="mb-1.5 flex items-center justify-between text-xs font-medium"><span>Your transcription here</span><span className="text-muted-foreground">{text.length} chars</span></label>
            <textarea value={text} onChange={(e) => setText(e.target.value)} rows={4} className="w-full rounded-[4px] border border-border bg-surface px-3 py-2 text-sm focus:border-primary focus:outline-none" />
          </div>

          <div className="mt-6 flex justify-end">
            <button onClick={submit} disabled={!text.trim()} className="h-11 rounded-[4px] bg-primary px-6 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
              {testIdx + 1 < CLIPS.length ? "Next" : "Submit"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function FlatPlayer({ src }: { src: string }) {
  const ref = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const el = ref.current; if (!el) return;
    const onTime = () => { setProgress(el.currentTime); };
    const onLoad = () => setDuration(el.duration || 0);
    const onEnd = () => setPlaying(false);
    el.addEventListener("timeupdate", onTime);
    el.addEventListener("loadedmetadata", onLoad);
    el.addEventListener("ended", onEnd);
    return () => {
      el.removeEventListener("timeupdate", onTime);
      el.removeEventListener("loadedmetadata", onLoad);
      el.removeEventListener("ended", onEnd);
    };
  }, []);

  const toggle = () => {
    const el = ref.current; if (!el) return;
    if (playing) { el.pause(); setPlaying(false); } else { el.play(); setPlaying(true); }
  };
  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current; if (!el || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    el.currentTime = ratio * duration;
    setProgress(el.currentTime);
  };
  const fmt = (n: number) => `${Math.floor(n / 60).toString().padStart(2, "0")}:${Math.floor(n % 60).toString().padStart(2, "0")}`;

  return (
    <div className="flex items-center gap-3 rounded-[4px] border border-border bg-surface p-3">
      <audio ref={ref} src={src} preload="metadata" />
      <button type="button" onClick={toggle} aria-label={playing ? "Pause" : "Play"} className="grid h-10 w-10 place-items-center rounded-[4px] bg-primary text-primary-foreground">
        {playing ? <Pause size={16} /> : <Play size={16} />}
      </button>
      <div onClick={seek} className="relative h-2 flex-1 cursor-pointer overflow-hidden rounded-[2px] bg-muted">
        <div className="absolute inset-y-0 left-0 bg-primary" style={{ width: duration ? `${(progress / duration) * 100}%` : "0%" }} />
      </div>
      <div className="text-xs tabular-nums text-muted-foreground">{fmt(progress)} / {fmt(duration)}</div>
    </div>
  );
}

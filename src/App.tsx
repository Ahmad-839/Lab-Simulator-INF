import { Suspense, lazy, useEffect, useMemo, useState } from 'react';
import { NavTab, StudentProgress } from './types/network';
import { loadStudentProgress, saveStudentProgress } from './utils/storage';
import { createLanStarterTopology, createWifiStarterTopology } from './data/presets';
import { TopNav } from './components/TopNav';
import { DashboardView } from './components/DashboardView';

const LearnView = lazy(() =>
  import('./components/LearnView').then((m) => ({ default: m.LearnView }))
);
const SimulatorWorkspace = lazy(() =>
  import('./components/SimulatorWorkspace').then((m) => ({ default: m.SimulatorWorkspace }))
);
const MissionsView = lazy(() =>
  import('./components/MissionsView').then((m) => ({ default: m.MissionsView }))
);
const QuizView = lazy(() =>
  import('./components/QuizView').then((m) => ({ default: m.QuizView }))
);
const GuideView = lazy(() =>
  import('./components/GuideView').then((m) => ({ default: m.GuideView }))
);
const IdentitasView = lazy(() =>
  import('./components/IdentitasView').then((m) => ({ default: m.IdentitasView }))
);

function ViewLoadingFallback() {
  return (
    <div className="mx-auto max-w-[1440px] px-4 py-12 sm:px-6">
      <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-600">
        Memuat modul laboratorium virtual...
      </div>
    </div>
  );
}

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('autostart') === '1') return 'simulator_lan';
    }
    return 'beranda';
  });

  const [progress, setProgress] = useState<StudentProgress>(() => loadStudentProgress());
  const [focusedLessonId, setFocusedLessonId] = useState<string | null>(null);
  const [focusedMissionId, setFocusedMissionId] = useState<string | null>(null);

  const lanStarter = useMemo(() => createLanStarterTopology(), []);
  const wifiStarter = useMemo(() => createWifiStarterTopology(), []);

  useEffect(() => {
    saveStudentProgress(progress);
  }, [progress]);

  const handleCompleteLesson = (lessonId: string) => {
    setProgress((prev) => {
      if (prev.completedLessons.includes(lessonId)) return prev;
      return {
        ...prev,
        completedLessons: [...prev.completedLessons, lessonId],
      };
    });
  };

  const handleMissionComplete = (missionId: string, score: number) => {
    setProgress((prev) => ({
      ...prev,
      completedMissions: {
        ...prev.completedMissions,
        [missionId]: Math.max(prev.completedMissions[missionId] ?? 0, score),
      },
    }));
  };

  const handleFinishQuiz = (score: number) => {
    setProgress((prev) => ({
      ...prev,
      quizBestScore: prev.quizBestScore === null ? score : Math.max(prev.quizBestScore, score),
      quizLastAttemptDate: new Date().toISOString(),
    }));
  };

  const handleSuccessfulPing = () => {
    setProgress((prev) => ({
      ...prev,
      successfulPings: prev.successfulPings + 1,
    }));
  };

  const handleStartMissionFromDashboard = (missionId: string) => {
    setFocusedMissionId(missionId);
    setActiveTab('misi');
  };

  const handleReviewTopicFromQuiz = (topicId: string) => {
    setFocusedLessonId(topicId);
    setActiveTab('belajar');
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900">
      <TopNav activeTab={activeTab} onSelectTab={setActiveTab} />

      <div className="flex-1">
        <Suspense fallback={<ViewLoadingFallback />}>
          {activeTab === 'beranda' && (
            <DashboardView
              progress={progress}
              onNavigate={setActiveTab}
              onStartMission={handleStartMissionFromDashboard}
            />
          )}

          {activeTab === 'belajar' && (
            <LearnView
              completedLessons={progress.completedLessons}
              onCompleteLesson={handleCompleteLesson}
              onNavigate={setActiveTab}
              initialTopicId={focusedLessonId}
            />
          )}

          {activeTab === 'simulator_lan' && (
            <SimulatorWorkspace
              key="sim-lan"
              mode="lan"
              initialDevices={lanStarter.devices}
              initialConnections={lanStarter.connections}
              onSuccessfulPing={handleSuccessfulPing}
            />
          )}

          {activeTab === 'simulator_wifi' && (
            <SimulatorWorkspace
              key="sim-wifi"
              mode="wifi"
              initialDevices={wifiStarter.devices}
              initialConnections={wifiStarter.connections}
              onSuccessfulPing={handleSuccessfulPing}
            />
          )}

          {activeTab === 'misi' && (
            <MissionsView
              completedMissions={progress.completedMissions}
              onMissionComplete={handleMissionComplete}
              onSuccessfulPing={handleSuccessfulPing}
              initialMissionId={focusedMissionId}
            />
          )}

          {activeTab === 'evaluasi' && (
            <QuizView
              bestScore={progress.quizBestScore}
              onFinishQuiz={handleFinishQuiz}
              onReviewTopic={handleReviewTopicFromQuiz}
            />
          )}

          {activeTab === 'panduan' && <GuideView onNavigate={setActiveTab} />}

          {activeTab === 'identitas' && <IdentitasView onNavigate={setActiveTab} />}
        </Suspense>
      </div>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-4 px-4 py-4 text-xs text-slate-500 sm:px-6">
          <p>
            NETWORK LAB SIMULATOR: Virtual LAN &amp; WiFi Assembly ·{' '}
            <strong className="font-semibold text-slate-700">SMK 02 Islam 45 Ambulu</strong>
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <button
              type="button"
              onClick={() => setActiveTab('belajar')}
              className="hover:text-slate-900"
            >
              Materi
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('misi')}
              className="hover:text-slate-900"
            >
              Misi Praktik
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('panduan')}
              className="hover:text-slate-900"
            >
              Petunjuk Siswa
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('identitas')}
              className="hover:text-slate-900"
            >
              Identitas Sekolah
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}

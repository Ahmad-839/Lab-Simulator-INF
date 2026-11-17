import { StudentProgress } from '../types/network';

const STORAGE_KEY = 'network_lab_simulator_progress_v1';

export const DEFAULT_PROGRESS: StudentProgress = {
  completedLessons: [],
  completedMissions: {},
  quizBestScore: null,
  quizLastAttemptDate: null,
  totalLabsBuilt: 0,
  successfulPings: 0,
};

export function loadStudentProgress(): StudentProgress {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_PROGRESS };
    const parsed = JSON.parse(raw) as Partial<StudentProgress>;
    return {
      completedLessons: Array.isArray(parsed.completedLessons) ? parsed.completedLessons : [],
      completedMissions:
        parsed.completedMissions && typeof parsed.completedMissions === 'object'
          ? parsed.completedMissions
          : {},
      quizBestScore: typeof parsed.quizBestScore === 'number' ? parsed.quizBestScore : null,
      quizLastAttemptDate:
        typeof parsed.quizLastAttemptDate === 'string' ? parsed.quizLastAttemptDate : null,
      totalLabsBuilt: typeof parsed.totalLabsBuilt === 'number' ? parsed.totalLabsBuilt : 0,
      successfulPings: typeof parsed.successfulPings === 'number' ? parsed.successfulPings : 0,
    };
  } catch {
    return { ...DEFAULT_PROGRESS };
  }
}

export function saveStudentProgress(progress: StudentProgress): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch {
    // Ignore storage quota errors
  }
}

export function calculateOverallScore(progress: StudentProgress): {
  totalPoints: number;
  maxPoints: number;
  completionPercent: number;
} {
  const lessonPoints = progress.completedLessons.length * 20; // 9 * 20 = 180
  const missionPoints = Object.values(progress.completedMissions).reduce((sum, s) => sum + s, 0); // max 550
  const quizPoints = progress.quizBestScore ?? 0; // max 100
  const totalPoints = lessonPoints + missionPoints + quizPoints;
  const maxPoints = 180 + 550 + 100; // 830

  const lessonRatio = progress.completedLessons.length / 9;
  const missionRatio = Object.keys(progress.completedMissions).length / 5;
  const quizRatio = progress.quizBestScore !== null ? 1 : 0;
  const completionPercent = Math.round(((lessonRatio + missionRatio + quizRatio) / 3) * 100);

  return { totalPoints, maxPoints, completionPercent };
}

import React, { useState } from 'react';
import { Award, BookOpen, CheckCircle2, RotateCcw, XCircle } from 'lucide-react';
import { QUIZ_QUESTIONS } from '../data/curriculum';

interface Props {
  bestScore: number | null;
  onFinishQuiz: (score: number) => void;
  onReviewTopic: (topicId: string) => void;
}

export const QuizView: React.FC<Props> = ({ bestScore, onFinishQuiz, onReviewTopic }) => {
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);

  const answeredCount = Object.keys(answers).length;
  const totalQuestions = QUIZ_QUESTIONS.length;

  const correctCount = QUIZ_QUESTIONS.filter((q) => answers[q.id] === q.correctIndex).length;
  const finalScore = Math.round((correctCount / totalQuestions) * 100);

  const wrongTopics = Array.from(
    new Map(
      QUIZ_QUESTIONS.filter((q) => answers[q.id] !== q.correctIndex).map((q) => [
        q.topicId,
        q.topicTitle,
      ])
    ).entries()
  );

  const handleSubmit = () => {
    if (answeredCount < totalQuestions) return;
    setSubmitted(true);
    onFinishQuiz(finalScore);
  };

  const handleReset = () => {
    setAnswers({});
    setSubmitted(false);
  };

  return (
    <main className="mx-auto max-w-[1000px] space-y-6 px-4 py-8 sm:px-6">
      <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold tracking-wider text-cyan-700">
            Evaluasi Pemahaman · {totalQuestions} Soal Pilihan Ganda
          </p>
          <h1 className="mt-1 font-display text-2xl font-extrabold text-slate-900">
            Kuis Evaluasi Jaringan LAN &amp; WiFi
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Jawab seluruh {totalQuestions} soal untuk melihat skor akhir, pembahasan jawaban, dan rekomendasi materi belajar.
          </p>
        </div>

        <div className="flex items-center gap-5 shrink-0 tabular-nums">
          <div>
            <span className="block text-xs text-slate-500">Terjawab</span>
            <span className="font-mono text-lg font-bold text-slate-900">
              {answeredCount} / {totalQuestions}
            </span>
          </div>
          {bestScore !== null && (
            <div>
              <span className="block text-xs text-slate-500">Skor Terbaik</span>
              <span className="font-mono text-lg font-bold text-emerald-700">{bestScore} / 100</span>
            </div>
          )}
        </div>
      </div>

      {submitted && (
        <section
          aria-live="polite"
          className="rounded-2xl border border-slate-200 bg-slate-900 p-6 text-white"
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-cyan-500/20 text-cyan-300">
                <Award className="h-8 w-8" />
              </div>
              <div>
                <p className="text-xs font-medium text-cyan-300">Hasil Evaluasi Anda</p>
                <h2 className="font-display text-2xl font-extrabold tabular-nums">
                  Skor Akhir: {finalScore} / 100
                </h2>
                <p className="text-sm text-slate-300">
                  Benar {correctCount} dari {totalQuestions} soal ·{' '}
                  {finalScore >= 75 ? 'Kompeten! Siap merakit jaringan lab.' : 'Perlu mengulang beberapa materi dasar.'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 hover:bg-cyan-50 whitespace-nowrap"
            >
              <RotateCcw className="h-4 w-4" />
              Ulangi Kuis
            </button>
          </div>

          {wrongTopics.length > 0 && (
            <div className="mt-5 border-t border-slate-800 pt-4">
              <p className="text-xs font-semibold text-amber-300">
                Rekomendasi Materi yang Perlu Dipelajari Kembali:
              </p>
              <div className="mt-2.5 flex flex-wrap gap-2">
                {wrongTopics.map(([topicId, topicTitle]) => (
                  <button
                    key={topicId}
                    type="button"
                    onClick={() => onReviewTopic(topicId)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-medium text-white hover:border-cyan-500 hover:text-cyan-300"
                  >
                    <BookOpen className="h-3.5 w-3.5 text-cyan-400" />
                    Pelajari: {topicTitle}
                  </button>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      <div className="space-y-4">
        {QUIZ_QUESTIONS.map((q, qIdx) => {
          const chosen = answers[q.id];
          const isCorrect = chosen === q.correctIndex;
          return (
            <section
              key={q.id}
              className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="font-mono text-xs font-semibold text-cyan-700">
                    Soal {qIdx + 1} · {q.topicTitle}
                  </span>
                  <h2 className="mt-1 font-display text-base font-bold text-slate-900">
                    {q.question}
                  </h2>
                </div>
                {submitted && (
                  <span
                    className={`inline-flex items-center gap-1 text-xs font-bold whitespace-nowrap ${
                      isCorrect ? 'text-emerald-700' : 'text-rose-700'
                    }`}
                  >
                    {isCorrect ? (
                      <>
                        <CheckCircle2 className="h-4 w-4" /> Benar
                      </>
                    ) : (
                      <>
                        <XCircle className="h-4 w-4" /> Salah
                      </>
                    )}
                  </span>
                )}
              </div>

              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                {q.options.map((opt, oIdx) => {
                  const isSelected = chosen === oIdx;
                  const isRightAnswer = oIdx === q.correctIndex;
                  let style = 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50';
                  if (submitted) {
                    if (isRightAnswer) {
                      style = 'border-emerald-500 bg-emerald-50 font-semibold text-emerald-950';
                    } else if (isSelected && !isRightAnswer) {
                      style = 'border-rose-400 bg-rose-50 text-rose-950';
                    }
                  } else if (isSelected) {
                    style = 'border-cyan-600 bg-cyan-50 font-semibold text-slate-950';
                  }

                  return (
                    <button
                      key={oIdx}
                      type="button"
                      disabled={submitted}
                      onClick={() => setAnswers((prev) => ({ ...prev, [q.id]: oIdx }))}
                      className={`flex items-start gap-2.5 rounded-lg border px-3.5 py-2.5 text-left text-sm transition-colors ${style}`}
                    >
                      <span className="mt-0.5 font-mono text-xs font-bold text-slate-500">
                        {String.fromCharCode(65 + oIdx)}.
                      </span>
                      <span>{opt}</span>
                    </button>
                  );
                })}
              </div>

              {submitted && (
                <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs leading-relaxed text-slate-700">
                  <strong className="text-slate-900">Pembahasan:</strong> {q.explanation}
                </div>
              )}
            </section>
          );
        })}
      </div>

      {!submitted && (
        <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-600">
            {answeredCount < totalQuestions
              ? `Lengkapi ${totalQuestions - answeredCount} soal lagi sebelum mengirim jawaban.`
              : 'Seluruh soal sudah dijawab. Klik tombol di samping untuk melihat hasil.'}
          </p>
          <button
            type="button"
            disabled={answeredCount < totalQuestions}
            onClick={handleSubmit}
            className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-cyan-700 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            Selesai &amp; Nilai Kuis
          </button>
        </div>
      )}
    </main>
  );
};

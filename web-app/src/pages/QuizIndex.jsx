import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import GuideLayout from "../components/GuideLayout";
import KnowledgeCheck from "../components/KnowledgeCheck";
import InterviewCards from "../components/InterviewCards";
import QuestionEditor from "../components/QuestionEditor";
import { QUIZZES } from "../data/quizBank";
import { parseQuestions } from "../lib/questionFormat";

/* Every .txt in the project's questions/ folder, bundled at build time.
   Adding a file needs no code change — it is discovered by this glob. With
   the dev server running, saving a file hot-reloads this page. */
const FILES = import.meta.glob("/questions/*.txt", { query: "?raw", import: "default", eager: true });

const fromFiles = Object.entries(FILES).map(([path, raw]) => {
  const name = path.split("/").pop();
  return { name, ...parseQuestions(raw, name) };
});

const STORE = "custom-questions";
const loadCustom = () => {
  try {
    return localStorage.getItem(STORE) || "";
  } catch {
    return "";
  }
};

const FILE_TONES = ["purple", "blue", "emerald", "amber", "rose", "indigo"];

const TONES = {
  amber: "border-amber-500/30 bg-amber-500/[0.08] hover:border-amber-500/60",
  indigo: "border-indigo-500/30 bg-indigo-500/[0.08] hover:border-indigo-500/60",
  blue: "border-blue-500/30 bg-blue-500/[0.08] hover:border-blue-500/60",
  rose: "border-rose-500/30 bg-rose-500/[0.08] hover:border-rose-500/60",
  purple: "border-purple-500/30 bg-purple-500/[0.08] hover:border-purple-500/60",
  emerald: "border-emerald-500/30 bg-emerald-500/[0.08] hover:border-emerald-500/60",
};

export default function QuizIndex() {
  const [active, setActive] = useState(null);
  const [custom, setCustom] = useState(loadCustom);

  useEffect(() => {
    try {
      localStorage.setItem(STORE, custom);
    } catch {
      /* private mode — questions last for this visit only */
    }
  }, [custom]);

  const mine = useMemo(() => parseQuestions(custom, "your questions"), [custom]);

  // Built-in quizzes, then one card per topic found in files, then yours.
  const all = useMemo(() => {
    const toCard = (t, i, origin) => ({
      id: `${origin}:${t.id}`,
      topic: t.name,
      label: t.name,
      icon: origin === "mine" ? "✍️" : "📄",
      tone: FILE_TONES[i % FILE_TONES.length],
      origin,
      questions: t.questions,
    });
    const files = fromFiles.flatMap((f) => f.topics).map((t, i) => toCard(t, i, "file"));
    const yours = mine.topics.map((t, i) => toCard(t, i + 2, "mine"));
    return [...QUIZZES.map((q) => ({ ...q, origin: "builtin" })), ...files, ...yours];
  }, [mine]);

  const errors = [...fromFiles.flatMap((f) => f.errors), ...mine.errors];
  const quiz = all.find((q) => q.id === active);
  const mcq = quiz ? quiz.questions.filter((q) => q.type !== "open") : [];
  const open = quiz ? quiz.questions.filter((q) => q.type === "open") : [];

  const total = all.reduce((a, q) => a + q.questions.length, 0);

  const toc = [
    { label: "Pick a Topic", hash: "pick" },
    ...(quiz ? [{ label: quiz.label, hash: "quiz" }] : []),
    { label: "Add Your Own", hash: "yours" },
    { label: "How to Use These", hash: "how" },
  ];

  return (
    <GuideLayout
      title="Knowledge Checks"
      intro={`${total} questions across ${all.length} topics — built-in checks, interview questions from text files, and any you add yourself.`}
      toc={toc}
    >
      <section id="pick" className="mb-12 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-5">Pick a Topic</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {all.map((q) => (
            <button
              key={q.id}
              onClick={() => {
                setActive(q.id === active ? null : q.id);
                if (q.id !== active) {
                  setTimeout(() => {
                    document.getElementById("quiz")?.scrollIntoView({ behavior: "smooth", block: "start" });
                  }, 60);
                }
              }}
              className={`text-left p-5 rounded-xl border transition-colors ${
                TONES[q.tone] || TONES.indigo
              } ${active === q.id ? "ring-1 ring-white/30" : ""}`}
            >
              <div className="text-2xl mb-2">{q.icon}</div>
              <div className="font-semibold text-white text-sm mb-1">{q.label}</div>
              <div className="text-xs text-gray-400">
                {q.questions.length} question{q.questions.length === 1 ? "" : "s"}
                {q.origin === "file" && " · from file"}
                {q.origin === "mine" && " · added by you"}
              </div>
            </button>
          ))}
        </div>
      </section>

      {quiz && (
        <section id="quiz" className="mb-12 scroll-mt-24">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
            <h2 className="text-2xl font-bold text-white m-0">{quiz.label}</h2>
            {quiz.path && (
              <Link to={quiz.path} className="text-xs font-semibold text-blue-400 hover:underline shrink-0">
                Read the guide →
              </Link>
            )}
          </div>
          <KnowledgeCheck key={quiz.id} questions={mcq} title={`${quiz.icon} ${quiz.topic}`} />
          <InterviewCards key={quiz.id + ":open"} questions={open} />
        </section>
      )}

      <section id="yours" className="mb-12 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-2">Add Your Own</h2>
        <p className="text-gray-400 leading-relaxed max-w-3xl mb-5 text-sm">
          Add quiz or interview questions here, import a text file, or put <span className="font-mono text-gray-300">.txt</span>{" "}
          files in the project's <span className="font-mono text-gray-300">questions/</span> folder — every file there
          is loaded automatically. Questions you add here are saved in this browser; export them to make them
          permanent.
        </p>
        <QuestionEditor text={custom} onChange={setCustom} topicNames={[...new Set(all.map((q) => q.topic))]} />

        {errors.length > 0 && (
          <div className="mt-5 rounded-xl border border-amber-500/30 bg-amber-500/[0.08] p-4">
            <div className="text-sm font-semibold text-amber-300 mb-2">
              {errors.length} problem{errors.length === 1 ? "" : "s"} in your question text
            </div>
            <ul className="space-y-1 m-0 pl-0 list-none">
              {errors.slice(0, 12).map((e, i) => (
                <li key={i} className="text-xs text-amber-100/90 font-mono">
                  {e.source}, line {e.line}: {e.message}
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      <section id="how" className="mb-4 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-4">How to Use These</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
          {[
            [
              "Answer before reading",
              "Try the questions for a topic before you read its guide. Getting one wrong first makes the explanation stick far better than reading it cold.",
            ],
            [
              "The explanation is the content",
              "Every answer carries a short argument for why it is right and why the near-misses are wrong. Several of them cover points the guides only touch in passing.",
            ],
            [
              "Nothing is scored",
              "No account and no tracking. Scores reset when you leave the page, because the point is the reasoning rather than a number. Only questions you add are remembered, on this device.",
            ],
          ].map(([t, d]) => (
            <div key={t} className="p-5 rounded-xl border border-white/10 bg-white/5">
              <div className="text-sm font-semibold text-white mb-2">{t}</div>
              <p className="text-xs text-gray-400 leading-relaxed m-0">{d}</p>
            </div>
          ))}
        </div>
        <div className="p-4 rounded-xl border border-white/10 bg-white/5">
          <p className="text-sm text-gray-400 leading-relaxed m-0">
            The same checks appear at the foot of their own guide pages. For a structured route through the material
            see <a href="#/roadmaps" className="text-blue-400 hover:underline">Learning Paths</a>, or{" "}
            <a href="#/graph" className="text-blue-400 hover:underline">the topic map</a> for how everything connects.
          </p>
        </div>
      </section>
    </GuideLayout>
  );
}

"use client";

import React, { useState } from 'react';

type QuizData = {
  id: string;
  title: string;
  questions: any[];
  flashcards: any[];
};

export default function QuizView({ quiz }: { quiz: QuizData }) {
  const [activeTab, setActiveTab] = useState<'questions' | 'flashcards'>('questions');

  const exportPDF = () => {
    window.print();
  };

  const optionLetters = ['A', 'B', 'C', 'D', 'E', 'F'];

  React.useEffect(() => {
    const renderMath = () => {
      if (typeof window !== 'undefined' && (window as any).renderMathInElement) {
        (window as any).renderMathInElement(document.body, {
          delimiters: [
            { left: '$$', right: '$$', display: true },
            { left: '$', right: '$', display: false },
            { left: '\\(', right: '\\)', display: false },
            { left: '\\[', right: '\\]', display: true }
          ],
          throwOnError: false
        });
      }
    };

    renderMath();
    const timer = setTimeout(renderMath, 200);
    return () => clearTimeout(timer);
  }, [activeTab, quiz]);

  return (
    <div>
      {/* 1. PRINT/PDF VIEW ONLY (Bordered Board-Exam Question Table) */}
      <div className="print-only exam-header">
        <h1 className="exam-title">{quiz.title}</h1>
        <div className="exam-meta">
          <div className="exam-meta-item"><strong>Candidate Name:</strong> ___________________________</div>
          <div className="exam-meta-item"><strong>Date:</strong> ___________________________</div>
          <div className="exam-meta-item"><strong>Total Questions:</strong> {quiz.questions.length}</div>
          <div className="exam-meta-item"><strong>Score:</strong> ________ / {quiz.questions.length}</div>
        </div>
        <div className="exam-instructions">
          <strong>Instructions:</strong> Please read each question carefully and write/mark the correct option in the blank space next to each question. Do not open the test until instructed to do so.
        </div>
      </div>

      <table className="print-only exam-table">
        <thead>
          <tr>
            <th className="col-no" style={{ textAlign: 'center' }}>Q No</th>
            <th className="col-content">Questions and Options</th>
            <th className="col-marks" style={{ textAlign: 'center' }}>Marks</th>
          </tr>
        </thead>
        <tbody>
          {quiz.questions.map((q, idx) => {
            const parsedOptions = q.options ? JSON.parse(q.options) : [];
            return (
              <tr key={q.id}>
                <td className="q-no">{idx + 1}</td>
                <td className="q-content">
                  <div className="print-q-text">{q.questionText}</div>
                  <div className="print-options-container">
                    {parsedOptions.map((opt: string, i: number) => (
                      <div key={i} className="print-option-item">
                        <span className="print-option-label">({optionLetters[i]?.toLowerCase() || i + 1})</span>
                        <span>{opt}</span>
                      </div>
                    ))}
                  </div>
                </td>
                <td className="q-marks">1</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* 2. SCREEN VIEW ONLY (Premium Interactive Web Dashboard) */}
      {/* Navigation tabs - Hidden when printing */}
      <div className="no-print tab-bar" style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
        <button 
          onClick={() => setActiveTab('questions')}
          style={{ 
            color: activeTab === 'questions' ? 'var(--primary)' : 'var(--foreground)',
            fontWeight: activeTab === 'questions' ? 600 : 400,
            borderBottom: activeTab === 'questions' ? '2px solid var(--primary)' : 'none',
            paddingBottom: '0.5rem',
            marginBottom: '-1rem'
          }}
        >
          Quiz Questions
        </button>
        <button 
          onClick={() => setActiveTab('flashcards')}
          style={{ 
            color: activeTab === 'flashcards' ? 'var(--primary)' : 'var(--foreground)',
            fontWeight: activeTab === 'flashcards' ? 600 : 400,
            borderBottom: activeTab === 'flashcards' ? '2px solid var(--primary)' : 'none',
            paddingBottom: '0.5rem',
            marginBottom: '-1rem'
          }}
        >
          Flashcards
        </button>
        
        <div style={{ flex: 1 }} />
        <button className="btn-primary" onClick={exportPDF}>
          Export PDF (Questions Only)
        </button>
      </div>

      {/* Questions list for screen */}
      {activeTab === 'questions' && (
        <div className="no-print" style={{ display: 'flex', flexDirection: 'column' }}>
          {quiz.questions.map((q, idx) => (
            <div key={q.id} className="question-card">
              <h3 className="question-text">
                {idx + 1}. {q.questionText}
              </h3>
              {q.options && JSON.parse(q.options).length > 0 && (
                <ul className="options-list">
                  {JSON.parse(q.options).map((opt: string, i: number) => (
                    <li 
                      key={i} 
                      className={`option-item ${opt === q.correctAnswer ? 'correct-answer' : ''}`}
                    >
                      <span className="option-letter">{optionLetters[i] || i + 1}</span>
                      <span>{opt}</span>
                    </li>
                  ))}
                </ul>
              )}
              {q.explanation && (
                <div className="explanation-box">
                  <strong>Explanation:</strong> {q.explanation}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Flashcards for screen */}
      {activeTab === 'flashcards' && (
        <div className="no-print flashcard-section" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {quiz.flashcards.map((f, idx) => (
            <div key={f.id} className="glass-panel" style={{ padding: '1.5rem', minHeight: '200px', display: 'flex', flexDirection: 'column', justifyContent: 'center', textAlign: 'center' }}>
              <div style={{ fontWeight: 600, marginBottom: '1rem', color: 'var(--primary)' }}>{f.front}</div>
              <div style={{ color: 'var(--text-muted)' }}>{f.back}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

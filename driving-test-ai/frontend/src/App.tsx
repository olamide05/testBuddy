import { useMemo, useState } from 'react';
import { startSession, submitAnswer, deleteSession } from './api';
import type { Question, AnswerResponse } from './api';
import './App.css';

function getEphemeralUserId(): string {
  // ephemeral per tab; you can change to Date.now() if you want
  return 'user_' + crypto.randomUUID();
}

function App() {
  const userId = useMemo(getEphemeralUserId, []);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessionKey, setSessionKey] = useState<number>(0); // force remount on new session
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [feedback, setFeedback] = useState<AnswerResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [questionNumber, setQuestionNumber] = useState<number>(1);

  const hardResetUI = () => {
    setSessionId(null);
    setCurrentQuestion(null);
    setSelectedAnswer('');
    setFeedback(null);
    setLoading(false);
    setQuestionNumber(1);
    setSessionKey(k => k + 1); // <- this is what guarantees a clean slate visually
  };

  const handleStart = async () => {
    setLoading(true);
    try {
      const resp = await startSession(userId);
      setSessionId(resp.session_id);
      setCurrentQuestion(resp.question);
      setSelectedAnswer('');
      setFeedback(null);
      setQuestionNumber(1);
      setSessionKey(k => k + 1); // clean mount for a new run
    } catch (e) {
      console.error(e);
      alert('Failed to start session');
      hardResetUI();
    } finally {
      setLoading(false);
    }
  };

  const handleEndTest = async () => {
    if (sessionId) {
      await deleteSession(sessionId); // tell backend we're done (best-effort)
    }
    hardResetUI(); // clean slate, no question, no colours
  };

  const handleNewSession = async () => {
    setLoading(true);
    const oldSessionId = sessionId;
    
    try {
      // Start new session first to get fresh question
      const resp = await startSession(userId);
      
      // Update all state with completely new session data
      setSessionId(resp.session_id);
      setCurrentQuestion(resp.question);
      setSelectedAnswer('');
      setFeedback(null);
      setQuestionNumber(1);
      setSessionKey(k => k + 1); // Force fresh render
      
      // Clean up old session in background (best effort)
      if (oldSessionId) {
        deleteSession(oldSessionId).catch(() => {});
      }
    } catch (e) {
      console.error(e);
      alert('Failed to start new session');
      hardResetUI();
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!sessionId || !selectedAnswer) return;
    setLoading(true);
    try {
      const resp = await submitAnswer(sessionId, selectedAnswer);
      setFeedback(resp);
    } catch (e) {
      console.error(e);
      alert('Failed to submit answer');
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (feedback?.next_question) {
      setCurrentQuestion(feedback.next_question);
      setSelectedAnswer('');
      setFeedback(null);
      setQuestionNumber(n => n + 1);
    }
  };

  // Start screen
  if (!sessionId) {
    return (
      <div className="container">
        <div className="card">
          <h1>🚗 Irish Driving Test AI</h1>
          <p>Personalised practice for your theory test</p>
          <div style={{ display: 'flex', gap: 12 }}>
            <button onClick={handleStart} disabled={loading} className="btn-primary">
              {loading ? 'Starting…' : 'Start Practice'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Test screen
  if (!currentQuestion) {
    return <div className="container"><div className="card">Loading…</div></div>;
  }

  return (
    <div className="container" key={sessionKey /* remounts on new session */}>
      <div className="header">
        <h2>Irish Driving Test Practice (Question {questionNumber}/15)</h2>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={handleEndTest} className="btn-secondary">End Test</button>
          <button onClick={handleNewSession} className="btn-primary">New Session</button>
        </div>
      </div>

      <div className="card">
        {currentQuestion.image_url && (
          <img
            src={'http://localhost:8000' + currentQuestion.image_url}
            alt="Driving scenario"
            className="scenario-image"
          />
        )}

        <div className="badges">
          <span className="badge">{currentQuestion.category.replaceAll('_', ' ')}</span>
        </div>

        <h3 className="question-text">{currentQuestion.text}</h3>

        <div className="options">
          {currentQuestion.options.map((option) => {
            const letter = option.charAt(0);
            const isSelected = selectedAnswer === letter;
            const isCorrect = feedback?.correct_answer === letter;
            const isWrong = feedback && selectedAnswer === letter && !feedback.is_correct;

            let className = 'option';
            if (feedback) {
              if (isCorrect) className += ' correct';
              else if (isWrong) className += ' wrong';
            } else if (isSelected) {
              className += ' selected';
            }

            return (
              <button
                key={letter}
                onClick={() => !feedback && setSelectedAnswer(letter)}
                disabled={!!feedback || loading}
                className={className}
              >
                {option}
              </button>
            );
          })}
        </div>

        {feedback && (
          <div className={'feedback ' + (feedback.is_correct ? 'correct' : 'wrong')}>
            <strong>{feedback.is_correct ? '✓ Correct!' : '✗ Incorrect'}</strong>
            <p>{feedback.explanation}</p>
          </div>
        )}

        <div className="actions">
          {!feedback ? (
            <button
              onClick={handleSubmit}
              disabled={!selectedAnswer || loading}
              className="btn-primary"
            >
              {loading ? 'Submitting…' : 'Submit Answer'}
            </button>
          ) : feedback.complete ? (
            <button onClick={handleEndTest} className="btn-primary">
              End Test
            </button>
          ) : (
            <button onClick={handleNext} className="btn-primary">
              Next Question →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
import { useState } from 'react';
import { startSession, submitAnswer, getProgress } from './api';
import type { Question, AnswerResponse } from './api';
import './App.css';

function App() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [feedback, setFeedback] = useState<AnswerResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState<any>(null);
  const [showProgress, setShowProgress] = useState(false);

  const handleStart = async () => {
    setLoading(true);
    try {
      const userId = 'user_' + Date.now();
      const response = await startSession(userId);
      setSessionId(response.session_id);
      setCurrentQuestion(response.question);
    } catch (error) {
      console.error('Error starting session:', error);
      alert('Failed to start session');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!sessionId || !selectedAnswer) return;
    setLoading(true);
    try {
      const response = await submitAnswer(sessionId, selectedAnswer);
      setFeedback(response);
      if (response.complete) {
        const prog = await getProgress(sessionId);
        setProgress(prog);
        setShowProgress(true);
      }
    } catch (error) {
      console.error('Error submitting answer:', error);
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
    }
  };

  const handleViewProgress = async () => {
    if (!sessionId) return;
    try {
      const prog = await getProgress(sessionId);
      setProgress(prog);
      setShowProgress(true);
    } catch (error) {
      console.error('Error getting progress:', error);
    }
  };

  if (!sessionId) {
    return (
      <div className="container">
        <div className="card">
          <h1>🚗 Irish Driving Test AI</h1>
          <p>Personalized practice for your theory test</p>
          <button onClick={handleStart} disabled={loading} className="btn-primary">
            {loading ? 'Starting...' : 'Start Practice'}
          </button>
        </div>
      </div>
    );
  }

  if (showProgress) {
    return (
      <div className="container">
        <div className="card">
          <h2>📊 Your Progress</h2>
          <div className="stats">
            <div className="stat">
              <div className="stat-value">{progress.total_answered}</div>
              <div className="stat-label">Questions</div>
            </div>
            <div className="stat">
              <div className="stat-value">{progress.correct_answers}</div>
              <div className="stat-label">Correct</div>
            </div>
            <div className="stat">
              <div className="stat-value">{progress.overall_accuracy.toFixed(1)}%</div>
              <div className="stat-label">Accuracy</div>
            </div>
          </div>
          <h3>Category Scores</h3>
          {Object.entries(progress.category_scores).map(([category, score]: [string, any]) => (
            <div key={category} className="category-score">
              <div className="category-name">{category.replace('_', ' ')}</div>
              <div className="category-stats">
                {score.correct}/{score.total} ({((score.correct/score.total)*100).toFixed(0)}%)
              </div>
            </div>
          ))}
          {progress.weak_categories.length > 0 && (
            <div className="weak-areas">
              <h3>⚠️ Areas to Improve</h3>
              {progress.weak_categories.map((cat: string) => (
                <span key={cat} className="badge badge-warning">{cat.replace('_', ' ')}</span>
              ))}
            </div>
          )}
          <button onClick={() => {
            setShowProgress(false);
            setSessionId(null);
            setCurrentQuestion(null);
            setProgress(null);
          }} className="btn-primary">
            Start New Session
          </button>
        </div>
      </div>
    );
  }

  if (!currentQuestion) return <div className="container"><div className="card">Loading...</div></div>;

  return (
    <div className="container">
      <div className="header">
        <h2>Irish Driving Test Practice</h2>
        <button onClick={handleViewProgress} className="btn-secondary">
          View Progress
        </button>
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
          <span className="badge">{currentQuestion.category.replace('_', ' ')}</span>
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
              {loading ? 'Submitting...' : 'Submit Answer'}
            </button>
          ) : feedback.complete ? (
            <button onClick={handleViewProgress} className="btn-primary">
              View Final Results
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
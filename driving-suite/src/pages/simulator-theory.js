import React, { useState } from 'react';
import { 
  Box, Card, CardContent, Typography, Button, Radio, RadioGroup, 
  FormControlLabel, LinearProgress, Chip, Grid, Paper, Alert
} from '@mui/material';
import { startSession, submitAnswer, getProgress } from '../services/drivingTestAPI';

export default function TheorySimulatorPage() {
  const [sessionId, setSessionId] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(null);
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
      alert('Failed to start session. Make sure backend is running on port 8000');
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

  // START SCREEN
  if (!sessionId) {
    return (
      <Box sx={{ maxWidth: 800, mx: 'auto', mt: 4 }}>
        <Card elevation={3}>
          <CardContent sx={{ textAlign: 'center', p: 6 }}>
            <Typography variant="h3" gutterBottom>
              🚗 Irish Driving Test AI
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
              AI-powered personalized practice for your theory test
            </Typography>
            <Button 
              variant="contained" 
              size="large" 
              onClick={handleStart}
              disabled={loading}
              sx={{ px: 6, py: 2 }}
            >
              {loading ? 'Starting...' : 'Start Practice'}
            </Button>
            <Box sx={{ mt: 4 }}>
              <Typography variant="body2" color="text.secondary">
                ✓ AI-generated questions
              </Typography>
              <Typography variant="body2" color="text.secondary">
                ✓ Real scenario images
              </Typography>
              <Typography variant="body2" color="text.secondary">
                ✓ Personalized weak areas
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Box>
    );
  }

  // PROGRESS SCREEN
  if (showProgress) {
    return (
      <Box sx={{ maxWidth: 900, mx: 'auto', mt: 4 }}>
        <Card elevation={3}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h4" gutterBottom>
              📊 Your Progress
            </Typography>
            
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} md={4}>
                <Paper elevation={2} sx={{ p: 3, textAlign: 'center', bgcolor: '#e3f2fd' }}>
                  <Typography variant="h3" color="primary">{progress.total_answered}</Typography>
                  <Typography variant="body2">Questions</Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} md={4}>
                <Paper elevation={2} sx={{ p: 3, textAlign: 'center', bgcolor: '#e8f5e9' }}>
                  <Typography variant="h3" color="success.main">{progress.correct_answers}</Typography>
                  <Typography variant="body2">Correct</Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} md={4}>
                <Paper elevation={2} sx={{ p: 3, textAlign: 'center', bgcolor: '#f3e5f5' }}>
                  <Typography variant="h3" color="secondary">{progress.overall_accuracy.toFixed(1)}%</Typography>
                  <Typography variant="body2">Accuracy</Typography>
                </Paper>
              </Grid>
            </Grid>

            <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
              Category Scores
            </Typography>
            {Object.entries(progress.category_scores).map(([category, score]) => (
              <Paper key={category} elevation={1} sx={{ p: 2, mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography sx={{ textTransform: 'capitalize' }}>
                    {category.replace('_', ' ')}
                  </Typography>
                  <Typography color="primary" fontWeight="bold">
                    {score.correct}/{score.total} ({((score.correct/score.total)*100).toFixed(0)}%)
                  </Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={(score.correct/score.total)*100}
                  sx={{ height: 8, borderRadius: 1 }}
                />
              </Paper>
            ))}

            {progress.weak_categories.length > 0 && (
              <Alert severity="warning" sx={{ mt: 3 }}>
                <Typography variant="body2" fontWeight="bold" gutterBottom>
                  Areas to Improve:
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {progress.weak_categories.map((cat) => (
                    <Chip 
                      key={cat} 
                      label={cat.replace('_', ' ')} 
                      color="warning"
                      size="small"
                    />
                  ))}
                </Box>
              </Alert>
            )}

            <Button 
              variant="contained" 
              fullWidth 
              size="large"
              onClick={() => {
                setShowProgress(false);
                setSessionId(null);
                setCurrentQuestion(null);
                setProgress(null);
              }}
              sx={{ mt: 4 }}
            >
              Start New Session
            </Button>
          </CardContent>
        </Card>
      </Box>
    );
  }

  // QUESTION SCREEN
  if (!currentQuestion) return <Typography>Loading...</Typography>;

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto', mt: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h5">Irish Driving Test Practice</Typography>
        <Button variant="outlined" onClick={handleViewProgress}>
          View Progress
        </Button>
      </Box>

      <Card elevation={3}>
        <CardContent sx={{ p: 4 }}>
          {/* Image */}
          {currentQuestion.image_url && (
            <Box
              component="img"
              src={'http://localhost:8000' + currentQuestion.image_url}
              alt="Driving scenario"
              sx={{
                width: '100%',
                height: 300,
                objectFit: 'cover',
                borderRadius: 2,
                mb: 3,
                border: '3px solid',
                borderColor: 'primary.main'
              }}
            />
          )}

          {/* Category Badge */}
          <Chip 
            label={currentQuestion.category.replace('_', ' ')} 
            color="primary" 
            sx={{ mb: 2, textTransform: 'capitalize' }}
          />

          {/* Question */}
          <Typography variant="h6" sx={{ mb: 3, fontWeight: 500 }}>
            {currentQuestion.text}
          </Typography>

          {/* Options */}
          <RadioGroup 
            value={selectedAnswer} 
            onChange={(e) => !feedback && setSelectedAnswer(e.target.value)}
          >
            {currentQuestion.options.map((option) => {
              const letter = option.charAt(0);
              const isCorrect = feedback?.correct_answer === letter;
              const isWrong = feedback && selectedAnswer === letter && !feedback.is_correct;
              
              let bgcolor = 'transparent';
              if (feedback) {
                if (isCorrect) bgcolor = '#e8f5e9';
                else if (isWrong) bgcolor = '#ffebee';
              }

              return (
                <Paper
                  key={letter}
                  elevation={selectedAnswer === letter ? 3 : 1}
                  sx={{
                    p: 2,
                    mb: 1.5,
                    bgcolor,
                    border: selectedAnswer === letter ? 2 : 1,
                    borderColor: selectedAnswer === letter ? 'primary.main' : 'divider',
                    cursor: feedback ? 'not-allowed' : 'pointer',
                    '&:hover': feedback ? {} : { bgcolor: 'action.hover' }
                  }}
                >
                  <FormControlLabel
                    value={letter}
                    control={<Radio disabled={!!feedback || loading} />}
                    label={option}
                    sx={{ width: '100%', m: 0 }}
                  />
                </Paper>
              );
            })}
          </RadioGroup>

          {/* Feedback */}
          {feedback && (
            <Alert 
              severity={feedback.is_correct ? 'success' : 'error'} 
              sx={{ mt: 3 }}
            >
              <Typography variant="body1" fontWeight="bold">
                {feedback.is_correct ? '✓ Correct!' : '✗ Incorrect'}
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                {feedback.explanation}
              </Typography>
            </Alert>
          )}

          {/* Action Button */}
          <Box sx={{ mt: 3 }}>
            {!feedback ? (
              <Button
                variant="contained"
                fullWidth
                size="large"
                onClick={handleSubmit}
                disabled={!selectedAnswer || loading}
              >
                {loading ? 'Submitting...' : 'Submit Answer'}
              </Button>
            ) : feedback.complete ? (
              <Button
                variant="contained"
                fullWidth
                size="large"
                onClick={handleViewProgress}
              >
                View Final Results
              </Button>
            ) : (
              <Button
                variant="contained"
                fullWidth
                size="large"
                onClick={handleNext}
              >
                Next Question →
              </Button>
            )}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import QuizTimer from './QuizTimer';
import ResultsPage from './ResultsPage';
import '../style/Quiz.css'; // Import the CSS file for QuizPage

const QuizPage = () => {
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [userAnswers, setUserAnswers] = useState([]);
  const [quizComplete, setQuizComplete] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const savedQuiz = localStorage.getItem('quizState');
    if (savedQuiz) {
      const parsedState = JSON.parse(savedQuiz);
      setQuestions(parsedState.questions || []);
      setCurrentQuestion(parsedState.currentQuestion || 0);
      setUserAnswers(parsedState.userAnswers || []);
    } else {
      fetchQuestions();
    }
  }, []);

  const fetchQuestions = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get('https://opentdb.com/api.php?amount=10&category=27&difficulty=easy&type=multiple');
      if (res.data.results && res.data.results.length > 0) {
        setQuestions(res.data.results);
      } else {
        throw new Error('No questions available from the API');
      }
    } catch (err) {
      setError('Failed to load questions. Please try again later.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const saveQuizState = () => {
    const quizState = { questions, currentQuestion, userAnswers };
    localStorage.setItem('quizState', JSON.stringify(quizState));
  };

  const handleAnswerSelection = (answer) => {
    setUserAnswers((prevAnswers) => [...prevAnswers, answer]);
    saveQuizState();

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
    } else {
      setQuizComplete(true);
    }
  };

  const resetQuiz = () => {
    localStorage.removeItem('quizState');
    setQuestions([]);
    setCurrentQuestion(0);
    setUserAnswers([]);
    setQuizComplete(false);
    setError('');
    fetchQuestions();
  };

  useEffect(() => {
    return () => {
      saveQuizState();
    };
  }, [questions, currentQuestion, userAnswers]);

  if (quizComplete) {
    return (
      <div className="quiz-container">
        <ResultsPage questions={questions} userAnswers={userAnswers} />
        <button className="restart-btn" onClick={resetQuiz}>Restart Quiz</button>
      </div>
    );
  }

  return (
    <div className="quiz-container">
      {loading ? (
        <p className="loading">Loading...</p>
      ) : error ? (
        <p className="error">{error}</p>
      ) : questions.length ? (
        <div className="quiz-content">
          <h4 className="progress">
            Questions Answered: {userAnswers.length} / {questions.length}
          </h4>
          {questions[currentQuestion] ? (
            <>
              <h3 className="question" dangerouslySetInnerHTML={{ __html: questions[currentQuestion]?.question }} />
              <QuizTimer timeLimit={30} onTimeOut={() => setQuizComplete(true)} />
              <div className="options-container">
                {questions[currentQuestion]?.incorrect_answers.concat(questions[currentQuestion]?.correct_answer)
                  .sort()
                  .map((option, index) => (
                    <button key={index} className="option-btn" onClick={() => handleAnswerSelection(option)} dangerouslySetInnerHTML={{ __html: option }} />
                ))}
              </div>
            </>
          ) : (
            <p className="error">Question not available</p>
          )}
        </div>
      ) : (
        <p className="error">No questions available</p>
      )}
    </div>
  );
};

export default QuizPage;
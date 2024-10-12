import React from 'react';
import { useNavigate } from 'react-router-dom';

const ResultsPage = ({ questions, userAnswers }) => {
  const navigate = useNavigate();

  const calculateResults = () => {
    const correct = userAnswers.filter((answer, index) => answer === questions[index].correct_answer).length;
    const incorrect = questions.length - correct;
    return { correct, incorrect };
  };

  const { correct, incorrect } = calculateResults();
  const total = questions.length;
  const percentage = total > 0 ? ((correct / total) * 100).toFixed(2) : 0;

  const handleBackHome = () => {
    localStorage.clear(); // Menghapus semua data di localStorage
    navigate('/'); // Navigasi kembali ke halaman utama
  };

  return (
    <div>
      <h2>Quiz Results</h2>
      <p>Total Questions: {total}</p>
      <p>Correct Answers: {correct}</p>
      <p>Incorrect Answers: {incorrect}</p>
      <p>Score: {correct} / {total}</p>
      <p>Percentage: {percentage}%</p>
      <button onClick={handleBackHome}>Back Home</button>
    </div>
  );
};

export default ResultsPage;

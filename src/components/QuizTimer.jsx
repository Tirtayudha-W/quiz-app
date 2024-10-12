import { useState, useEffect } from 'react';

const QuizTimer = ({ timeLimit, onTimeOut }) => {
  const [timeLeft, setTimeLeft] = useState(timeLimit);

  useEffect(() => {
    if (timeLeft === 0) {
      onTimeOut();
      return;
    }

    const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);

    return () => clearTimeout(timer);
  }, [timeLeft, onTimeOut]);

  return <div>Time Left: {timeLeft} seconds</div>;
};

export default QuizTimer;

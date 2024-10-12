import { useState, useEffect } from "react";
import axios from "axios";
import QuizTimer from "./QuizTimer";
import ResultsPage from "./ResultsPage";
import "../style/Quiz.css";

const QuizPage = () => {
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [userAnswers, setUserAnswers] = useState([]);
  const [quizComplete, setQuizComplete] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [timeRemaining, setTimeRemaining] = useState(30);

  useEffect(() => {
    const savedQuiz = localStorage.getItem("quizState");
  
    // Check if quiz state is saved in localStorage
    if (savedQuiz) {
      const parsedState = JSON.parse(savedQuiz);
      if (parsedState.questions && parsedState.questions.length > 0) {
        setQuestions(parsedState.questions);
        setCurrentQuestion(parsedState.currentQuestion || 0);
        setUserAnswers(parsedState.userAnswers || []);
        setQuizComplete(parsedState.quizComplete || false);
        setTimeRemaining(parsedState.timeRemaining || 30);
        setLoading(false); // Set loading to false once state is restored
      } else {
        // Attempt to fetch questions if state is empty
        fetchQuestions();
      }
    } else {
      // No saved state, fetch questions
      fetchQuestions();
    }
  }, []);
  

  const fetchQuestions = async () => {
    setLoading(true);
    setError(""); // Hapus pesan kesalahan sebelumnya
  
    while (true) { // Loop tanpa henti
      try {
        const res = await axios.get(
          "https://opentdb.com/api.php?amount=10&category=21&difficulty=easy&type=multiple"
        );
        console.log('API Response:', res); // Log respons API
  
        if (res.data.results && res.data.results.length > 0) {
          setQuestions(res.data.results);
          saveQuizState(res.data.results, 0, [], false, 30);
          break; // Keluar dari loop jika berhasil
        } else {
          // Jika tidak ada pertanyaan, terus ulang
          console.warn("No questions available from the API. Retrying...");
        }
      } catch (err) {
        console.error("Error fetching questions:", err); // Log error untuk debugging
      }
  
      // Jeda 1 detik sebelum mencoba lagi
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  
    setLoading(false); // Pastikan loading diset false setelah pengambilan
  };
  

  const saveQuizState = (
    currentQuestions = questions,
    currentQuestionIndex = currentQuestion,
    currentUserAnswers = userAnswers,
    isQuizComplete = quizComplete,
    currentTimeRemaining = timeRemaining
  ) => {
    const quizState = {
      questions: currentQuestions,
      currentQuestion: currentQuestionIndex,
      userAnswers: currentUserAnswers,
      quizComplete: isQuizComplete,
      timeRemaining: currentTimeRemaining,
    };
    localStorage.setItem("quizState", JSON.stringify(quizState));
  };

  const handleAnswerSelection = (answer) => {
    const newUserAnswers = [...userAnswers, answer];
    setUserAnswers(newUserAnswers);

    if (currentQuestion < questions.length - 1) {
      const nextQuestion = currentQuestion + 1;
      setCurrentQuestion(nextQuestion);
      setTimeRemaining(30);
      saveQuizState(questions, nextQuestion, newUserAnswers, false, 30);
    } else {
      setQuizComplete(true);
      saveQuizState(questions, currentQuestion, newUserAnswers, true, 0);
    }
  };

  const resetQuiz = () => {
    localStorage.removeItem("quizState");
    setQuestions([]);
    setCurrentQuestion(0);
    setUserAnswers([]);
    setQuizComplete(false);
    setTimeRemaining(30);
    setError("");
    fetchQuestions();
  };

  useEffect(() => {
    const handleBeforeUnload = () => {
      saveQuizState();
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [questions, currentQuestion, userAnswers, quizComplete, timeRemaining]);

  if (quizComplete) {
    return (
      <div className="quiz-container">
        <ResultsPage questions={questions} userAnswers={userAnswers} />
        <button className="restart-btn" onClick={resetQuiz}>
          Restart Quiz
        </button>
      </div>
    );
  }

  return (
    <div className="quiz-container">
      {loading ? (
        <p className="loading">Loading...</p>
      ) : error ? (
        <p className="error">{error}</p>
      ) : questions.length > 0 ? (
        <div className="quiz-content">
          <h4 className="progress">
            Questions Answered: {userAnswers.length} / {questions.length}
          </h4>
          {questions[currentQuestion] ? (
            <>
              <h3
                className="question"
                dangerouslySetInnerHTML={{
                  __html: questions[currentQuestion].question,
                }}
              />
              <QuizTimer
                timeLimit={timeRemaining}
                onTimeOut={() => {
                  setQuizComplete(true);
                  saveQuizState(
                    questions,
                    currentQuestion,
                    userAnswers,
                    true,
                    0
                  );
                }}
                onTick={(time) => {
                  setTimeRemaining(time);
                  saveQuizState(
                    questions,
                    currentQuestion,
                    userAnswers,
                    quizComplete,
                    time
                  );
                }}
              />
              <div className="options-container">
                {[
                  ...questions[currentQuestion].incorrect_answers,
                  questions[currentQuestion].correct_answer,
                ]
                  .sort(() => Math.random() - 0.5)
                  .map((option, index) => (
                    <button
                      key={index}
                      className="option-btn"
                      onClick={() => handleAnswerSelection(option)}
                      dangerouslySetInnerHTML={{ __html: option }}
                    />
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

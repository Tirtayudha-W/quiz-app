import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../style/Login.css';
import quizTimeGif from '../assets/quiztime.gif';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const navigate = useNavigate();

  const handleLogin = () => {
    if (username.trim() === '') {
      alert('Please enter a username!');
      return;
    }

    localStorage.removeItem('quizState');
    localStorage.setItem('username', username);
    navigate('/quiz');
  };

  return (
    <div className="login-page">
      <img src={quizTimeGif} alt="Quiz Time" style={{ width: '300px', height: '200px', position: 'relative', top: '-20px' }} />
      <h1 className="quiz-tittle">Quiz Application</h1>
      <h2 className="login-tittle">Login</h2>
      <input
        className="input-login"
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        aria-label="Username"
        style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
      />
      <button className="login-btn" onClick={handleLogin}>Login</button>
    </div>
  );
};

export default LoginPage;
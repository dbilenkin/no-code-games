import React, { useState, useEffect } from 'react';

function App() {
  const [prompt, setPrompt] = useState('');
  const [gameUrl, setGameUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [iframeError, setIframeError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');
    setIframeError('');
    setGameUrl('');

    const lambdaUrl = 'https://fcvqh3ziz3.execute-api.us-east-2.amazonaws.com/prod/generate-game';

    try {
      const response = await fetch(lambdaUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate game');
      }

      const data = await response.json();
      const blob = new Blob([data.code], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      setGameUrl(url);
    } catch (error) {
      console.error('Error:', error);
      setErrorMessage('An error occurred while generating the game.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data && event.data.error) {
        setIframeError(event.data.error);
      }
    };

    window.addEventListener('message', handleMessage);

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>No Code Web Games</h1>
      <form onSubmit={handleSubmit} style={styles.form}>
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Enter your game idea"
          required
          style={styles.input}
        />
        <button type="submit" disabled={loading} style={styles.button}>
          {loading ? 'Generating...' : 'Generate Game'}
        </button>
      </form>
      {errorMessage && <p style={styles.error}>{errorMessage}</p>}
      {iframeError && <p style={styles.error}>Game Error: {iframeError}</p>}
      {gameUrl && (
        <iframe
          src={gameUrl}
          style={styles.iframe}
          title="Generated Game"
          sandbox="allow-scripts"
        />
      )}
    </div>
  );
}

const styles = {
  container: {
    padding: '20px',
    boxSizing: 'border-box',
  },
  title: {
    textAlign: 'center',
    marginBottom: '40px',
  },
  form: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '20px',
  },
  input: {
    width: '60%',
    padding: '10px',
    marginRight: '10px',
    fontSize: '16px',
    borderRadius: '4px',
    border: '1px solid #555',
    backgroundColor: '#2e2e2e',
    color: '#fff',
  },
  button: {
    padding: '10px 20px',
    fontSize: '16px',
    borderRadius: '4px',
    border: 'none',
    backgroundColor: '#007acc',
    color: '#fff',
    cursor: 'pointer',
  },
  iframe: {
    display: 'block',
    margin: '0 auto',
    width: '80%',
    height: '70vh',
    border: 'none',
    backgroundColor: 'white',
  },
  error: {
    color: '#ff5555',
    textAlign: 'center',
  },
};

export default App;

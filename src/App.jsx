import { useState } from 'react';
import ChatPrompt from './components/ChatPrompt';
import Login from './components/Login';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [showWelcomeMsg, setShowWelcomeMsg] = useState(false);
  const [welcomeSent, setWelcomeSent] = useState(false);

  // Cuando el usuario inicia sesión, activa el mensaje de bienvenida
  const handleLogin = (username) => {
    setUser(username);
    setShowWelcomeMsg(true);
    setWelcomeSent(false);
  };

  // Si hay usuario y no se ha enviado el mensaje, lo enviamos al chat
  const handleWelcomeDisplayed = () => {
    setShowWelcomeMsg(false);
    setWelcomeSent(true);
  };

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-100 to-indigo-100 flex flex-col items-center p-4">
      <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-700 to-indigo-700 mb-4 mt-2">
        Asistente Virtual CBUM
      </h1>

      <div className="w-full max-w-2xl mx-auto flex-1 flex flex-col">
        <div className="flex-1 flex flex-col pb-4">
          <ChatPrompt user={user} showWelcomeMsg={showWelcomeMsg} onWelcomeDisplayed={handleWelcomeDisplayed} welcomeSent={welcomeSent} />
        </div>

        <p className="text-center text-purple-600 font-medium text-sm my-2">
          Titanes GYM - Asesoramiento personalizado de entrenamiento y nutrición con CBUM 💪
        </p>
      </div>
    </div>
  );
}

export default App;

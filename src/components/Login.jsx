import { useState } from 'react';

const Login = ({ onLogin }) => {
  const [name, setName] = useState('');
  const [showWelcome, setShowWelcome] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name.trim()) {
      setShowWelcome(true);
      setTimeout(() => {
        onLogin(name.trim());
      }, 1800); // Muestra el mensaje 1.8 segundos antes de entrar
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-purple-100 to-indigo-100">
      {showWelcome ? (
        <div className="bg-white p-8 rounded-xl shadow-xl border border-purple-200 w-full max-w-sm text-center animate-fade-in">
          <h2 className="text-2xl font-bold text-purple-700 mb-2">¡Bienvenido, {name}!</h2>
          <p className="text-purple-600 text-lg font-semibold">Estás listo para llevar tu físico al siguiente nivel con CBUM en Titanes GYM 💪</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-xl border border-purple-200 w-full max-w-sm">
          <h2 className="text-xl font-bold text-center mb-4 text-purple-700">Bienvenido a Titanes GYM</h2>
          <label className="block mb-2 text-purple-600 font-medium">Ingresa tu nombre para comenzar:</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-3 border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white text-gray-800 mb-4"
            placeholder="Tu nombre"
            autoFocus
          />
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white py-2 px-4 rounded-lg transition-all font-bold"
          >
            Ingresar
          </button>
        </form>
      )}
    </div>
  );
};

export default Login;

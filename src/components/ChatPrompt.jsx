import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { FaPaperPlane, FaRobot, FaUser } from 'react-icons/fa';

const ChatPrompt = ({ user }) => {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversations, setConversations] = useState([
    {
      role: 'assistant',
      content: `¡Bienvenido, ${user}! Estás listo para llevar tu físico al siguiente nivel. 💪\n\nAntes de armar tu plan, necesito conocerte mejor. Por favor, completa el siguiente formulario con tus datos clave: objetivo, edad, peso, altura, nivel de actividad, preferencias alimenticias y frecuencia de entrenamiento.`
    },
    {
      role: 'user',
      name: user,
      content: `Hola, soy ${user}.`
    }
  ]);
  const [mostrarFormulario, setMostrarFormulario] = useState(true);
  const [formulario, setFormulario] = useState({});
  const conversationsEndRef = useRef(null);
  const textareaRef = useRef(null);

  const preguntasFormulario = [
    { name: 'objetivo', label: 'Objetivo principal', type: 'text', desc: '¿Qué meta quieres lograr? (Ej: ganar músculo, perder grasa, mejorar resistencia, etc.)' },
    { name: 'edad', label: 'Edad', type: 'number', desc: '¿Cuántos años tienes?' },
    { name: 'peso', label: 'Peso actual (kg)', type: 'number', desc: 'Indica tu peso actual en kilogramos.' },
    { name: 'estatura', label: 'Estatura actual (cm)', type: 'number', desc: 'Indica tu estatura en centímetros.' },
    { name: 'actividad', label: 'Nivel de actividad física', type: 'text', desc: '¿Eres sedentario, moderado o activo?' },
    { name: 'preferencias', label: 'Preferencias alimenticias', type: 'text', desc: '¿Tienes alguna preferencia o restricción alimenticia?' },
    { name: 'frecuencia', label: 'Frecuencia de entrenamiento', type: 'text', desc: '¿Cuántos días a la semana puedes entrenar?' },
  ];

  useEffect(() => {
    if (conversationsEndRef.current) {
      conversationsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [conversations]);

  const handleFormularioChange = (e) => {
    const { name, value, type } = e.target;
    setFormulario((prev) => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value
    }));
  };

  const handleFormularioSubmit = async (e) => {
    e.preventDefault();
    setMostrarFormulario(false);
    setConversations((prev) => [
      ...prev,
      {
        role: 'user',
        name: user,
        content: `Mi perfil:\n${preguntasFormulario.map(q => `- ${q.label}: ${formulario[q.name] || ''}`).join('\n')}`
      },
      {
        role: 'assistant',
        content: '¡Perfecto! Ahora te daré tu plan adecuado para ti. 🏋️‍♂️🍽️'
      }
    ]);

    try {
      const perfilTexto = preguntasFormulario.map(q => `- ${q.label}: ${formulario[q.name] || ''}`).join('\n');
      const prompt = `Genera un plan de entrenamiento y nutrición personalizado para este usuario.\n\nDatos del usuario:\n${perfilTexto}\n\nResponde de forma directa, motivadora y profesional. Incluye un plan detallado y consejos de salud importantes.`;
      const res = await axios.post('https://chatgptback.vercel.app/api/chat', {
        prompt,
        perfil: { name: user, ...formulario }
      });

      setConversations((prev) => [
        ...prev,
        { role: 'assistant', content: res.data.response }
      ]);
    } catch (err) {
      setConversations((prev) => [
        ...prev,
        { role: 'system', content: 'Hubo un error al generar tu plan. Intenta de nuevo.' }
      ]);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const sendPrompt = async (text) => {
    try {
      setIsLoading(true);
      const newConversations = [
        ...conversations,
        { role: 'user', name: user, content: text }
      ];
      setConversations(newConversations);
      setPrompt('');

      const res = await axios.post('https://chatgptback.vercel.app/api/chat', {
        prompt: text
      });

      setConversations([
        ...newConversations,
        { role: 'assistant', content: res.data.response }
      ]);
    } catch (error) {
      console.error('Error al obtener respuesta:', error);
      setConversations([
        ...conversations,
        { role: 'user', name: user, content: text },
        { role: 'system', content: 'Hubo un error. Intenta de nuevo.' }
      ]);
    } finally {
      setIsLoading(false);
      if (textareaRef.current) textareaRef.current.focus();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    sendPrompt(prompt);
  };

  return (
    <div className="bg-gradient-to-b from-purple-50 to-white shadow-lg rounded-lg border border-purple-300 mx-auto max-w-3xl">
      <div className="bg-gradient-to-r from-purple-700 to-indigo-700 text-white p-6 text-center shadow-md">
        <h2 className="text-2xl font-bold flex items-center justify-center">
          <FaRobot className="mr-3 text-purple-300" /> Asistente Virtual
        </h2>
      </div>

      <div className="h-[500px] overflow-y-auto p-6 bg-white">
        <div className="space-y-6">
          {conversations.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] p-4 rounded-xl shadow-md ${
                  message.role === 'user'
                    ? 'bg-gradient-to-br from-purple-600 to-purple-800 text-white rounded-tr-none'
                    : 'bg-gray-100 text-gray-800 border border-purple-200 rounded-tl-none'
                }`}
              >
                <div className="flex items-center mb-2 font-medium">
                  {message.role === 'user' ? (
                    <>
                      <FaUser className="mr-2 text-white" /> <span className="text-white font-bold">{message.name || 'Tú'}</span>
                    </>
                  ) : (
                    <>
                      <FaRobot className="mr-2 text-purple-600" /> <span className="text-purple-800">CBUM</span>
                    </>
                  )}
                </div>
                <div className="whitespace-pre-wrap leading-relaxed text-sm md:text-base">
                  {message.content}
                </div>
              </div>
            </div>
          ))}
          <div ref={conversationsEndRef} />
        </div>
      </div>

      {mostrarFormulario ? (
        <form onSubmit={handleFormularioSubmit} className="p-6 bg-gradient-to-r from-purple-100 to-indigo-100 border-t border-purple-300">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {preguntasFormulario.map((pregunta, index) => (
              <div key={index} className="flex flex-col">
                <label htmlFor={pregunta.name} className="text-sm font-medium text-gray-700 mb-1">
                  {pregunta.label}
                </label>
                <input
                  id={pregunta.name}
                  name={pregunta.name}
                  type={pregunta.type}
                  placeholder={pregunta.desc}
                  value={formulario[pregunta.name] || ''}
                  onChange={handleFormularioChange}
                  className="p-2 border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white text-gray-800 shadow-inner"
                />
              </div>
            ))}
          </div>
          <button
            type="submit"
            className="w-full mt-4 bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-800 hover:to-indigo-800 text-white py-3 px-5 rounded-lg transition-all flex items-center justify-center"
          >
            Enviar
          </button>
        </form>
      ) : (
        <form onSubmit={handleSubmit} className="p-6 bg-gradient-to-r from-purple-100 to-indigo-100 border-t border-purple-300">
          <div className="mb-4">
            <textarea
              ref={textareaRef}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Escribe tu mensaje aquí..."
              className="w-full p-4 border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white text-gray-800 resize-none shadow-inner transition-all"
              rows="3"
              disabled={isLoading}
            />
          </div>
          <div className="flex items-center">
            <button
              type="submit"
              disabled={isLoading || !prompt.trim()}
              className="w-full bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-800 hover:to-indigo-800 text-white py-3 px-5 rounded-lg disabled:bg-gray-400 disabled:cursor-not-allowed transition-all flex items-center justify-center"
            >
              <FaPaperPlane className="mr-3" /> Enviar
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default ChatPrompt;
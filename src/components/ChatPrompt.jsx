import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { FaPaperPlane, FaRobot, FaUser } from 'react-icons/fa';

const ChatPrompt = ({ user, showWelcomeMsg, onWelcomeDisplayed, welcomeSent }) => {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversations, setConversations] = useState([
    {
      role: 'assistant',
      content: `¡Bienvenido, ${user}! Estás listo para llevar tu físico al siguiente nivel con CBUM en Titanes GYM. 💪`
    }
  ]);
  const [llenandoPerfil, setLlenandoPerfil] = useState(false);
  const [preguntaActual, setPreguntaActual] = useState(0);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [formulario, setFormulario] = useState({});
  const conversationsEndRef = useRef(null);
  const textareaRef = useRef(null);

  // Preguntas clave para el formulario
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

  // Mostrar formulario después del mensaje de preguntas
  useEffect(() => {
    if (
      conversations.length > 1 &&
      conversations[conversations.length - 1].content.includes('Completa el formulario')
    ) {
      setMostrarFormulario(true);
    }
  }, [conversations]);

  // Si el usuario ya llenó el perfil, mostrar el plan automáticamente
  useEffect(() => {
    if (
      formulario && Object.keys(formulario).length === preguntasFormulario.length && mostrarFormulario
    ) {
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
      // Solicitar automáticamente un plan personalizado a CBUM
      (async () => {
        try {
          // Construir el prompt con todos los datos explícitos
          const perfilTexto = preguntasFormulario.map(q => `- ${q.label}: ${formulario[q.name] || ''}`).join('\n');
          const prompt = `Genera un plan de entrenamiento y nutrición personalizado para este usuario.\n\nDatos del usuario:\n${perfilTexto}\n\nResponde de forma directa, motivadora y profesional, sin volver a pedir datos. Da el plan y recomendaciones de salud en formato claro y breve.`;
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
      })();
    }
  }, [formulario, mostrarFormulario, preguntasFormulario, user]);

  // Mensaje de bienvenida, luego instrucciones, luego formulario, luego plan
  useEffect(() => {
    setConversations([
      {
        role: 'assistant',
        content: `¡Bienvenido, ${user}! Estás listo para llevar tu físico al siguiente nivel con CBUM en Titanes GYM. 💪\n\nPrepárate porque juntos vamos a sacar la mejor versión de vos. 🦾🔥`
      },
      {
        role: 'assistant',
        content: 'Antes de armar tu plan, necesito conocerte mejor. Por favor, completa el siguiente formulario con tus datos clave: objetivo, edad, peso, altura, nivel de actividad, preferencias alimenticias y frecuencia de entrenamiento.'
      }
    ]);
    setMostrarFormulario(false);
    setTimeout(() => {
      setMostrarFormulario(true);
    }, 1200); // Muestra el formulario tras las instrucciones
  }, [user]);

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

      const esSaludo = ['hola', 'hey', 'buenas', 'holi', 'hello'].some((saludo) =>
        text.toLowerCase().includes(saludo)
      );

      if (esSaludo) {
        setConversations([
          ...newConversations,
          {
            role: 'assistant',
            content: `¡Hola hola, ${user}! 🫡 Qué gusto tenerte de vuelta en este templo del hierro. 🙌\n\nEstás justo donde tenés que estar. Respirá hondo, sacá pecho, y preparate porque juntos vamos a sacar la mejor versión de vos 🦾💥\n\nAntes de armar tu plan, necesito conocerte mejor. ¡Respondé las preguntas que aparecen abajo y arrancamos con todo!`
          }
        ]);
        setIsLoading(false);
        return;
      }

      const res = await axios.post('https://chatgptback.vercel.app/api/chat', {
        prompt: text,
        perfil: formulario && Object.keys(formulario).length > 0 ? {
          name: user,
          ...formulario
        } : undefined
      });

      setConversations([
        ...newConversations,
        { role: 'assistant', content: res.data.response }
      ]);
    } catch (error) {
      console.error('Error al obtener respuesta:', error);
      setConversations([
        ...conversations,
        { role: 'user', content: text },
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
    if (llenandoPerfil) {
      handlePerfilSubmit(e);
    } else {
      sendPrompt(prompt);
    }
  };

  // Manejar envío de cada respuesta del perfil
  const handlePerfilSubmit = (e) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    const pregunta = preguntasFormulario[preguntaActual];
    setPerfil((prev) => ({ ...prev, [pregunta.name]: prompt }));
    setConversations((prev) => [
      ...prev,
      { role: 'user', name: user, content: prompt }
    ]);
    setPrompt('');
    if (preguntaActual < preguntasFormulario.length - 1) {
      setPreguntaActual(preguntaActual + 1);
    } else {
      setLlenandoPerfil(false);
      // Mostrar tabla resumen en el chat
      setConversations((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `¡Perfil recibido, campeón! Así quedó tu ficha:
\n${preguntasFormulario.map(q => `- ${q.label}: ${perfil[q.name] || ''}`).join('\n')}`
        }
      ]);
    }
  };

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
    // Mostrar el perfil como tabla en el chat
    setConversations((prev) => [
      ...prev,
      {
        role: 'user',
        name: user,
        content: `Mi perfil:\n${preguntasFormulario.map(q => `- ${q.label}: ${formulario[q.name] || ''}`).join('\n')}`
      }
    ]);
    // Solicitar automáticamente un plan personalizado a CBUM
    try {
      const res = await axios.post('https://chatgptback.vercel.app/api/chat', {
        prompt: 'Genera un plan de entrenamiento y nutrición personalizado para este perfil de usuario.',
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

  const formatText = (text) => {
    return text.split('\n').map((paragraph, i) => (
      <p key={i} className="mb-2 last:mb-0">{paragraph}</p>
    ));
  };

  return (
    <div className="bg-white shadow-2xl rounded-xl overflow-hidden border border-purple-200 mx-auto max-w-2xl">
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-4 text-center shadow-md">
        <h2 className="text-xl font-bold flex items-center justify-center">
          <FaRobot className="mr-2 text-purple-200" /> Asistente Virtual CBUM
        </h2>
        <p className="text-sm mt-1 text-purple-100">¡Bienvenido, {user}!</p>
      </div>

      <div className="h-[400px] overflow-y-auto p-4 bg-gradient-to-b from-purple-50 to-white">
        <div className="space-y-5">
          {conversations.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] p-3 rounded-2xl shadow-md ${
                  message.role === 'user'
                    ? 'bg-gradient-to-br from-purple-600 to-purple-700 text-white rounded-tr-none'
                    : message.role === 'system'
                      ? 'bg-red-100 text-red-700 border border-red-200'
                      : 'bg-white text-gray-800 border border-purple-100 rounded-tl-none shadow-md'
                }`}
              >
                <div className="flex items-center mb-1 font-medium">
                  {message.role === 'user' ? (
                    <>
                      <FaUser className="mr-1 text-white" /> <span className="text-white font-bold">{message.name || 'Tú'}</span>
                    </>
                  ) : message.role === 'system' ? (
                    'Sistema'
                  ) : (
                    <>
                      <FaRobot className="mr-1 text-purple-600" /> <span className="text-purple-800">CBUM</span>
                    </>
                  )}
                </div>
                <div className={`whitespace-pre-wrap leading-relaxed text-sm md:text-base ${message.role === 'user' ? 'font-medium text-white' : ''}`}>
                  {formatText(message.content)}
                </div>
              </div>
            </div>
          ))}
          <div ref={conversationsEndRef} />

          {/* Formulario de perfil completo (todas las preguntas a la vez) */}
          {mostrarFormulario && (
            <form className="bg-white p-6 rounded-xl shadow-lg border border-purple-200 mt-4 space-y-4">
              <h3 className="text-lg font-bold text-purple-700 mb-2">Completa tu perfil para un plan personalizado:</h3>
              {preguntasFormulario.map((preg, idx) => (
                <div key={preg.name} className="mb-4">
                  <label className="block text-purple-700 font-semibold mb-1">{preg.label}</label>
                  <p className="text-xs text-purple-500 mb-1">{preg.desc}</p>
                  {preg.type === 'radio' ? (
                    <div className="flex gap-4">
                      {preg.options.map(opt => (
                        <label key={opt} className="flex items-center gap-1">
                          <input
                            type="radio"
                            name={preg.name}
                            value={opt}
                            checked={formulario[preg.name] === opt}
                            onChange={e => {
                              handleFormularioChange(e);
                              // Si es el último campo, enviar automáticamente
                              if (idx === preguntasFormulario.length - 1) handleFormularioSubmit(e);
                            }}
                            className="accent-purple-600"
                          />
                          <span>{opt}</span>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <input
                      type={preg.type}
                      name={preg.name}
                      value={formulario[preg.name] || ''}
                      onChange={e => {
                        handleFormularioChange(e);
                        // Si es el último campo, enviar automáticamente
                        if (idx === preguntasFormulario.length - 1) handleFormularioSubmit(e);
                      }}
                      className="w-full p-2 border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white text-gray-800"
                    />
                  )}
                </div>
              ))}
              {/* Botón eliminado, el envío es automático al completar el último campo */}
            </form>
          )}
        </div>

        {isLoading && (
          <div className="flex justify-start mt-4">
            <div className="max-w-[85%] p-3 bg-white border border-purple-100 rounded-2xl rounded-tl-none shadow-md">
              <div className="flex items-center mb-1 font-medium">
                <FaRobot className="mr-1 text-purple-600" /> <span className="text-purple-800">CBUM</span>
              </div>
              <div className="flex space-x-3">
                <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          </div>
        )}
      </div>

      <form onSubmit={llenandoPerfil ? handlePerfilSubmit : handleSubmit} className="p-4 bg-gradient-to-r from-purple-100 to-indigo-100 border-t border-purple-200">
        <div className="mb-2">
          <textarea
            ref={textareaRef}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={llenandoPerfil ? preguntasFormulario[preguntaActual].label + '...' : 'Escribe tu mensaje aquí...'}
            className="w-full p-3 border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white text-gray-800 resize-none shadow-inner transition-all"
            rows="2"
            disabled={isLoading}
          />
        </div>
        <div className="flex items-center">
          <button
            type="submit"
            disabled={isLoading || !prompt.trim()}
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white py-2 px-4 rounded-lg disabled:bg-gray-400 disabled:cursor-not-allowed transition-all flex items-center justify-center"
          >
            <FaPaperPlane className="mr-2" /> Enviar
          </button>
        </div>
        <p className="text-xs text-purple-500 mt-1 text-center">
          {isLoading ? '⏳ Procesando...' : llenandoPerfil ? 'Responde y presiona Enter' : '💬 Presiona Enter para enviar'}
        </p>
      </form>
    </div>
  );
};

export default ChatPrompt;

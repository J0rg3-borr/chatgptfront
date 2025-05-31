import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { FaPaperPlane, FaRobot, FaUser, FaDumbbell } from 'react-icons/fa';

const ChatPrompt = ({ user }) => {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversations, setConversations] = useState([
    {
      role: 'assistant',
      content: `¡Hey champ! Soy Chris Bumstead, tu asesor personal en Titanes GYM. 💪\n\nComo tu entrenador personal, estoy aquí para guiarte en tu transformación física. Vamos a crear tu perfil de entrenamiento paso a paso para asegurarnos de que tu plan sea seguro, efectivo y personalizado.\n\nRecuerda, cada campeón empezó con una barra vacía. ¡Let's go!`
    }
  ]);
  const [mostrarFormulario, setMostrarFormulario] = useState(true);
  const [formulario, setFormulario] = useState({});
  const conversationsEndRef = useRef(null);
  const textareaRef = useRef(null);

  const preguntasFormulario = [
    { name: 'edad', label: 'Edad', type: 'number', desc: '¿Cuántos años tienes?' },
    { name: 'genero', label: 'Género', type: 'select', options: ['Masculino', 'Femenino', 'Prefiero no decirlo'], desc: 'Selecciona tu género' },
    { name: 'peso', label: 'Peso actual (kg)', type: 'number', desc: 'Indica tu peso actual en kilogramos' },
    { name: 'estatura', label: 'Estatura (cm)', type: 'number', desc: 'Indica tu estatura en centímetros' },
    { name: 'nivel', label: 'Nivel de experiencia', type: 'select', options: ['Principiante', 'Intermedio', 'Avanzado'], desc: '¿Cuál es tu nivel de experiencia en el entrenamiento?' },
    { name: 'objetivo', label: 'Objetivo principal', type: 'select', options: ['Perder grasa', 'Ganar masa muscular', 'Mejorar resistencia', 'Tonificar', 'Rehabilitación', 'Otro'], desc: '¿Cuál es tu objetivo principal?' },
    { name: 'condiciones', label: 'Condiciones médicas', type: 'text', desc: '¿Hay alguna condición médica o restricción física que deba tener en cuenta?' },
    { name: 'preferencias', label: 'Preferencias alimenticias', type: 'select', options: ['Sin restricciones', 'Vegetariano', 'Vegano', 'Sin gluten', 'Sin lácteos', 'Ayuno intermitente', 'Otro'], desc: '¿Tienes alguna preferencia o restricción alimenticia?' },
    { name: 'tiempo', label: 'Tiempo semanal', type: 'select', options: ['1-2 días', '3-4 días', '5-6 días', '7 días'], desc: '¿Cuántos días a la semana puedes entrenar?' },
    { name: 'equipamiento', label: 'Acceso a equipamiento', type: 'select', options: ['Gimnasio completo', 'Gimnasio básico', 'Casa con equipo', 'Casa sin equipo', 'Al aire libre'], desc: '¿Dónde sueles entrenar?' },
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
    
    const perfilTexto = preguntasFormulario.map(q => {
      const valor = formulario[q.name] || 'No especificado';
      return `- ${q.label}: ${valor}`;
    }).join('\n');

    setConversations((prev) => [
      ...prev,
      {
        role: 'user',
        name: user,
        content: `Mi perfil de entrenamiento:\n${perfilTexto}`
      },
      {
        role: 'assistant',
        content: '¡Excelente! Ahora que te conozco mejor, voy a crear un plan personalizado para ti. Recuerda, la consistencia es la clave del éxito. 🏋️‍♂️'
      }
    ]);

    try {
      const prompt = `Como Chris Bumstead, campeón de Mr. Olympia Classic Physique y asesor de Titanes GYM, crea un plan de entrenamiento y nutrición personalizado para este usuario.\n\nDatos del usuario:\n${perfilTexto}\n\nResponde de forma directa, motivadora y profesional. Incluye:\n1. Plan de entrenamiento semanal detallado\n2. Recomendaciones nutricionales específicas\n3. Consejos de recuperación y prevención de lesiones\n4. Motivación personalizada y frases inspiradoras\n\nUsa un tono serio pero cercano, con referencias al culturismo y frases motivadoras. Sé específico con los ejercicios, series y repeticiones.`;
      
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
        { role: 'system', content: '¡Ups! Hubo un error al generar tu plan. No te preocupes, vamos a intentarlo de nuevo, champ. 💪' }
      ]);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!isLoading && prompt.trim()) {
        handleSubmit(e);
      }
    }
  };

  const sendPrompt = async (text) => {
    if (!text.trim() || isLoading) return;
    
    try {
      setIsLoading(true);
      const newConversations = [
        ...conversations,
        { role: 'user', name: user, content: text }
      ];
      setConversations(newConversations);
      setPrompt('');

      // Verificar si la pregunta está relacionada con fitness/entrenamiento
      const fitnessKeywords = [
        'ejercicio', 'entrenamiento', 'gimnasio', 'pesas', 'rutina', 'dieta', 'nutrición',
        'suplemento', 'proteína', 'creatina', 'pérdida de grasa', 'ganancia muscular',
        'resistencia', 'fuerza', 'hipertrofia', 'cardio', 'recuperación', 'lesión',
        'músculo', 'físico', 'entrenar', 'ejercitar', 'deporte', 'fitness', 'salud',
        'alimentación', 'comida', 'descanso', 'sueño', 'hidratación', 'flexibilidad',
        'movilidad', 'estiramiento', 'calentamiento', 'enfriamiento', 'técnica',
        'forma', 'postura', 'repeticiones', 'series', 'peso', 'intensidad',
        'frecuencia', 'volumen', 'progresión', 'periodización', 'sobreentrenamiento',
        'recuperación', 'dolor', 'fatiga', 'energía', 'motivación', 'objetivo',
        'meta', 'progreso', 'resultados', 'transformación', 'cambio', 'mejora',
        'desarrollo', 'crecimiento', 'fortalecimiento', 'tonificación', 'definición',
        'masa', 'volumen', 'fuerza', 'potencia', 'velocidad', 'agilidad',
        'coordinación', 'equilibrio', 'estabilidad', 'core', 'abdomen', 'piernas',
        'brazos', 'pecho', 'espalda', 'hombros', 'tren superior', 'tren inferior',
        'full body', 'split', 'circuito', 'hiit', 'funcional', 'crossfit',
        'calistenia', 'peso corporal', 'máquina', 'barra', 'mancuerna', 'kettlebell',
        'banda', 'cable', 'polea', 'press', 'sentadilla', 'peso muerto', 'remo',
        'dominada', 'flexión', 'plancha', 'abdominal', 'cardio', 'aeróbico',
        'anaeróbico', 'metabolismo', 'calorías', 'macros', 'proteínas', 'carbohidratos',
        'grasas', 'vitaminas', 'minerales', 'suplementos', 'pre-entreno', 'post-entreno',
        'intra-entreno', 'bcaa', 'glutamina', 'omega', 'multivitamínico', 'electrolitos',
        'hidratación', 'agua', 'bebida', 'comida', 'snack', 'merienda', 'desayuno',
        'almuerzo', 'cena', 'dieta', 'alimentación', 'nutrición', 'comida', 'receta',
        'menú', 'plan', 'programa', 'rutina', 'entrenamiento', 'ejercicio', 'deporte',
        'fitness', 'salud', 'bienestar', 'vida', 'estilo', 'hábito', 'rutina',
        'disciplina', 'constancia', 'perseverancia', 'esfuerzo', 'dedicación',
        'compromiso', 'motivación', 'inspiración', 'superación', 'mejora',
        'progreso', 'resultados', 'cambio', 'transformación', 'evolución',
        'desarrollo', 'crecimiento', 'fortalecimiento', 'tonificación', 'definición',
        'masa', 'volumen', 'fuerza', 'potencia', 'velocidad', 'agilidad',
        'coordinación', 'equilibrio', 'estabilidad', 'core', 'abdomen', 'piernas',
        'brazos', 'pecho', 'espalda', 'hombros', 'tren superior', 'tren inferior',
        'full body', 'split', 'circuito', 'hiit', 'funcional', 'crossfit',
        'calistenia', 'peso corporal', 'máquina', 'barra', 'mancuerna', 'kettlebell',
        'banda', 'cable', 'polea', 'press', 'sentadilla', 'peso muerto', 'remo',
        'dominada', 'flexión', 'plancha', 'abdominal', 'cardio', 'aeróbico',
        'anaeróbico', 'metabolismo', 'calorías', 'macros', 'proteínas', 'carbohidratos',
        'grasas', 'vitaminas', 'minerales', 'suplementos', 'pre-entreno', 'post-entreno',
        'intra-entreno', 'bcaa', 'glutamina', 'omega', 'multivitamínico', 'electrolitos',
        'hidratación', 'agua', 'bebida', 'comida', 'snack', 'merienda', 'desayuno',
        'almuerzo', 'cena', 'dieta', 'alimentación', 'nutrición', 'comida', 'receta',
        'menú', 'plan', 'programa', 'rutina', 'entrenamiento', 'ejercicio', 'deporte',
        'fitness', 'salud', 'bienestar', 'vida', 'estilo', 'hábito', 'rutina',
        'disciplina', 'constancia', 'perseverancia', 'esfuerzo', 'dedicación',
        'compromiso', 'motivación', 'inspiración', 'superación', 'mejora',
        'progreso', 'resultados', 'cambio', 'transformación', 'evolución'
      ];

      const isFitnessRelated = fitnessKeywords.some(keyword => 
        text.toLowerCase().includes(keyword.toLowerCase())
      );

      if (!isFitnessRelated) {
        setConversations([
          ...newConversations,
          { 
            role: 'assistant', 
            content: 'Hey champ, como tu asesor de entrenamiento en Titanes GYM, me enfoco exclusivamente en ayudarte con tu transformación física, nutrición y entrenamiento. ¿En qué puedo ayudarte con tu rutina de ejercicios, plan de alimentación o técnica de entrenamiento? 💪' 
          }
        ]);
        return;
      }

      const res = await axios.post('https://chatgptback.vercel.app/api/chat', {
        prompt: `Como Chris Bumstead, campeón de Mr. Olympia Classic Physique y asesor de Titanes GYM, responde a la siguiente pregunta relacionada con fitness y entrenamiento:\n\n${text}\n\nResponde de forma directa, motivadora y profesional, manteniendo el tono de un entrenador de élite. Incluye referencias al culturismo y frases motivadoras cuando sea apropiado.`,
        perfil: formulario
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
        { role: 'system', content: '¡Ups! Algo salió mal. Vamos a intentarlo de nuevo, champ. 💪' }
      ]);
    } finally {
      setIsLoading(false);
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!prompt.trim() || isLoading) return;
    sendPrompt(prompt);
  };

  return (
    <div className="bg-gradient-to-b from-purple-50 to-white shadow-lg rounded-lg border border-purple-300 mx-auto max-w-3xl">
      <div className="bg-gradient-to-r from-purple-700 to-indigo-700 text-white p-6 text-center shadow-md">
        <h2 className="text-2xl font-bold flex items-center justify-center">
          <FaRobot className="mr-3 text-purple-300" /> CBUM - Tu Asesor Personal
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
                {pregunta.type === 'select' ? (
                  <select
                    id={pregunta.name}
                    name={pregunta.name}
                    value={formulario[pregunta.name] || ''}
                    onChange={handleFormularioChange}
                    className="p-2 border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white text-gray-800 shadow-inner hover:border-purple-400 transition-colors cursor-pointer"
                  >
                    <option value="">Selecciona una opción</option>
                    {pregunta.options.map((option, i) => (
                      <option key={i} value={option}>{option}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    id={pregunta.name}
                    name={pregunta.name}
                    type={pregunta.type}
                    placeholder={pregunta.desc}
                    value={formulario[pregunta.name] || ''}
                    onChange={handleFormularioChange}
                    className="p-2 border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white text-gray-800 shadow-inner hover:border-purple-400 transition-colors"
                  />
                )}
              </div>
            ))}
          </div>
          <button
            type="submit"
            className="w-full mt-4 bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-800 hover:to-indigo-800 text-white py-3 px-5 rounded-lg transition-all flex items-center justify-center hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <FaDumbbell className="mr-2" /> ¡Comenzar mi Transformación!
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
              className="w-full p-4 border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white text-gray-800 resize-none shadow-inner transition-all hover:border-purple-400"
              rows="3"
              disabled={isLoading}
            />
          </div>
          <div className="flex items-center">
            <button
              type="submit"
              disabled={isLoading || !prompt.trim()}
              className="w-full bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-800 hover:to-indigo-800 text-white py-3 px-5 rounded-lg disabled:bg-gray-400 disabled:cursor-not-allowed transition-all flex items-center justify-center hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
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
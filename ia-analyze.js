const fs = require('fs');
const path = require('path');
const axios = require('axios');

const OUTPUT_DIR = path.join(__dirname, 'output');
const PROMPT_PATH = path.join(__dirname, 'prompts', 'devops-summary.txt');
const ENDPOINT = 'http://127.0.0.1:1234/v1/chat/completions';
const MODEL = 'Qwen2:7B'; // Cambia esto si el modelo se llama distinto en tu LM Studio

(async () => {
  try {
    // Leer prompt template
    const promptTemplate = fs.readFileSync(PROMPT_PATH, 'utf-8');

    // Leer el archivo más reciente del directorio output/
    const files = fs.readdirSync(OUTPUT_DIR)
      .filter(f => f.endsWith('.json'))
      .map(f => ({ name: f, time: fs.statSync(path.join(OUTPUT_DIR, f)).mtime }))
      .sort((a, b) => b.time - a.time);
    
    if (files.length === 0) throw new Error('No hay archivos .json en el directorio output/');
    const inputFile = path.join(OUTPUT_DIR, files[0].name);
    const jsonData = fs.readFileSync(inputFile, 'utf-8');

    // Inyectar el JSON en el prompt
    const fullPrompt = promptTemplate.replace('{{JSON_HERE}}', jsonData);

    // Enviar al endpoint de LM Studio (OpenAI-compatible)
    const response = await axios.post(ENDPOINT, {
      model: MODEL,
      messages: [
        { role: 'system', content: 'Eres un ingeniero de sistemas experto en observabilidad.' },
        { role: 'user', content: fullPrompt }
      ],
      temperature: 0.4
    });

    const reply = response.data.choices[0].message.content;
    console.log('\n🧠 RESPUESTA DEL LLM:\n');
    console.log(reply);

  } catch (error) {
    console.error('❌ Error al analizar con LLM Studio:', error.message);
    if (error.response?.data) {
      console.error(JSON.stringify(error.response.data, null, 2));
    }
  }
})();

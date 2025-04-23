require('dotenv').config({ path: '.env.local' });
const { OpenAI } = require('openai');

async function testOpenAI() {
  console.log('Test direct OpenAI');
  console.log('OPENAI_API_KEY définie:', !!process.env.OPENAI_API_KEY);
  
  if (!process.env.OPENAI_API_KEY) {
    console.error('Clé API non définie');
    return;
  }
  
  try {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
    
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'user', content: 'Dis bonjour' }
      ]
    });
    
    console.log('Réponse:', response.choices[0].message.content);
  } catch (error) {
    console.error('Erreur:', error.message);
  }
}

testOpenAI();
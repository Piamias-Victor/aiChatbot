// Importer dotenv pour charger les variables d'environnement
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

// Afficher les variables d'environnement liées à OpenAI
console.log('OPENAI_API_KEY définie:', !!process.env.OPENAI_API_KEY);
console.log('Valeur de OPENAI_API_KEY:', process.env.OPENAI_API_KEY ? `${process.env.OPENAI_API_KEY.substring(0, 8)}...` : 'non définie');
console.log('AI_MODEL:', process.env.AI_MODEL);
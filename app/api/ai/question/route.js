import { answerAIQuestion } from '../../../../lib/ai.js';

export async function POST(request) {
  try {
    const { question, pl } = await request.json();
    const answer = await answerAIQuestion(question, pl);
    
    return Response.json({ answer });
  } catch (error) {
    console.error('Question API Error:', error);
    return Response.json(
      { error: 'Failed to answer question' }, 
      { status: 500 }
    );
  }
}
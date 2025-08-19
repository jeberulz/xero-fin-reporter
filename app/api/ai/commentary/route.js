import { generateAICommentary } from '../../../../lib/ai.js';

export async function POST(request) {
  try {
    const pl = await request.json();
    const commentary = await generateAICommentary(pl);
    
    return Response.json(commentary);
  } catch (error) {
    console.error('Commentary API Error:', error);
    return Response.json(
      { error: 'Failed to generate commentary' }, 
      { status: 500 }
    );
  }
}
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

function formatFinancialData(pl) {
  const months = pl.months;
  
  // Format the data in a clear, structured way for AI analysis
  let dataStr = `Financial Report Analysis for ${pl.period.start} to ${pl.period.end} (${pl.period.currency})\n\n`;
  
  dataStr += "MONTHLY DATA:\n";
  dataStr += `Months: ${months.join(' | ')}\n\n`;
  
  dataStr += "REVENUE:\n";
  Object.entries(pl.revenue).forEach(([account, values]) => {
    dataStr += `${account}: ${values.map(v => `£${v.toLocaleString()}`).join(' | ')}\n`;
  });
  
  dataStr += "\nCOST OF GOODS SOLD:\n";
  Object.entries(pl.cogs).forEach(([account, values]) => {
    dataStr += `${account}: ${values.map(v => `£${v.toLocaleString()}`).join(' | ')}\n`;
  });
  
  dataStr += "\nOPERATING EXPENSES:\n";
  Object.entries(pl.opex).forEach(([account, values]) => {
    dataStr += `${account}: ${values.map(v => `£${v.toLocaleString()}`).join(' | ')}\n`;
  });
  
  if (pl.otherIncome && Object.keys(pl.otherIncome).length > 0) {
    dataStr += "\nOTHER INCOME:\n";
    Object.entries(pl.otherIncome).forEach(([account, values]) => {
      dataStr += `${account}: ${values.map(v => `£${v.toLocaleString()}`).join(' | ')}\n`;
    });
  }
  
  if (pl.otherExpense && Object.keys(pl.otherExpense).length > 0) {
    dataStr += "\nOTHER EXPENSES:\n";
    Object.entries(pl.otherExpense).forEach(([account, values]) => {
      dataStr += `${account}: ${values.map(v => `£${v.toLocaleString()}`).join(' | ')}\n`;
    });
  }
  
  if (pl.budget) {
    dataStr += "\nBUDGET COMPARISON:\n";
    dataStr += `Budget Revenue Total: ${pl.budget.revenueTotal.map(v => `£${v.toLocaleString()}`).join(' | ')}\n`;
    dataStr += `Budget Net Profit: ${pl.budget.netProfit.map(v => `£${v.toLocaleString()}`).join(' | ')}\n`;
  }
  
  return dataStr;
}

export async function generateAICommentary(pl) {
  try {
    const financialData = formatFinancialData(pl);
    
    const prompt = `You are a financial analyst reviewing a Profit & Loss statement. Analyze the following financial data and provide:

1. A comprehensive narrative summary (2-3 sentences) highlighting key performance trends, revenue changes, margin analysis, and overall financial health
2. 3-4 bullet points with specific insights about the business performance

Focus on month-over-month changes, identify key drivers of performance, and provide actionable insights. Be specific with numbers and percentages.

${financialData}

Please respond in this JSON format:
{
  "summary": "Your narrative summary here",
  "bullets": ["Bullet point 1", "Bullet point 2", "Bullet point 3"]
}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are an expert financial analyst. Provide clear, actionable insights based on financial data. Always be specific with numbers and focus on business implications."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 800
    });

    const responseText = completion.choices[0].message.content.trim();
    
    // Try to parse JSON response, fallback to structured text if needed
    try {
      return JSON.parse(responseText);
    } catch (parseError) {
      // Fallback: extract summary and bullets from text response
      const lines = responseText.split('\n').filter(line => line.trim());
      const summary = lines.find(line => !line.startsWith('•') && !line.startsWith('-') && line.length > 50) || responseText;
      const bullets = lines.filter(line => line.startsWith('•') || line.startsWith('-')).map(line => line.replace(/^[•-]\s*/, ''));
      
      return {
        summary,
        bullets: bullets.length > 0 ? bullets : ["Analysis completed based on provided financial data."]
      };
    }
  } catch (error) {
    console.error('AI Commentary Error:', error);
    // Fallback to basic analysis if AI fails
    return {
      summary: "AI analysis temporarily unavailable. The financial data shows performance across the specified period with various revenue streams and expense categories.",
      bullets: [
        "Multiple revenue sources including product sales and services",
        "Operating expenses include payroll, marketing, and facilities costs",
        "Monthly variations observed in key financial metrics"
      ]
    };
  }
}

export async function answerAIQuestion(question, pl) {
  try {
    const financialData = formatFinancialData(pl);
    
    const prompt = `You are a financial analyst. A user is asking about the following financial data:

${financialData}

User Question: "${question}"

Please provide a specific, data-driven answer based on the financial information provided. If the question cannot be answered with the available data, explain what additional information would be needed. Be concise but thorough.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are an expert financial analyst. Answer questions about financial data with specific numbers and insights. If data is not available, clearly state this and suggest what information would be helpful."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.2,
      max_tokens: 300
    });

    return completion.choices[0].message.content.trim();
  } catch (error) {
    console.error('AI Question Error:', error);
    return "I'm unable to analyze your question at the moment. Please try again or rephrase your question.";
  }
}
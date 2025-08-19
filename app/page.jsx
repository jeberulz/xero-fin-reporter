
"use client";
import { useEffect, useState } from "react";
import { Card, Table } from "../components/ui";
import { AIProgress } from "../components/AIProgress";
import { FormattedAnswer } from "../components/FormattedAnswer";
import { QuestionHistory } from "../components/QuestionHistory";
import { computePL } from "../lib/report";
function fmt(n){ return `£${n.toLocaleString()}`; }
function formatTime(timestamp) {
  return new Date(timestamp).toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  });
}
export default function Page(){
  const [pl,setPl]=useState(null); const [commentary,setCommentary]=useState(null); const [question,setQuestion]=useState(""); const [answer,setAnswer]=useState(""); const [loading,setLoading]=useState({ commentary: false, question: false }); const [showProgress,setShowProgress]=useState(false); const [questionHistory,setQuestionHistory]=useState([]); const [showHistory,setShowHistory]=useState(false);
  
  useEffect(()=>{ 
    fetch("/data/pl.json").then(r=>r.json()).then(setPl);
    // Load history from localStorage
    const savedHistory = localStorage.getItem('ai-question-history');
    if (savedHistory) {
      try {
        setQuestionHistory(JSON.parse(savedHistory));
      } catch (error) {
        console.error('Failed to load question history:', error);
      }
    }
  },[]);

  // Save history to localStorage whenever it changes
  useEffect(() => {
    if (questionHistory.length > 0) {
      localStorage.setItem('ai-question-history', JSON.stringify(questionHistory));
    } else {
      localStorage.removeItem('ai-question-history');
    }
  }, [questionHistory]);
  if(!pl) return null;
  const months=pl.months; const totals=computePL(pl);
  const onExplain=async()=>{
    setCommentary(null);
    setShowProgress(true);
    setLoading(prev=>({...prev,commentary:true}));
  };
  
  const handleProgressComplete=async()=>{
    try {
      const response = await fetch('/api/ai/commentary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pl)
      });
      const result = await response.json();
      setCommentary(result);
    } catch (error) {
      console.error('Failed to get AI commentary:', error);
      setCommentary({ summary: "Failed to generate AI commentary. Please try again.", bullets: [] });
    } finally {
      setShowProgress(false);
      setLoading(prev=>({...prev,commentary:false}));
    }
  };
  const onAsk=async()=>{
    if(!question.trim()) return;
    setLoading(prev=>({...prev,question:true}));
    try {
      const response = await fetch('/api/ai/question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, pl })
      });
      const result = await response.json();
      const newHistoryItem = {
        id: Date.now().toString(),
        question: question.trim(),
        answer: result.answer,
        timestamp: Date.now()
      };
      setQuestionHistory(prev => [...prev, newHistoryItem]);
      setAnswer(result.answer);
      setQuestion("");
    } catch (error) {
      console.error('Failed to get AI answer:', error);
      setAnswer("Failed to get AI response. Please try again.");
    } finally {
      setLoading(prev=>({...prev,question:false}));
    }
  };

  const handleFollowUp = (originalQuestion) => {
    setQuestion(`Following up on "${originalQuestion}": `);
    setShowHistory(false);
  };

  const handleClearHistory = () => {
    setQuestionHistory([]);
    setAnswer("");
  };

  const handleDeleteQuestion = (id) => {
    setQuestionHistory(prev => prev.filter(item => item.id !== id));
    if (questionHistory.find(item => item.id === id)?.answer === answer) {
      setAnswer("");
    }
  };
  return (<div className="grid md:grid-cols-2 gap-6">
    <Card title="Profit & Loss (Demo Data)" action={<button className="x-btn" onClick={onExplain} disabled={loading.commentary}>{loading.commentary ? "Analyzing..." : "Explain with AI"}</button>}>
      <div className="x-subtle mb-3">Period: {pl.period.start} to {pl.period.end}</div>
      <div className="space-y-6">
        <div><div className="font-medium mb-1">Revenue</div>
          <Table columns={["Account",...months]} rows={Object.entries(pl.revenue).map(([n,a])=>[n, ...a.map(v=>fmt(v))])} /></div>
        <div><div className="font-medium mb-1">Cost of Goods Sold</div>
          <Table columns={["Account",...months]} rows={Object.entries(pl.cogs).map(([n,a])=>[n, ...a.map(v=>fmt(v))])} /></div>
        <div><div className="font-medium mb-1">Operating Expenses</div>
          <Table columns={["Account",...months]} rows={Object.entries(pl.opex).map(([n,a])=>[n, ...a.map(v=>fmt(v))])} /></div>
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 bg-xero-sky rounded-xl"><div className="text-xs text-xero-slate">Revenue (last)</div><div className="text-xl font-semibold text-xero-blue">{fmt(totals.revTotal.at(-1))}</div></div>
          <div className="p-3 bg-xero-sky rounded-xl"><div className="text-xs text-xero-slate">Gross Margin</div><div className="text-xl font-semibold text-xero-blue">{(totals.gmPct.at(-1)*100).toFixed(1)}%</div></div>
          <div className="p-3 bg-xero-sky rounded-xl"><div className="text-xs text-xero-slate">Net Profit (last)</div><div className="text-xl font-semibold text-xero-blue">{fmt(totals.netProfit.at(-1))}</div></div>
        </div>
      </div>
    </Card>
    <Card title="AI Commentary & Q&A">
      {showProgress ? (
        <AIProgress isActive={showProgress} onComplete={handleProgressComplete} />
      ) : !commentary ? (
        <div className="text-gray-500">Click "Explain with AI" to generate narrative commentary.</div>
      ) : (
        <div className="space-y-4">
          <div className="text-[15px] leading-6">{commentary.summary}</div>
          <ul className="list-disc pl-5 text-sm text-gray-700">{commentary.bullets.map((b,i)=>(<li key={i}>{b}</li>))}</ul>
        </div>
      )}
      <div className="mt-6 border-t pt-4">
        <div className="flex items-center justify-between mb-3">
          <div className="x-title">Ask a question</div>
          {questionHistory.length > 0 && (
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1 hover:bg-blue-50 px-2 py-1 rounded transition-colors"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {showHistory ? 'Hide History' : `History (${questionHistory.length})`}
            </button>
          )}
        </div>

        {/* Question history */}
        {showHistory && questionHistory.length > 0 && (
          <div className="mb-4 bg-gray-50 rounded-lg p-4 border">
            <QuestionHistory
              history={questionHistory}
              onClearHistory={handleClearHistory}
              onDeleteQuestion={handleDeleteQuestion}
              onFollowUp={handleFollowUp}
              isLoading={loading.question}
            />
          </div>
        )}

        {/* Question input */}
        <div className="flex items-center gap-2">
          <input 
            value={question} 
            onChange={e=>setQuestion(e.target.value)} 
            onKeyPress={e => e.key === 'Enter' && !loading.question && question.trim() && onAsk()}
            className="w-full rounded-lg border-gray-200 text-sm" 
            placeholder="Why did utilities increase?" 
          />
          <button 
            className="x-btn" 
            onClick={onAsk} 
            disabled={loading.question || !question.trim()}
          >
            {loading.question ? "..." : "Ask"}
          </button>
        </div>

        {/* Current answer display */}
        {answer && (
          <div className="mt-4 p-5 bg-gradient-to-br from-gray-50 to-blue-50/30 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div className="text-sm font-semibold text-gray-800">Latest AI Analysis</div>
              </div>
              <div className="text-xs text-gray-500">
                {questionHistory.length > 0 && formatTime(questionHistory[questionHistory.length - 1]?.timestamp)}
              </div>
            </div>
            <FormattedAnswer answer={answer} />
          </div>
        )}
      </div>
    </Card>
  </div>);
}

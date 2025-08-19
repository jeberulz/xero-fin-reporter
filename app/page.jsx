
"use client";
import { useEffect, useState } from "react";
import { Card, Table } from "../components/ui";
import { computePL } from "../lib/report";
function fmt(n){ return `£${n.toLocaleString()}`; }
export default function Page(){
  const [pl,setPl]=useState(null); const [commentary,setCommentary]=useState(null); const [question,setQuestion]=useState(""); const [answer,setAnswer]=useState(""); const [loading,setLoading]=useState({ commentary: false, question: false });
  useEffect(()=>{ fetch("/data/pl.json").then(r=>r.json()).then(setPl); },[]);
  if(!pl) return null;
  const months=pl.months; const totals=computePL(pl);
  const onExplain=async()=>{
    setLoading(prev=>({...prev,commentary:true}));
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
      setAnswer(result.answer);
    } catch (error) {
      console.error('Failed to get AI answer:', error);
      setAnswer("Failed to get AI response. Please try again.");
    } finally {
      setLoading(prev=>({...prev,question:false}));
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
      {!commentary ? <div className="text-gray-500">Click "Explain with AI" to generate narrative commentary.</div> :
        <div className="space-y-4">
          <div className="text-[15px] leading-6">{commentary.summary}</div>
          <ul className="list-disc pl-5 text-sm text-gray-700">{commentary.bullets.map((b,i)=>(<li key={i}>{b}</li>))}</ul>
        </div>}
      <div className="mt-6 border-t pt-4">
        <div className="x-title mb-2">Ask a question</div>
        <div className="flex items-center gap-2"><input value={question} onChange={e=>setQuestion(e.target.value)} className="w-full rounded-lg border-gray-200" placeholder="Why did utilities increase?" />
          <button className="x-btn" onClick={onAsk} disabled={loading.question || !question.trim()}>{loading.question ? "..." : "Ask"}</button></div>
        {answer && <div className="mt-3 text-sm">{answer}</div>}
      </div>
    </Card>
  </div>);
}


function sum(arr){return arr.reduce((a,b)=>a+b,0);}
export function computePL(pl){
  const months=pl.months;
  const revTotal=months.map((_,i)=>sum(Object.values(pl.revenue).map(a=>a[i])));
  const cogsTotal=months.map((_,i)=>sum(Object.values(pl.cogs).map(a=>a[i])));
  const grossProfit=months.map((_,i)=>revTotal[i]-cogsTotal[i]);
  const opexTotal=months.map((_,i)=>sum(Object.values(pl.opex).map(a=>a[i])));
  const otherI=months.map((_,i)=>sum(Object.values(pl.otherIncome||{}).map(a=>a[i]||0)));
  const otherE=months.map((_,i)=>sum(Object.values(pl.otherExpense||{}).map(a=>a[i]||0)));
  const netProfit=months.map((_,i)=>grossProfit[i]-opexTotal[i]+otherI[i]-otherE[i]);
  const gmPct=months.map((_,i)=>revTotal[i]?(grossProfit[i]/revTotal[i]):0);
  return { months, revTotal, cogsTotal, grossProfit, opexTotal, otherI, otherE, netProfit, gmPct };
}
export function generateCommentary(pl){
  const c=computePL(pl); const last=c.months.length-1; const prev=Math.max(0,last-1);
  const revChange=c.revTotal[prev]?(c.revTotal[last]-c.revTotal[prev])/c.revTotal[prev]:0;
  const gmChange=c.gmPct[last]-c.gmPct[prev];
  const drivers=[];
  let topRev=null, topDelta=-Infinity;
  for(const [name,arr] of Object.entries(pl.revenue)){ const d=arr[last]-arr[prev]; if(d>topDelta){topDelta=d; topRev=name;} }
  if(topRev) drivers.push(`${topRev} rose by £${topDelta.toLocaleString()}.`);
  let topExp=null, topExpDelta=-Infinity;
  for(const [name,arr] of Object.entries(pl.opex)){ const d=arr[last]-arr[prev]; if(d>topExpDelta){topExpDelta=d; topExp=name;} }
  if(topExp && topExpDelta>0) drivers.push(`${topExp} increased by £${topExpDelta.toLocaleString()}.`);
  const bullets=[
    `Revenue ${revChange>=0?"up":"down"} ${(Math.abs(revChange)*100).toFixed(1)}% month-on-month.`,
    `Gross margin ${gmChange>=0?"improved":"declined"} to ${(c.gmPct[last]*100).toFixed(1)}%.`,
    `Net profit in ${c.months[last]}: £${c.netProfit[last].toLocaleString()}.`
  ];
  const paras=[
    `Overall revenue for ${c.months[last]} was £${c.revTotal[last].toLocaleString()}, ${revChange>=0?"an increase":"a decrease"} of ${(Math.abs(revChange)*100).toFixed(1)}% from ${c.months[prev]}.`,
    `COGS totaled £${c.cogsTotal[last].toLocaleString()}, yielding gross profit of £${c.grossProfit[last].toLocaleString()} (${(c.gmPct[last]*100).toFixed(1)}% margin).`,
    drivers.length?`Key drivers: ${drivers.join(" ")}`:`Key drivers are unclear from the dataset.`,
    `Operating expenses were £${c.opexTotal[last].toLocaleString()}. Net profit closed at £${c.netProfit[last].toLocaleString()}.`
  ];
  return { summary: paras.join(" "), bullets };
}
export function answerQuestion(question,pl){
  const q=(question||"").toLowerCase(); const c=computePL(pl); const last=c.months.length-1;
  if(q.includes("why") && q.includes("utilities")){ const util=pl.opex["Utilities"]; if(util){ const prev=util.length>1?util[util.length-2]:null; if(prev!=null){ const d=util[util.length-1]-prev; return `Utilities increased by £${d.toLocaleString()} month-on-month (from £${prev} to £${util[util.length-1]}). The dataset does not explain the cause.`; } } }
  if(q.includes("gross") && q.includes("margin")) return `Gross margin in ${c.months[last]} is ${(c.gmPct[last]*100).toFixed(1)}%.`;
  if(q.includes("revenue")) return `Revenue in ${c.months[last]}: £${c.revTotal[last].toLocaleString()}.`;
  return "Not available in the dataset.";
}

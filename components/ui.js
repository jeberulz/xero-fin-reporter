export function Card({ title, action, children }){
  return (<section className="x-card p-4 md:p-5">
    <div className="flex items-start justify-between mb-3">
      <h2 className="x-title">{title}</h2>{action ? <div>{action}</div> : null}
    </div>{children}
  </section>);
}
export function Table({ columns=[], rows=[] }){
  return (<div className="overflow-x-auto"><table className="min-w-full text-sm">
    <thead><tr className="text-left text-gray-600 border-b">
      {columns.map((c,i)=>(<th key={i} className="py-2 pr-4">{c}</th>))}
    </tr></thead>
    <tbody>{rows.map((r,i)=>(<tr key={i} className="border-b last:border-b-0">
      {r.map((cell,j)=>(<td key={j} className="py-2 pr-4 align-top">{cell}</td>))}
    </tr>))}</tbody></table></div>);
}
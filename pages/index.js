import Head from "next/head";

export default function Home() {
  return (
    <>
      <Head><title>ProblemSolve — Problem Solving Hub</title><meta name="viewport" content="width=device-width, initial-scale=1" /></Head>
      <main className="site">
        <header><a className="logo" href="#">Problem<span>Solve</span></a><nav><a href="#problems">Problems</a><a href="#process">Process</a><a href="#tools">Tools</a></nav><button onClick={()=>document.body.classList.toggle("light")}>☼</button></header>
        <section className="hero"><div><p className="eyebrow">THINK • ANALYZE • SOLVE</p><h1>Turn complex problems into <span>clear solutions.</span></h1><p className="lead">A modern workspace to define problems, break them down, explore ideas and track practical solutions.</p><div className="actions"><a className="btn primary" href="#problems">Start Solving →</a><a className="btn" href="#process">How it works</a></div></div><div className="hero-card"><div className="orb">?</div><div className="mini">PROBLEM → <b>IDEA</b> → SOLUTION</div></div></section>
        <section id="problems"><p className="eyebrow">WORKSPACE</p><h2>Problem board</h2><div className="grid">{[["Reduce plastic waste","Environment",72],["Smart irrigation","Agriculture",86],["Student productivity","Education",54]].map(([t,c,p])=><article className="card" key={t}><span className="tag">{c}</span><h3>{t}</h3><p>Define the challenge, analyze its root cause and develop a practical solution.</p><small>Solution progress · {p}%</small><div className="progress"><i style={{width:p+"%"}}/></div></article>)}</div></section>
        <section id="process"><p className="eyebrow">METHOD</p><h2>A simple solving framework</h2><div className="steps">{[["01","Define","State the problem clearly and identify who is affected."],["02","Analyze","Find causes, constraints and the real root issue."],["03","Ideate","Generate multiple approaches before implementation."],["04","Validate","Test, measure results and improve the solution."]].map(x=><article key={x[0]}><b>{x[0]}</b><h3>{x[1]}</h3><p>{x[2]}</p></article>)}</div></section>
        <section id="tools"><p className="eyebrow">TOOLS</p><h2>Quick thinking tools</h2><div className="tools">{["5 Whys","SWOT","Impact / Effort","Root Cause"].map(x=><button key={x} onClick={()=>alert(x+" — use this framework to structure your analysis.")}>{x}</button>)}</div></section>
        <footer>ProblemSolve • Build ideas into practical solutions.</footer>
      </main>
    </>
  );
}
import Head from "next/head";
import { useRef, useState } from "react";

export default function Home() {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef(null);

  function loadFile(file) {
    if (!file || !file.type.startsWith("image/")) return;
    if (file.size > 8 * 1024 * 1024) return alert("Please use an image smaller than 8 MB.");
    setImage(file);
    setPreview(URL.createObjectURL(file));
    setAnswer("");
  }

  async function solve() {
    if (!image && !question.trim()) return;
    setLoading(true); setAnswer("");
    try {
      let imageData = null;
      if (image) {
        imageData = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(image);
        });
      }
      const r = await fetch("/api/solve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: imageData, question })
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || "Something went wrong.");
      setAnswer(data.answer);
    } catch (e) {
      setAnswer("### Connection issue\n\n" + e.message);
    } finally { setLoading(false); }
  }

  return <><Head>
    <title>NOVA AI — See it. Understand it. Solve it.</title>
    <meta name="description" content="AI image understanding and maths & science problem solver." />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <link rel="stylesheet" href="/style.css" />
  </Head>
  <main className="nova">
    <nav className="nav">
      <a className="brand" href="#"><span className="brand-mark">N</span>NOVA<span className="brand-ai">AI</span></a>
      <div className="nav-links"><a href="#solve">Solver</a><a href="#how">How it works</a><a href="#features">Features</a></div>
      <span className="status"><i/> AI READY</span>
    </nav>

    <section className="hero">
      <div className="hero-copy">
        <div className="pill">✦ MULTIMODAL AI • 2026</div>
        <h1>See it.<br/><em>Understand it.</em><br/>Solve it.</h1>
        <p>Upload a question, diagram, textbook page, equation or real-world image. NOVA reads it, explains what it means and works through the solution step by step.</p>
        <div className="hero-stats"><span><b>01</b> IMAGE UNDERSTANDING</span><span><b>02</b> MATH & SCIENCE</span><span><b>03</b> CLEAR EXPLANATIONS</span></div>
      </div>
      <div className="hero-orbit"><div className="orbit orbit-a"/><div className="orbit orbit-b"/><div className="nova-core">N<span>✦</span></div><small>VISUAL<br/>INTELLIGENCE</small></div>
    </section>

    <section id="solve" className="solver">
      <div className="section-head"><div><span className="eyebrow">NOVA SOLVER</span><h2>Give NOVA something to understand.</h2></div><span className="hint">JPG • PNG • WEBP • GIF</span></div>
      <div className="workspace">
        <div className={"upload " + (dragging ? "dragging" : "")} onClick={()=>inputRef.current?.click()}
          onDragOver={e=>{e.preventDefault();setDragging(true)}} onDragLeave={()=>setDragging(false)}
          onDrop={e=>{e.preventDefault();setDragging(false);loadFile(e.dataTransfer.files[0])}}>
          <input ref={inputRef} type="file" accept="image/*" hidden onChange={e=>loadFile(e.target.files[0])}/>
          {preview ? <div className="preview-wrap"><img src={preview} alt="Uploaded problem"/><button className="remove" onClick={e=>{e.stopPropagation();setImage(null);setPreview("");}}>×</button></div> :
          <><div className="upload-icon">↑</div><h3>Drop an image here</h3><p>or click to browse your device</p><span>We’ll inspect equations, diagrams, text and objects.</span></>}
        </div>
        <div className="ask">
          <label>What do you want NOVA to do?</label>
          <textarea value={question} onChange={e=>setQuestion(e.target.value)} placeholder="Example: Solve this equation and explain every step…"/>
          <div className="chips">{["Solve this","Explain the image","Read the diagram","Find the formula"].map(x=><button key={x} onClick={()=>setQuestion(x)}>{x}</button>)}</div>
          <button className="solve-btn" onClick={solve} disabled={loading || (!image && !question.trim())}>{loading ? "NOVA IS THINKING…" : "✦  ANALYZE & SOLVE"}</button>
        </div>
      </div>
    </section>

    {(loading || answer) && <section className="answer-section"><div className="answer-head"><span className="eyebrow">NOVA'S ANALYSIS</span>{loading && <span className="thinking"><i/> Reading image • Checking logic • Solving</span>}</div>
      {loading ? <div className="skeleton"><i/><i/><i/><i/></div> : <article className="answer"><pre>{answer}</pre></article>}
    </section>}

    <section id="features" className="features"><span className="eyebrow">CAPABILITIES</span><h2>One workspace for visual learning.</h2><div className="feature-grid">
      {[["◈","Image understanding","Reads textbook pages, diagrams, charts, equations, objects and handwritten-style problems."],["∑","Math solver","Breaks algebra, calculus, geometry and numerical problems into understandable steps."],["⚛","Science tutor","Explains physics, chemistry and biology concepts, formulas, units and diagrams."],["✓","Answer checking","Shows assumptions and asks for a clearer image when the visual evidence is insufficient."]].map(([i,t,d])=><article key={t}><span>{i}</span><h3>{t}</h3><p>{d}</p></article>)}
    </div></section>

    <section id="how" className="how"><span className="eyebrow">HOW NOVA WORKS</span><div className="steps">{[["01","UPLOAD","Give NOVA a photo or question."],["02","UNDERSTAND","The vision model reads the content and context."],["03","REASON","NOVA works through the problem and checks its reasoning."],["04","EXPLAIN","You get a clear answer with steps, formulas and meaning."]].map(x=><div key={x[0]}><b>{x[0]}</b><h3>{x[1]}</h3><p>{x[2]}</p></div>)}</div></section>

    <footer><div className="brand"><span className="brand-mark">N</span>NOVA<span className="brand-ai">AI</span></div><p>See it. Understand it. Solve it.</p><small>AI can make mistakes. Verify important answers.</small></footer>
  </main></>;
}
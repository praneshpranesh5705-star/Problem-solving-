"use client";
import { useRef, useState } from "react";

const MODES = [["auto", "✨ Auto"], ["explain", "🔍 Explain image"], ["math", "➗ Maths"], ["science", "🧪 Science"]];

function esc(t) { return t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
function md(s) {
  return s.split("```").map((p, i) => {
    if (i % 2) return "<pre><code>" + esc(p.replace(/^\w*\n/, "")) + "</code></pre>";
    let h = esc(p);
    h = h.replace(/^#{1,3} (.*)$/gm, "<h3>$1</h3>").replace(/\*\*(.+?)\*\*/g, "<b>$1</b>").replace(/`([^`]+)`/g, "<code>$1</code>");
    h = h.replace(/^Final answer:(.*)$/gim, '<div class="ans"><b>Final answer:</b>$1</div>');
    h = h.replace(/(^|\n)((?:\s*[-*] .*(?:\n|$))+)/g, (m, a, b) => a + "<ul>" + b.trim().split("\n").map((l) => "<li>" + l.replace(/^\s*[-*] /, "") + "</li>").join("") + "</ul>");
    h = h.replace(/(^|\n)((?:\s*\d+[.)] .*(?:\n|$))+)/g, (m, a, b) => a + "<ol>" + b.trim().split("\n").map((l) => "<li>" + l.replace(/^\s*\d+[.)] /, "") + "</li>").join("") + "</ol>");
    return h.split(/\n{2,}/).map((x) => (/^\s*<(h3|ul|ol|div)/.test(x) ? x : "<p>" + x.replace(/\n/g, "<br>") + "</p>")).join("");
  }).join("");
}

// shrink big phone photos so uploads are fast and under server limits
function shrink(file, max = 1600) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file), im = new Image();
    im.onload = () => {
      const r = Math.min(1, max / Math.max(im.width, im.height));
      const c = document.createElement("canvas");
      c.width = Math.round(im.width * r); c.height = Math.round(im.height * r);
      c.getContext("2d").drawImage(im, 0, 0, c.width, c.height);
      const dataUrl = c.toDataURL("image/jpeg", 0.85);
      URL.revokeObjectURL(url);
      resolve({ preview: dataUrl, media_type: "image/jpeg", data: dataUrl.split(",")[1] });
    };
    im.onerror = () => reject(new Error("bad image"));
    im.src = url;
  });
}

export default function Home() {
  const [img, setImg] = useState(null);
  const [mode, setMode] = useState("auto");
  const [q, setQ] = useState("");
  const [fq, setFq] = useState("");
  const [msgs, setMsgs] = useState([]); // {role, content}
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const fileRef = useRef(null);
  const ctl = useRef(null);

  async function pick(f) {
    if (!f || !f.type.startsWith("image/")) return;
    try { setImg(await shrink(f)); setErr(""); } catch { setErr("Could not read that image."); }
  }

  async function send(text, fresh) {
    if (busy) return;
    const history = fresh ? [] : msgs;
    const next = [...history, { role: "user", content: text }];
    setMsgs([...next, { role: "assistant", content: "" }]);
    setBusy(true); setErr("");
    ctl.current = new AbortController();
    let out = "";
    try {
      const res = await fetch("/api/solve", {
        method: "POST", signal: ctl.current.signal,
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ messages: next, mode, image: img ? { media_type: img.media_type, data: img.data } : null }),
      });
      if (!res.ok) { const j = await res.json().catch(() => ({})); throw new Error(j.error || "Request failed."); }
      const reader = res.body.getReader(), dec = new TextDecoder();
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        out += dec.decode(value, { stream: true });
        setMsgs([...next, { role: "assistant", content: out }]);
      }
    } catch (e) {
      if (e.name !== "AbortError") setErr(e.message);
      setMsgs([...next, { role: "assistant", content: out }]);
    } finally { setBusy(false); }
  }

  function ask() {
    if (!img && !q.trim()) return;
    send(q.trim() || "Please analyse the image.", true);
  }
  function follow() { const t = fq.trim(); if (!t) return; setFq(""); send(t, false); }
  function clear() { ctl.current?.abort(); setMsgs([]); setImg(null); setQ(""); setErr(""); if (fileRef.current) fileRef.current.value = ""; }

  return (
    <main className="wrap">
      <header>
        <div className="logo"><span className="dot" /> NOVA AI</div>
        <h1>See it. Understand it. Solve it.</h1>
        <p className="sub">Upload a photo of a diagram, textbook problem, plant, machine or anything — get its meaning and a clear step-by-step solution for maths &amp; science.</p>
      </header>

      <section className="card">
        {!img ? (
          <div className="drop" onClick={() => fileRef.current.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => { e.preventDefault(); pick(e.dataTransfer.files[0]); }}>
            <b>📷 Tap to upload or take a photo</b>JPG, PNG, WebP
          </div>
        ) : (
          <div className="prev"><img src={img.preview} alt="Uploaded" /><button onClick={() => setImg(null)} aria-label="Remove image">✕</button></div>
        )}
        <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => pick(e.target.files[0])} />

        <div className="modes">
          {MODES.map(([k, l]) => (<button key={k} className={"chip" + (mode === k ? " sel" : "")} onClick={() => setMode(k)}>{l}</button>))}
        </div>
        <textarea value={q} onChange={(e) => setQ(e.target.value)} placeholder="Type a question or add details (optional). Example: Solve question 3 · What is this part? · Explain in Tamil" />
        <div className="row">
          <button className="btn" disabled={busy} onClick={ask}>Ask NOVA</button>
          <button className="btn sec" onClick={clear}>Clear</button>
        </div>
      </section>

      {msgs.length > 0 && (
        <section className="card">
          {msgs.map((m, i) => (
            <div className="msg" key={i}>
              <div className="who">{m.role === "user" ? "YOU" : "NOVA"}</div>
              {m.role === "assistant" && !m.content && busy
                ? <span className="think">Thinking…</span>
                : <div className="bub" dangerouslySetInnerHTML={{ __html: md(m.content) }} />}
            </div>
          ))}
          {err && <div className="err">{err}</div>}
          {busy && <button className="btn sec" style={{ marginTop: 12 }} onClick={() => ctl.current?.abort()}>■ Stop</button>}
          {!busy && msgs.length > 1 && (
            <div className="row">
              <textarea style={{ minHeight: 52 }} value={fq} onChange={(e) => setFq(e.target.value)} placeholder="Ask a follow-up… (e.g. explain step 2 more simply)" />
              <button className="btn" style={{ flex: "0 0 100%" }} onClick={follow}>Send follow-up</button>
            </div>
          )}
        </section>
      )}
      <p className="small">AI can make mistakes — double-check important answers.</p>
    </main>
  );
}

import React from 'react';
import ReactDOM from 'react-dom/client';

function App() {
  return (
    <main style={{ minHeight: '100vh', background: '#f8f2e8', color: '#1e1a16', padding: 28, fontFamily: 'Arial, sans-serif' }}>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        <p style={{ letterSpacing: 4, color: '#7a4b2a', fontSize: 12, fontWeight: 700 }}>MORNING CHANGES</p>
        <h1 style={{ fontSize: 44, margin: '8px 0 12px', lineHeight: 1 }}>Today&apos;s Lesson</h1>
        <p style={{ color: '#746b60', fontSize: 18 }}>One excellent jazz guitar lesson every morning.</p>

        <section style={{ background: '#fffdf7', border: '1px solid #e4d7c7', borderRadius: 28, padding: 24, marginTop: 28 }}>
          <p style={{ color: '#7a4b2a', fontWeight: 700, margin: 0 }}>12 MIN · AUTUMN LEAVES</p>
          <h2 style={{ fontSize: 30, margin: '10px 0' }}>First Shell Voicings</h2>
          <p style={{ fontSize: 18, color: '#1e1a16' }}>Guide tones create motion with minimal movement.</p>

          <div style={{ margin: '22px 0', padding: 28, borderRadius: 22, background: '#f3e7d7', color: '#7a4b2a', fontWeight: 700, textAlign: 'center' }}>
            Gm7 → C7 → Fmaj7<br />3rds + 7ths across the fretboard
          </div>

          <h3>Warm-up</h3>
          <ul>
            <li>Play 3rd + 7th shell voicings through ii-V-I.</li>
            <li>Repeat slowly at 70 BPM before moving up.</li>
          </ul>

          <div style={{ display: 'inline-block', marginTop: 12, padding: '10px 16px', borderRadius: 999, background: '#e7d0b7', fontWeight: 700 }}>
            Tempo: 70 → 110 BPM
          </div>

          <p style={{ marginTop: 20, color: '#746b60', lineHeight: 1.5 }}>
            Autumn Leaves became one of the defining entry standards in modern jazz education because its harmony clearly teaches minor and major ii-V-I movement.
          </p>
        </section>

        <nav style={{ display: 'flex', justifyContent: 'space-around', marginTop: 28, padding: 16, background: '#fffdf7', border: '1px solid #e4d7c7', borderRadius: 999, color: '#746b60', fontWeight: 700 }}>
          <span>Today</span><span>Library</span><span>Standards</span>
        </nav>
      </div>
    </main>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

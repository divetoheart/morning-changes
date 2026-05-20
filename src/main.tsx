import React from 'react';
import ReactDOM from 'react-dom/client';
import './web.css';
import { autumnLeavesLesson } from './content/autumnLeaves';

function App(){
return <div className='app'>
<header className='hero'>
<p className='kicker'>MORNING CHANGES</p>
<h1>Today's Lesson</h1>
<p className='subtitle'>One excellent jazz lesson every morning.</p>
</header>
<section className='card'>
<h2>{autumnLeavesLesson.title}</h2>
<p>{autumnLeavesLesson.thesis}</p>
<div className='visual'>Guide tones · Shell voicings · Autumn Leaves</div>
<ul>{autumnLeavesLesson.warmup.map(x=><li key={x}>{x}</li>)}</ul>
<div className='tempo'>{autumnLeavesLesson.tempo.start} → {autumnLeavesLesson.tempo.goal} BPM</div>
<p className='history'>{autumnLeavesLesson.history}</p>
</section>
<nav><span>Today</span><span>Library</span><span>Standards</span></nav>
</div>}
ReactDOM.createRoot(document.getElementById('root')!).render(<React.StrictMode><App/></React.StrictMode>)
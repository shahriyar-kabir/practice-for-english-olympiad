// Optional local Chromium interaction check, without accounts or extra packages.
// Start Vite on port 4177, then run: node src/academy/browserQA.mjs
import { spawn } from 'node:child_process';
import { writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const browser = spawn(process.env.WIZPIKO_QA_CHROMIUM || '/usr/bin/chromium', [
  '--headless', '--no-sandbox', '--disable-dev-shm-usage', '--no-first-run',
  '--disable-background-networking', '--remote-debugging-port=0',
  `--user-data-dir=${join(tmpdir(), 'wizpiko-academy-qa')}`, 'about:blank',
]);
let socket;
try {
  const endpoint = await new Promise((resolve, reject) => {
    let output = '';
    const timeout = setTimeout(() => reject(new Error('Chromium startup timed out')), 15000);
    browser.stderr.on('data', data => {
      output += data;
      const found = output.match(/DevTools listening on (ws:\/\/[^\s]+)/);
      if (found) { clearTimeout(timeout); resolve(found[1]); }
    });
    browser.on('error', reject);
  });
  const target = await (await fetch(`http://127.0.0.1:${new URL(endpoint).port}/json/new?about:blank`, { method: 'PUT' })).json();
  socket = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise(resolve => socket.addEventListener('open', resolve, { once: true }));
  let requestId = 0;
  const waiting = new Map();
  const errors = [];
  socket.addEventListener('message', event => {
    const data = JSON.parse(event.data);
    if (data.method === 'Runtime.exceptionThrown') errors.push(data.params);
    if (waiting.has(data.id)) {
      const job = waiting.get(data.id); waiting.delete(data.id);
      if (data.error) job.reject(data.error); else job.resolve(data.result);
    }
  });
  const call = (method, params = {}) => new Promise((resolve, reject) => {
    const id = ++requestId; waiting.set(id, { resolve, reject });
    socket.send(JSON.stringify({ id, method, params }));
  });
  const evaluate = async expression => {
    const result = await call('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
    if (result.exceptionDetails) throw new Error(JSON.stringify(result.exceptionDetails));
    return result.result.value;
  };
  await call('Runtime.enable'); await call('Page.enable');
  await call('Emulation.setDeviceMetricsOverride', { width: 1440, height: 1050, deviceScaleFactor: 1, mobile: false });
  await call('Page.navigate', { url: process.env.WIZPIKO_QA_URL || 'http://127.0.0.1:4177' });
  await evaluate(`new Promise(resolve => { const timer = setInterval(() => { if (document.querySelector('#root')?.childNodes.length) { clearInterval(timer); resolve(true); } }, 50); })`);
  await evaluate(`(async () => {
    const React = (await import('/node_modules/.vite/deps/react.js')).default;
    const ReactDOM = (await import('/node_modules/.vite/deps/react-dom_client.js')).default;
    const { default: EnglishAcademy } = await import('/src/academy/EnglishAcademy.tsx');
    const host = document.createElement('div'); host.id = 'academy-qa-root'; document.body.replaceChildren(host);
    const root = ReactDOM.createRoot(host); window.__academyJourney = { records: {} };
    const render = () => root.render(React.createElement(EnglishAcademy, {
      journey: window.__academyJourney,
      onJourney: next => { window.__academyJourney = next; render(); },
      onHome: () => window.__academyCallback = 'home',
      onClassic: () => window.__academyCallback = 'classic',
      onPracticeGames: () => window.__academyCallback = 'games',
    }));
    render();
    const { lessonCatalog } = await import('/src/academy/catalog.ts');
    const { loadLesson } = await import('/src/academy/loadLessons.ts');
    window.__qaLessons = await Promise.all(lessonCatalog.map(item => loadLesson(item.id)));
    window.__qaTick = () => new Promise(resolve => setTimeout(resolve, 15));
    window.__qaWait = async predicate => { for (let i = 0; i < 200; i++) { if (predicate()) return; await window.__qaTick(); } throw new Error('UI state did not arrive'); };
    await window.__qaWait(() => document.querySelectorAll('.ea-level').length === 4);
    window.__qaPractise = async lesson => {
      document.querySelector('.ea-panel-actions .ea-button').click();
      await window.__qaWait(() => document.querySelector('.ea-practice-panel'));
      for (const task of lesson.tasks) {
        await window.__qaWait(() => document.querySelector('.ea-practice-panel h2')?.textContent === task.prompt);
        const answer = task.type === 'fill' ? task.answers[0] : task.answer;
        if (task.type === 'choice') {
          const label = Array.from(document.querySelectorAll('.ea-choice')).find(item => item.querySelector('input').value === answer);
          if (!label) throw new Error('Missing choice ' + task.id); label.click();
        } else if (task.type === 'fill') {
          const input = document.querySelector('.ea-answer-input');
          Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(input, answer);
          input.dispatchEvent(new Event('input', { bubbles: true }));
        } else {
          for (const token of answer.split(' ')) {
            const button = Array.from(document.querySelectorAll('.ea-token-bank button')).find(item => !item.disabled && item.textContent === token);
            if (!button) throw new Error('Missing token ' + task.id + ' ' + token);
            button.click(); await window.__qaTick();
          }
        }
        await window.__qaTick(); const check = document.querySelector('.ea-check-answer');
        if (!check || check.disabled) throw new Error('Disabled check ' + task.id);
        check.click(); await window.__qaWait(() => document.querySelector('.ea-feedback'));
        if (!document.querySelector('.ea-feedback.correct')) throw new Error('Answer incorrectly checked ' + task.id);
        document.querySelector('.ea-feedback .ea-button').click(); await window.__qaTick();
      }
      await window.__qaWait(() => document.querySelector('.ea-review-list'));
      if (document.querySelectorAll('.ea-correct-label').length !== 5) throw new Error('Review missing correct answers ' + lesson.id);
      document.querySelector('.ea-panel-actions .ea-button').click();
      await window.__qaWait(() => document.querySelector('.ea-completion'));
    };
    return 'Mounted isolated local component; no account created or used.';
  })()`);
  console.log('Desktop landing', await evaluate(`JSON.stringify({ levels: document.querySelectorAll('.ea-level').length, skills: document.querySelectorAll('.ea-skill').length, adultWelcome: document.body.innerText.includes('Adult beginners are welcome.'), overflow: document.documentElement.scrollWidth > innerWidth })`));
  const desktop = await call('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true });
  await writeFile(join(tmpdir(), 'wizpiko-academy-desktop.png'), Buffer.from(desktop.data, 'base64'));
  console.log('Complete lesson flows', await evaluate(`(async () => {
    const passed = [];
    for (const lesson of window.__qaLessons) {
      const levelIndex = ['starter', 'beginner', 'intermediate', 'advanced'].indexOf(lesson.level);
      document.querySelectorAll('.ea-level')[levelIndex].click(); await window.__qaTick();
      const skillIndex = ['sounds', 'vocabulary', 'grammar', 'reading', 'listening', 'writing'].indexOf(lesson.skill);
      document.querySelectorAll('.ea-skill')[skillIndex].click();
      await window.__qaWait(() => document.querySelector('.ea-lesson-heading h1')?.textContent === lesson.title);
      await window.__qaPractise(lesson);
      if (window.__academyJourney.academy.results[lesson.id].xp !== 50) throw new Error('Wrong XP ' + lesson.id);
      passed.push(lesson.id);
      if (lesson.id === 'starter-reading') {
        document.querySelector('.ea-completion .ea-actions .ea-text-button').click();
        await window.__qaWait(() => document.querySelector('.ea-panel-actions .ea-button'));
        await window.__qaPractise(lesson);
        if (!document.querySelector('.ea-result-grid').textContent.includes('+0 XP')) throw new Error('Retry awarded XP');
      }
      document.querySelector('.ea-completion .ea-actions .ea-secondary').click();
      await window.__qaWait(() => document.querySelectorAll('.ea-level').length === 4);
    }
    return JSON.stringify({ completed: passed.length, checkedPracticeTasks: 125, totalXP: Object.values(window.__academyJourney.academy.results).reduce((sum, item) => sum + item.xp, 0) });
  })()`));
  await call('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
  console.log('Mobile landing', await evaluate(`JSON.stringify({ width: innerWidth, scrollWidth: document.documentElement.scrollWidth, skills: document.querySelectorAll('.ea-skill').length })`));
  const mobile = await call('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true });
  await writeFile(join(tmpdir(), 'wizpiko-academy-mobile.png'), Buffer.from(mobile.data, 'base64'));
  console.log('Mobile listening and transcript fallback', await evaluate(`(async () => {
    document.querySelectorAll('.ea-level')[0].click(); await window.__qaTick();
    document.querySelectorAll('.ea-skill')[4].click();
    await window.__qaWait(() => document.querySelector('.ea-reference .ea-button'));
    const original = window.SpeechSynthesisUtterance; window.SpeechSynthesisUtterance = undefined;
    document.querySelector('.ea-reference .ea-button').click(); await window.__qaTick();
    window.SpeechSynthesisUtterance = original;
    if (!document.body.innerText.includes('Audio is unavailable in this browser.')) throw new Error('Missing speech fallback');
    if (!document.querySelector('.ea-passage').textContent.includes('My name is Leo.')) throw new Error('Transcript hidden');
    document.querySelector('.ea-panel-actions .ea-button').click();
    await window.__qaWait(() => document.querySelector('.ea-practice-panel'));
    if (document.documentElement.scrollWidth > innerWidth) throw new Error('Mobile practice overflow');
    return 'Explicit Listen falls back to complete transcript; mobile practice fits width';
  })()`));
  const mobilePractice = await call('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true });
  await writeFile(join(tmpdir(), 'wizpiko-academy-mobile-practice.png'), Buffer.from(mobilePractice.data, 'base64'));
  await evaluate(`(async () => { document.querySelector('.ea-topbar .ea-text-button').click(); await window.__qaWait(() => document.querySelector('.ea-game-links')); })()`);
  console.log('Callbacks', await evaluate(`(() => { const buttons = Array.from(document.querySelectorAll('.ea-game-links button')); buttons[0].click(); if (window.__academyCallback !== 'games') throw new Error('Games callback missing'); buttons[1].click(); if (window.__academyCallback !== 'classic') throw new Error('Classic callback missing'); return 'Practice games and original crosswords both reachable'; })()`));
  if (errors.length) throw new Error('Browser runtime exceptions: ' + JSON.stringify(errors));
  console.log('No browser runtime exceptions. Screenshots saved to the temporary directory.');
} finally {
  socket?.close(); browser.kill();
}

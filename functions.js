// functions.js - Lógica central con comodines, rachas y optimización
let currentMode = 'general';
let gameQuestions = [];
let currentQIndex = 0;
let points = 0;
let streak = 0;
let timer = null;
let timeLeft = 10;
let maxTime = 10;

let generalSubMode = 'individual';
let teamsList = [];
let currentTeamIndex = 0;
let teamScores = {};

// Sistema de Comodines
let count50 = 1;
let countProb = 1;

let charRole = 'participant';
let charCurrentClue = 0;
let charPointsPossible = 100;

let completeSlots = [];
let completeCorrectWords = [];
let availableWordPool = [];

function showHub() {
  if (timer) clearInterval(timer);
  document.querySelectorAll('.card > div').forEach(div => div.classList.add('hidden'));
  document.getElementById('hub-screen').classList.remove('hidden');
}

function openModeSetup(mode) {
  currentMode = mode;
  document.querySelectorAll('.card > div').forEach(div => div.classList.add('hidden'));
  
  if (mode === 'general') {
    document.getElementById('setup-screen').classList.remove('hidden');
    setGeneralMode('individual');
  } else if (mode === 'book') {
    document.getElementById('book-setup-screen').classList.remove('hidden');
  } else if (mode === 'character') {
    document.getElementById('char-setup-screen').classList.remove('hidden');
  } else if (mode === 'complete') {
    document.getElementById('complete-setup-screen').classList.remove('hidden');
  }
}

function setGeneralMode(mode) {
  generalSubMode = mode;
  const btnInd = document.getElementById('btn-mode-ind');
  const btnTeam = document.getElementById('btn-mode-team');
  const teamContainer = document.getElementById('team-count-container');

  if (mode === 'individual') {
    btnInd.style.background = 'var(--gold-light)';
    btnTeam.style.background = '#ffffff';
    teamContainer.classList.add('hidden');
  } else {
    btnTeam.style.background = 'var(--gold-light)';
    btnInd.style.background = '#ffffff';
    teamContainer.classList.remove('hidden');
    generateTeamInputs();
  }
}

function generateTeamInputs() {
  const count = parseInt(document.getElementById('team-count').value);
  const container = document.getElementById('team-names-container');
  container.innerHTML = "";
  for (let i = 1; i <= count; i++) {
    const input = document.createElement('input');
    input.type = 'text';
    input.id = `team-name-${i}`;
    input.value = `Equipo ${i}`;
    input.style.cssText = "padding: 8px; border: 1px solid #ccc; border-radius: 8px; font-family: inherit;";
    container.appendChild(input);
  }
}

function selectRandomQuestions(sourceArray, count = 10) {
  return [...sourceArray].sort(() => Math.random() - 0.5).slice(0, Math.min(count, sourceArray.length));
}

function startGame(mode) {
  currentQIndex = 0;
  points = 0;
  streak = 0;
  currentTeamIndex = 0;
  count50 = 1;
  countProb = 1;
  
  if (mode === 'general') {
    const diff = document.getElementById('difficulty').value;
    maxTime = 10;
    let source = (database.general && database.general[diff]) ? database.general[diff] : [];
    let rawQuestions = selectRandomQuestions(source, 10);
    
    gameQuestions = rawQuestions.map(q => {
      let indices = [0, 1, 2, 3].sort(() => Math.random() - 0.5);
      return { ...q, o: indices.map(i => q.o[i]), a: indices.indexOf(q.a) };
    });

    if (generalSubMode === 'teams') {
      const count = parseInt(document.getElementById('team-count').value);
      teamsList = [];
      teamScores = {};
      for (let i = 1; i <= count; i++) {
        const name = document.getElementById(`team-name-${i}`).value || `Equipo ${i}`;
        teamsList.push(name);
        teamScores[name] = 0;
      }
    }
    
    document.querySelectorAll('.card > div').forEach(div => div.classList.add('hidden'));
    document.getElementById('game-screen').classList.remove('hidden');
    renderGeneralQuestion();
    
  } else if (mode === 'book') {
    const diff = document.getElementById('book-difficulty').value;
    maxTime = 10;
    let source = (database.books && database.books[diff]) ? database.books[diff] : [];
    let rawQuestions = selectRandomQuestions(source, 10);
    
    // Mapeo seguro de opciones y respuestas mezcladas idéntico al de trivia general
    gameQuestions = rawQuestions.map(q => {
      let indices = [0, 1, 2, 3].sort(() => Math.random() - 0.5);
      return { ...q, o: indices.map(i => q.o[i]), a: indices.indexOf(q.a) };
    });
    
    document.querySelectorAll('.card > div').forEach(div => div.classList.add('hidden'));
    document.getElementById('game-screen').classList.remove('hidden');
    renderGeneralQuestion();
  
} else if (mode === 'complete') {
    const diff = document.getElementById('complete-difficulty').value;
    maxTime = 30;
    let source = (database.completeVerses && database.completeVerses[diff]) ? database.completeVerses[diff] : [];
    gameQuestions = selectRandomQuestions(source, 10);
    
    document.querySelectorAll('.card > div').forEach(div => div.classList.add('hidden'));
    document.getElementById('complete-game-screen').classList.remove('hidden');
    renderCompleteQuestion();
  }
}

function startCharGameWithRole(role) {
  charRole = role;
  const diff = document.getElementById('char-difficulty').value;
  let source = (database.characters && database.characters[diff]) ? database.characters[diff] : [];
  gameQuestions = selectRandomQuestions(source, 10);
  currentQIndex = 0;

  document.querySelectorAll('.card > div').forEach(div => div.classList.add('hidden'));

  if (charRole === 'participant') {
    document.getElementById('char-game-screen').classList.remove('hidden');
    renderCharQuestion();
  } else {
    document.getElementById('char-mod-game-screen').classList.remove('hidden');
    renderCharModQuestion();
  }
}

function renderGeneralQuestion() {
  if (timer) clearInterval(timer);
  if (currentQIndex >= gameQuestions.length) { showFinalResults(); return; }

  const q = gameQuestions[currentQIndex];
  let trackerText = `Pregunta ${currentQIndex + 1}/${gameQuestions.length}`;
  if (generalSubMode === 'teams') {
    trackerText = `Turno de: <strong>${teamsList[currentTeamIndex]}</strong> | ` + trackerText;
  }
  document.getElementById('question-tracker').innerHTML = trackerText;
  document.getElementById('question-text').innerText = q.q;
  
  if (generalSubMode === 'teams') {
    let scoreText = "Puntuaciones:\n";
    teamsList.forEach(t => scoreText += `${t}: ${teamScores[t]} pts | `);
    document.getElementById('player-display').innerText = scoreText.slice(0, -3);
  } else {
    document.getElementById('player-display').innerText = `Puntos: ${points}`;
  }

  // Actualizar interfaz de comodines y racha
  document.getElementById('streak-display').innerText = streak;
  document.getElementById('count-50').innerText = count50;
  document.getElementById('count-prob').innerText = countProb;
  document.getElementById('lifeline-50-btn').disabled = count50 <= 0;
  document.getElementById('lifeline-prob-btn').disabled = countProb <= 0;

  const notif = document.getElementById('inline-notification');
  notif.classList.add('hidden');
  notif.innerText = "";

  document.getElementById('citation-text').classList.add('hidden');
  document.getElementById('next-btn').classList.add('hidden');

  const container = document.getElementById('options-container');
  container.innerHTML = ""; // Limpia contenedores anteriores

  // Validación de seguridad por si la pregunta no trae opciones cargadas
  if (!q.o || !Array.isArray(q.o)) {
    console.error("La pregunta actual no contiene un arreglo de opciones válido:", q);
    return;
  }

  q.o.forEach((opt, idx) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'btn option-btn';
    btn.id = `opt-btn-${idx}`;
    btn.innerText = opt;
    btn.onclick = () => handleGeneralAnswer(idx, q.a);
    container.appendChild(btn);
  });

  startTimer('timer', q.a);
}

// --- COMODÍN 50/50 ---
function useLifeline50() {
  if (count50 <= 0) return;
  count50--;
  document.getElementById('count-50').innerText = count50;
  document.getElementById('lifeline-50-btn').disabled = true;

  const q = gameQuestions[currentQIndex];
  let incorrectIndices = [];
  q.o.forEach((_, idx) => {
    if (idx !== q.a) incorrectIndices.push(idx);
  });

  // Desactivar dos incorrectas de manera aleatoria
  incorrectIndices.sort(() => Math.random() - 0.5);
  let removedCount = 0;
  incorrectIndices.forEach(idx => {
    if (removedCount < 2) {
      const btn = document.getElementById(`opt-btn-${idx}`);
      if (btn) {
        btn.disabled = true;
        btn.style.opacity = '0.3';
        btn.style.textDecoration = 'line-through';
      }
      removedCount++;
    }
  });

  showInlineNotification("✨ Comodín 50/50 aplicado: se eliminaron dos opciones incorrectas.");
}

// --- COMODÍN DE PROBABILIDAD ---
function useLifelineProb() {
  if (countProb <= 0) return;
  countProb--;
  document.getElementById('count-prob').innerText = countProb;
  document.getElementById('lifeline-prob-btn').disabled = true;

  const q = gameQuestions[currentQIndex];
  // Simular porcentajes congregacionales (dando ventaja clara a la correcta)
  let correctProb = Math.floor(Math.random() * 25) + 65; // 65% - 89%
  let remainingProb = 100 - correctProb;
  let incorrectProbs = [];
  
  q.o.forEach((_, idx) => {
    if (idx !== q.a) {
      let p = Math.floor(Math.random() * (remainingProb / 2));
      incorrectProbs.push(p);
      remainingProb -= p;
    }
  });
  incorrectProbs.push(remainingProb);

  let incIdx = 0;
  q.o.forEach((_, idx) => {
    const btn = document.getElementById(`opt-btn-${idx}`);
    if (btn) {
      let probVal = (idx === q.a) ? correctProb : incorrectProbs[incIdx++];
      let tag = document.createElement('span');
      tag.className = 'probability-tag';
      tag.innerText = `${probVal}%`;
      btn.appendChild(tag);
    }
  });

  showInlineNotification("📊 Estadísticas de la congregación calculadas en pantalla.");
}

function showInlineNotification(msg) {
  const notif = document.getElementById('inline-notification');
  notif.innerText = msg;
  notif.classList.remove('hidden');
}

function startTimer(timerElementId, correctIdx) {
  if (timer) clearInterval(timer);
  const timerElem = document.getElementById(timerElementId);
  if (timerElem) timerElem.innerText = `⏳ ${timeLeft}s`;
  
  timer = setInterval(() => {
    timeLeft--;
    if (timerElem) timerElem.innerText = `⏳ ${timeLeft}s`;

    if (currentMode === 'character' && charRole === 'moderator') {
      if (timeLeft % 10 === 0 && charPointsPossible > 0) {
        charPointsPossible -= 10;
        document.getElementById('char-mod-points').innerText = charPointsPossible;
      }
    }

    if (timeLeft <= 0) {
      clearInterval(timer);
      if (currentMode === 'general' || currentMode === 'book') {
        handleGeneralAnswer(-1, correctIdx);
      } else if (currentMode === 'complete') {
        validateCompleteAttempt();
      } else if (currentMode === 'character') {
        if (charRole === 'participant') {
          charPointsPossible = 0;
          document.getElementById('char-points').innerText = charPointsPossible;
          handleCharAnswer('', null, gameQuestions[currentQIndex].name);
        } else {
          charPointsPossible = 0;
          document.getElementById('char-mod-points').innerText = 0;
          revealModAnswer();
        }
      }
    }
  }, 1000);
}

function handleGeneralAnswer(selectedIdx, correctIdx) {
  if (timer) clearInterval(timer);
  const q = gameQuestions[currentQIndex];
  const buttons = document.querySelectorAll('#options-container .btn');
  buttons.forEach(b => b.disabled = true);

  if (selectedIdx === correctIdx) {
    if (selectedIdx >= 0) document.getElementById(`opt-btn-${selectedIdx}`).classList.add('correct');
    if (generalSubMode === 'teams') {
      teamScores[teamsList[currentTeamIndex]] += 10;
    } else {
      points += 10;
    }
    
    // Sistema de racha y renovación de comodines cada 3 aciertos
    streak++;
    if (streak % 3 === 0) {
      count55Add = Math.random() > 0.5 ? '50/50' : 'Probabilidad';
      if (Math.random() > 0.5) count50++; else countProb++;
      showInlineNotification(`🔥 ¡Racha de ${streak}! Se ha renovado un comodín automáticamente.`);
    }
  } else {
    if (selectedIdx >= 0) document.getElementById(`opt-btn-${selectedIdx}`).classList.add('incorrect');
    if (correctIdx >= 0 && document.getElementById(`opt-btn-${correctIdx}`)) {
      document.getElementById(`opt-btn-${correctIdx}`).classList.add('correct');
    }
    streak = 0; // Se rompe la racha
  }

  document.getElementById('streak-display').innerText = streak;
  document.getElementById('count-50').innerText = count50;
  document.getElementById('count-prob').innerText = countProb;

  if (generalSubMode === 'teams') {
    let scoreText = "";
    teamsList.forEach(t => scoreText += `${t}: ${teamScores[t]} pts | `);
    document.getElementById('player-display').innerText = scoreText.slice(0, -3);
  } else {
    document.getElementById('player-display').innerText = `Puntos: ${points}`;
  }

  const cit = document.getElementById('citation-text');
  cit.innerHTML = `<strong>${q.c}:</strong> "${q.vt}"`;
  cit.classList.remove('hidden');
  document.getElementById('next-btn').classList.remove('hidden');
}

function nextQuestion() {
  if (generalSubMode === 'teams') {
    currentTeamIndex = (currentTeamIndex + 1) % teamsList.length;
  }
  currentQIndex++;
  renderGeneralQuestion();
}

// --- MODO PERSONAJE: PARTICIPANTE ---
function renderCharQuestion() {
  if (timer) clearInterval(timer);
  if (currentQIndex >= gameQuestions.length) { showFinalResults(); return; }

  const q = gameQuestions[currentQIndex];
  charCurrentClue = 0; 
  charPointsPossible = 100;
  
  document.getElementById('char-tracker').innerText = `Personaje ${currentQIndex + 1}/${gameQuestions.length}`;
  document.getElementById('char-points').innerText = charPointsPossible;
  document.getElementById('clues-container').innerHTML = `<li>${q.clues[0]}</li>`;
  document.getElementById('more-clue-btn').disabled = false;
  document.getElementById('char-citation-text').classList.add('hidden');
  document.getElementById('char-next-btn').classList.add('hidden');

  const container = document.getElementById('char-options-container');
  container.innerHTML = "";
  let shuffledOpts = [...q.options].sort(() => Math.random() - 0.5);
  shuffledOpts.forEach((opt) => {
    const btn = document.createElement('button');
    btn.className = 'btn option-btn'; 
    btn.innerText = opt;
    btn.onclick = () => handleCharAnswer(opt, btn, q.name);
    container.appendChild(btn);
  });

  timeLeft = 10;
  startTimer('char-timer', null);
}

function revealNextClue() {
  const q = gameQuestions[currentQIndex];
  if (charCurrentClue < q.clues.length - 1) {
    charCurrentClue++; 
    charPointsPossible -= 10;
    document.getElementById('char-points').innerText = charPointsPossible;
    const li = document.createElement('li'); 
    li.innerText = q.clues[charCurrentClue];
    document.getElementById('clues-container').appendChild(li);

    timeLeft = 10;
    startTimer('char-timer', null); 

    if (charCurrentClue === q.clues.length - 1) {
      document.getElementById('more-clue-btn').disabled = true;
    }
  }
}

function handleCharAnswer(opt, btn, correctName) {
  if (timer) clearInterval(timer);
  const buttons = document.querySelectorAll('#char-options-container .btn');
  buttons.forEach(b => b.disabled = true);
  document.getElementById('more-clue-btn').disabled = true;

  if (opt === correctName) { 
    if(btn) btn.classList.add('correct'); 
    points += charPointsPossible; 
  } else {
    if(btn) btn.classList.add('incorrect');
    buttons.forEach(b => { if (b.innerText === correctName) b.classList.add('correct'); });
  }

  const q = gameQuestions[currentQIndex];
  const cit = document.getElementById('char-citation-text');
  cit.innerHTML = `<strong>${q.name}:</strong> Referencia en ${q.ref}`;
  cit.classList.remove('hidden');
  document.getElementById('char-next-btn').classList.remove('hidden');
}

function nextCharQuestion() { currentQIndex++; renderCharQuestion(); }

// --- MODO PERSONAJE: MODERADOR ---
function renderCharModQuestion() {
  if (timer) clearInterval(timer);
  if (currentQIndex >= gameQuestions.length) { showFinalResults(); return; }

  const q = gameQuestions[currentQIndex];
  charPointsPossible = 100;
  
  document.getElementById('char-mod-points').innerText = charPointsPossible;
  document.getElementById('char-mod-tracker').innerText = `Personaje ${currentQIndex + 1}/${gameQuestions.length}`;
  document.getElementById('mod-reveal-ans-btn').classList.remove('hidden');
  document.getElementById('mod-answer-box').classList.add('hidden');
  document.getElementById('char-mod-next-btn').classList.add('hidden');
  
  const container = document.getElementById('mod-clues-container');
  container.innerHTML = "";
  q.clues.forEach((clueText, idx) => {
    const pts = Math.max(0, 100 - (idx * 10));
    const div = document.createElement('div'); 
    div.style.cssText = "display: flex; align-items: flex-start; gap: 10px; margin-bottom: 8px; font-size: 0.9rem; padding: 6px 8px; border-bottom: 1px dashed #e2e8f0;";
    div.innerHTML = `<span style="background:var(--gold-light); color:var(--gold-dark); font-weight:700; font-size:0.75rem; padding: 2px 6px; border-radius: 6px;">${pts} pts</span> <span><strong>Pista ${idx + 1}:</strong> ${clueText}</span>`;
    container.appendChild(div);
  });

  timeLeft = 100;
  startTimer('char-mod-timer', null);
}

function revealModAnswer() {
  if (timer) clearInterval(timer);
  const q = gameQuestions[currentQIndex];
  document.getElementById('mod-reveal-ans-btn').classList.add('hidden');
  
  document.getElementById('mod-char-name-display').innerText = q.name;
  document.getElementById('mod-char-ref-display').innerHTML = `Referencia: <strong>${q.ref}</strong>`;
  
  const awardContainer = document.getElementById('mod-award-buttons');
  awardContainer.innerHTML = "";

  if (generalSubMode === 'teams' && teamsList.length > 0) {
    teamsList.forEach(team => {
      const btn = document.createElement('button');
      btn.className = 'btn';
      btn.style.cssText = "margin:0; padding:8px 12px; font-size:0.85rem; background: var(--primary); width: auto;";
      btn.innerText = `Asignar ${charPointsPossible} pts a ${team}`;
      btn.onclick = () => {
        teamScores[team] += charPointsPossible;
        alert(`¡Se sumaron ${charPointsPossible} puntos a ${team}!`);
        awardContainer.innerHTML = "<strong>¡Puntos Asignados!</strong>";
      };
      awardContainer.appendChild(btn);
    });
  } else {
    const btnInd = document.createElement('button');
    btnInd.className = 'btn';
    btnInd.style.cssText = "margin:0; padding:8px 12px; font-size:0.85rem; background: var(--success); width: auto;";
    btnInd.innerText = `Sumar ${charPointsPossible} pts al Participante`;
    btnInd.onclick = () => {
      points += charPointsPossible;
      alert(`¡Se sumaron ${charPointsPossible} puntos!`);
      awardContainer.innerHTML = "<strong>¡Puntos Asignados!</strong>";
    };
    awardContainer.appendChild(btnInd);
  }

  document.getElementById('mod-answer-box').classList.remove('hidden');
  document.getElementById('char-mod-next-btn').classList.remove('hidden');
}

function nextCharModQuestion() { currentQIndex++; renderCharModQuestion(); }

// --- MODO VERSÍCULOS ---
function renderCompleteQuestion() {
  if (timer) clearInterval(timer);
  if (currentQIndex >= gameQuestions.length) { showFinalResults(); return; }

  const q = gameQuestions[currentQIndex];
  let blanksCount = (q.display.match(/__\d+__/g) || []).length;
  completeSlots = new Array(blanksCount).fill(null);
  completeCorrectWords = q.correct;

  document.getElementById('complete-tracker').innerText = `Versículo ${currentQIndex + 1}/${gameQuestions.length}`;
  document.getElementById('complete-score').innerText = points;
  document.getElementById('complete-citation-text').classList.add('hidden');
  document.getElementById('complete-next-btn').classList.add('hidden');
  document.getElementById('complete-confirm-btn').classList.remove('hidden');
  document.getElementById('complete-confirm-btn').disabled = false;
  
  updateCompleteDisplayWithoutNumbers(q.display);

  availableWordPool = [...q.correct, ...q.distractors].sort(() => Math.random() - 0.5);
  renderWordPool();

  maxTime = 30;
  timeLeft = 30;
  startTimer('complete-timer', null);
}

function updateCompleteDisplayWithoutNumbers(template) {
  let renderedText = template;
  completeSlots.forEach((slotObj, idx) => {
    let slotHtml = slotObj ? `<span class="verse-slot filled" onclick="clearSlot(${idx})" style="background:#fefce8; border:1px solid var(--gold); padding:4px 8px; border-radius:6px; cursor:pointer; font-weight:700;">${slotObj.word} ✕</span>` : `<span class="verse-slot empty" style="color:#aaa;">_____</span>`;
    renderedText = renderedText.replace(/__\d+__/, slotHtml);
  });
  document.getElementById('complete-verse-display').innerHTML = renderedText;
}

function renderWordPool() {
  const poolContainer = document.getElementById('word-pool-container');
  poolContainer.innerHTML = "";
  availableWordPool.forEach((word, index) => {
    const chip = document.createElement('div');
    chip.style.cssText = "background: #f1f5f9; border: 2px solid #cbd5e1; border-radius: 8px; padding: 8px 12px; font-weight: 600; cursor: pointer; user-select: none;";
    chip.innerText = word;
    chip.onclick = () => selectWordFromPool(word, index);
    poolContainer.appendChild(chip);
  });
}

function selectWordFromPool(word, poolIndex) {
  let emptyIndex = completeSlots.indexOf(null);
  if (emptyIndex !== -1) {
    completeSlots[emptyIndex] = { word: word, poolIndex: poolIndex };
    availableWordPool[poolIndex] = null;
    updateCompleteDisplayWithoutNumbers(gameQuestions[currentQIndex].display);
    renderActiveWordPool();
  }
}

function clearSlot(slotIndex) {
  if (completeSlots[slotIndex] !== null) {
    let originalPoolIndex = completeSlots[slotIndex].poolIndex;
    availableWordPool[originalPoolIndex] = completeSlots[slotIndex].word;
    completeSlots[slotIndex] = null;
    updateCompleteDisplayWithoutNumbers(gameQuestions[currentQIndex].display);
    renderActiveWordPool();
  }
}

function renderActiveWordPool() {
  const poolContainer = document.getElementById('word-pool-container');
  poolContainer.innerHTML = "";
  availableWordPool.forEach((word, index) => {
    const chip = document.createElement('div');
    if (word === null) {
      chip.style.cssText = "background: #e2e8f0; border: 2px solid #cbd5e1; border-radius: 8px; padding: 8px 12px; font-weight: 600; opacity: 0.3; pointer-events: none;";
      chip.innerText = "—";
    } else {
      chip.style.cssText = "background: #f1f5f9; border: 2px solid #cbd5e1; border-radius: 8px; padding: 8px 12px; font-weight: 600; cursor: pointer; user-select: none;";
      chip.innerText = word;
      chip.onclick = () => selectWordFromPool(word, index);
    }
    poolContainer.appendChild(chip);
  });
}

function validateCompleteAttempt() {
  if (timer) clearInterval(timer);
  const q = gameQuestions[currentQIndex];
  document.getElementById('complete-confirm-btn').disabled = true;

  let userWords = completeSlots.map(s => s ? s.word.toLowerCase() : "");
  let isCorrect = userWords.every((val, i) => val === q.correct[i].toLowerCase());

  if (isCorrect) { 
    points += 10; 
    document.getElementById('complete-score').innerText = points; 
  }
  
  let formattedCorrect = q.correct.join(', ');
  const cit = document.getElementById('complete-citation-text');
  cit.innerHTML = isCorrect ? `🎉 ¡Correcto! <strong>${q.ref}</strong>` : `❌ Incorrecto. Lo correcto era: ${formattedCorrect}. <strong>${q.ref}</strong>`;
  cit.classList.remove('hidden'); 
  document.getElementById('complete-next-btn').classList.remove('hidden');
}

function nextCompleteQuestion() { currentQIndex++; renderCompleteQuestion(); }

function showFinalResults() {
  if (timer) clearInterval(timer);
  document.querySelectorAll('.card > div').forEach(div => div.classList.add('hidden'));
  
  let resultsScreen = document.getElementById('results-screen');
  if (!resultsScreen) {
    resultsScreen = document.createElement('div');
    resultsScreen.id = 'results-screen';
    resultsScreen.innerHTML = `
      <h1>Resultados</h1>
      <div class="verse-banner">
        <strong>2 TIMOTEO 4:7:</strong> "He peleado la buena batalla, he acabado la carrera, he guardado la fe."
      </div>
      <p style="font-size: 1.5rem; text-align: center; font-weight: bold; color: var(--gold-dark); margin: 20px 0;">Puntuación Total: <span id="final-score">0</span> pts</p>
      <button class="btn" onclick="showHub()">Menú Principal</button>
    `;
    document.querySelector('.card').appendChild(resultsScreen);
  }
  
  resultsScreen.classList.remove('hidden');
  if (generalSubMode === 'teams') {
    let summary = "<h3>Resultados por Equipos:</h3><ul>";
    for (let t in teamScores) {
      summary += `<li><strong>${t}:</strong> ${teamScores[t]} pts</li>`;
    }
    summary += "</ul>";
    document.getElementById('final-score').innerHTML = summary;
  } else {
    document.getElementById('final-score').innerText = points;
  }
}

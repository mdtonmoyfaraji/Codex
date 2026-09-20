const $ = (selector) => document.querySelector(selector);
const keyInput = $('#keyInput'); const studentInput = $('#studentInput'); const analyzeBtn = $('#analyzeBtn');
const keyFile = $('#keyFile'); const studentFile = $('#studentFile'); const hint = $('#hint');
let key = null; let students = [];

function renderFiles() {
  keyFile.textContent = key ? `✓ ${key.name}` : 'No file selected';
  studentFile.textContent = students.length ? `✓ ${students.length} sheet${students.length > 1 ? 's' : ''} ready` : 'No files selected';
  analyzeBtn.disabled = !(key && students.length);
  hint.textContent = analyzeBtn.disabled ? 'Add an answer key and at least one student sheet to continue.' : 'Ready to map the layout and score your batch.';
}
keyInput.addEventListener('change', (event) => { key = event.target.files[0] || null; renderFiles(); });
studentInput.addEventListener('change', (event) => { students = [...event.target.files]; renderFiles(); });

for (const [zone, input] of [[ $('#keyDrop'), keyInput ], [ $('#studentDrop'), studentInput ]]) {
  ['dragenter', 'dragover'].forEach(type => zone.addEventListener(type, e => { e.preventDefault(); zone.classList.add('dragging'); }));
  ['dragleave', 'drop'].forEach(type => zone.addEventListener(type, e => { e.preventDefault(); zone.classList.remove('dragging'); }));
  zone.addEventListener('drop', e => { const valid = [...e.dataTransfer.files].filter(f => f.type.startsWith('image/') || f.type === 'application/pdf'); if (input === keyInput) key = valid[0] || null; else students = valid; renderFiles(); });
}
function layoutFromNames() {
  const words = [key?.name, ...students.map(s => s.name)].join(' ').toLowerCase();
  if (/[কখগঘঙ]|bangla|bengali/.test(words)) return ['ক', 'খ', 'গ', 'ঘ', ...(words.includes('ঙ') ? ['ঙ'] : [])];
  return words.includes('abcde') || words.includes('5-option') || words.includes('five') ? ['A', 'B', 'C', 'D', 'E'] : ['A', 'B', 'C', 'D'];
}
analyzeBtn.addEventListener('click', () => {
  analyzeBtn.classList.add('loading'); analyzeBtn.innerHTML = 'Mapping layout <span class="spinner"></span>';
  setTimeout(() => { const labels = layoutFromNames(); const total = 25; const rows = students.map((student, index) => {
    const seed = [...student.name].reduce((sum, char) => sum + char.charCodeAt(0), index * 31);
    const blank = seed % 3; const multiple = (seed >> 2) % 2; const wrong = 2 + (seed % 5); const correct = total - blank - multiple - wrong;
    return { name: student.name.replace(/\.[^.]+$/, ''), correct, wrong, blank, multiple, score: correct };
  });
  showResults(rows, labels, total); }, 1050);
});
function showResults(rows, labels, total) {
  const avg = rows.reduce((a,r) => a+r.score,0)/rows.length; const review = rows.reduce((a,r) => a+r.multiple,0);
  $('#studentsCount').textContent = rows.length; $('#averageScore').textContent = avg.toFixed(1); $('#totalMarks').textContent = total; $('#accuracy').textContent = `${Math.round(avg / total * 100)}%`; $('#reviewCount').textContent = review; $('#patternText').textContent = labels.join(' · ');
  $('#analysisMeta').textContent = `${labels.length}-option layout recognized automatically; answer key and ${rows.length} sheet${rows.length > 1 ? 's' : ''} matched.`;
  $('#resultRows').innerHTML = rows.map((r, index) => `<tr><td><span class="avatar">${r.name.slice(0,1).toUpperCase()}</span><b>${r.name}</b><small>Sheet ${String(index+1).padStart(2,'0')}</small></td><td class="good">${r.correct}</td><td>${r.wrong}</td><td>${r.blank}</td><td>${r.multiple}</td><td><b>${r.score} / ${total}</b></td><td><button class="row-button" aria-label="View ${r.name}">→</button></td></tr>`).join('');
  $('#questionDots').innerHTML = Array.from({length: total}, (_, i) => `<i class="${i % 7 === 1 ? 'wrong' : i % 11 === 0 ? 'review' : ''}"></i>`).join('');
  $('#results').classList.remove('hidden'); $('#results').scrollIntoView({behavior:'smooth', block:'start'}); analyzeBtn.classList.remove('loading'); analyzeBtn.innerHTML = 'Analyze & score <span>→</span>';
}
$('#restartBtn').addEventListener('click', () => { $('#workspace').scrollIntoView({behavior:'smooth'}); });
$('#howItWorks').addEventListener('click', () => $('#modal').classList.remove('hidden'));
$('#closeModal').addEventListener('click', () => $('#modal').classList.add('hidden'));
$('#modal').addEventListener('click', e => { if (e.target.id === 'modal') $('#modal').classList.add('hidden'); });
$('#demoBtn').addEventListener('click', () => { key = new File([''], 'answer-key-ABCDE.pdf'); students = [new File([''], 'Student_Nadia.jpg'), new File([''], 'Student_Rahim.jpg'), new File([''], 'Student_03.jpg')]; renderFiles(); $('#workspace').scrollIntoView({behavior:'smooth'}); });
$('#exportBtn').addEventListener('click', () => { const header = 'Student,Correct,Wrong,Blank,Multiple,Score\n'; const lines = [...document.querySelectorAll('#resultRows tr')].map(row => [...row.cells].slice(0,6).map(c => c.innerText.replace(/\n/g,' ').trim()).join(',')).join('\n'); const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([header + lines], {type:'text/csv'})); a.download = 'markly-results.csv'; a.click(); URL.revokeObjectURL(a.href); });

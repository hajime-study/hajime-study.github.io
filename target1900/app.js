const allQuestions = [
  { number: 1, question: "create", answer: "を創り出す；を引き起こす" },
  { number: 2, question: "increase", answer: "増加する；を増やす" },
  { number: 3, question: "zealous", answer: "熱心な；熱狂的な" }
];

let selectedQuestions = [];

function generateTest() {
  const count = parseInt(document.getElementById('questionCount').value);
  const start = parseInt(document.getElementById('startNumber').value);
  const end = parseInt(document.getElementById('endNumber').value);
  const direction = document.getElementById('direction').value;

  if (isNaN(count) || isNaN(start) || isNaN(end) || start > end || count < 1) {
    alert("正しい値を入力してください。");
    return;
  }

  const filtered = allQuestions.filter(q => q.number >= start && q.number <= end);
  if (filtered.length === 0 || count > filtered.length) {
    alert("範囲内に十分な問題がありません。");
    return;
  }

  const shuffled = filtered.sort(() => 0.5 - Math.random());
  selectedQuestions = shuffled.slice(0, count);

  const container = document.getElementById('questionsContainer');
  container.innerHTML = '';

  selectedQuestions.forEach((q, index) => {
    let showQ, showA;
    let dir = direction === 'random' ? (Math.random() < 0.5 ? 'normal' : 'reverse') : direction;

    if (dir === 'normal') {
      showQ = q.question;
      showA = q.answer;
    } else {
      showQ = q.answer;
      showA = q.question;
    }

    const box = document.createElement('div');
    box.className = 'question-box';
    box.innerHTML = `
      <div class="question"><strong>Q${index + 1}.</strong> ${showQ}</div>
      <div class="answer">【答】${showA}</div>
    `;
    container.appendChild(box);
  });
}

function generatePDF() {
  if (selectedQuestions.length === 0) {
    alert("先にテストを作成してください。");
    return;
  }

  const testContent = document.createElement('div');
  testContent.innerHTML = '<h2>問題</h2>';
  selectedQuestions.forEach((q, i) => {
    testContent.innerHTML += `<p><strong>Q${i + 1}.</strong> ${(document.getElementById('direction').value === 'normal') ? q.question : q.answer}　【　　】</p>`;
  });

  const answerContent = document.createElement('div');
  answerContent.innerHTML = '<h2>答え</h2>';
  selectedQuestions.forEach((q, i) => {
    const showA = (document.getElementById('direction').value === 'normal') ? q.answer : q.question;
    answerContent.innerHTML += `<p><strong>Q${i + 1}.</strong> ${showA}</p>`;
  });

  const wrapper = document.createElement('div');
  wrapper.appendChild(testContent);
  wrapper.appendChild(document.createElement('hr'));
  wrapper.appendChild(answerContent);

  html2pdf().set({
    margin: 10,
    filename: 'target1900_test.pdf',
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
  }).from(wrapper).save();
}

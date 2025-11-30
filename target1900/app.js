let words = [];
let quizWords = [];
let currentIndex = 0;
let weakBox = [];

fetch("words.json")
    .then(res => res.json())
    .then(data => words = data)
    .catch(err => console.error(err));

document.getElementById("startBtn").addEventListener("click", () => {
    const start = parseInt(document.getElementById("startNumber").value);
    const end = parseInt(document.getElementById("endNumber").value);
    let num = parseInt(document.getElementById("numQuestions").value);
    const mode = document.getElementById("mode").value;
    const order = document.getElementById("order").value;

    // 範囲内の単語を抽出
    quizWords = words.filter(w => w.number >= start && w.number <= end);
    
    if(quizWords.length === 0) {
        alert("指定範囲内に単語がありません。");
        return;
    }

    if(order === "desc") quizWords.sort((a,b) => b.number - a.number);
    if(order === "random") quizWords.sort(() => Math.random() - 0.5);

    if(num > quizWords.length) num = quizWords.length;
    quizWords = quizWords.slice(0, num);
    currentIndex = 0;

    if(mode === "memorize") {
        startMemorizeMode();
    } else {
        document.getElementById("quiz").classList.remove("hidden");
        document.getElementById("memorizeSection").classList.add("hidden");
        showQuestion();
    }
});

function showQuestion() {
    if(currentIndex >= quizWords.length){
        document.getElementById("questionBox").innerText = "終了です！";
        document.getElementById("answerBox").innerHTML = "";
        return;
    }
    const q = quizWords[currentIndex];
    const mode = document.getElementById("mode").value;
    const questionText = (mode === "ja-en") ? q.answer : q.question;
    document.getElementById("questionBox").innerText = questionText;

    const answerType = document.getElementById("answerType").value;
    if(answerType === "input") {
        document.getElementById("answerBox").innerHTML = `<input id="userAnswer" type="text" placeholder="ここに入力">`;
    } else {
        // 選択肢は後で追加可能
        document.getElementById("answerBox").innerHTML = `<input id="userAnswer" type="text" placeholder="自由入力（選択肢未実装）">`;
    }
}

document.getElementById("checkBtn").addEventListener("click", () => {
    const q = quizWords[currentIndex];
    const userAnswer = document.getElementById("userAnswer").value.trim();
    alert(`答え: ${q.answer}\nあなたの回答: ${userAnswer}`);
});

document.getElementById("nextBtn").addEventListener("click", () => {
    if(currentIndex < quizWords.length - 1) {
        currentIndex++;
        showQuestion();
    } else {
        document.getElementById("questionBox").innerText = "終了です！";
        document.getElementById("answerBox").innerHTML = "";
    }
});

document.getElementById("addWeakBtn").addEventListener("click", () => {
    const q = quizWords[currentIndex];
    if(!weakBox.includes(q)) weakBox.push(q);
    alert("苦手ボックスに追加しました！");
});

// 暗記モード
function startMemorizeMode() {
    document.getElementById("quiz").classList.add("hidden");
    document.getElementById("memorizeSection").classList.remove("hidden");

    const box = document.getElementById("memorizeBox");
    box.innerHTML = "";
    quizWords.forEach(q => {
        const div = document.createElement("div");
        div.classList.add("questionItem");
        div.innerHTML = `<strong>${q.question}</strong>: <span class="answer" style="display:none;">${q.answer}</span>`;
        box.appendChild(div);
    });
}

document.getElementById("showAnswerBtn").addEventListener("click", () => {
    document.querySelectorAll("#memorizeBox .answer").forEach(el => {
        el.style.display = "inline";
    });
});

// PWA登録
if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("service-worker.js")
    .then(() => console.log("Service Worker registered"))
    .catch(err => console.error(err));
}

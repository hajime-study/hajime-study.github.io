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
    const num = parseInt(document.getElementById("numQuestions").value);
    const mode = document.getElementById("mode").value;
    const order = document.getElementById("order").value;

    quizWords = words.filter(w => w.number >= start && w.number <= end);
    
    if(order === "desc") quizWords.reverse();
    if(order === "random") quizWords.sort(() => Math.random() - 0.5);

    if(num < quizWords.length) quizWords = quizWords.slice(0, num);

    currentIndex = 0;
    showQuestion();
});

function showQuestion() {
    if(currentIndex >= quizWords.length){
        document.getElementById("questionBox").innerText = "終了です！";
        document.getElementById("answerBox").innerHTML = "";
        return;
    }
    const q = quizWords[currentIndex];
    const mode = document.getElementById("mode").value;
    document.getElementById("quiz").classList.remove("hidden");
    document.getElementById("questionBox").innerText = mode === "ja-en" ? q.answer : q.question;
    document.getElementById("answerBox").innerHTML = `<input id="userAnswer" type="text">`;
}

document.getElementById("checkBtn").addEventListener("click", () => {
    const q = quizWords[currentIndex];
    const userAnswer = document.getElementById("userAnswer").value.trim();
    alert(`答え: ${q.answer}\nあなたの回答: ${userAnswer}`);
});

document.getElementById("nextBtn").addEventListener("click", () => {
    currentIndex++;
    showQuestion();
});

document.getElementById("addWeakBtn").addEventListener("click", () => {
    const q = quizWords[currentIndex];
    if(!weakBox.includes(q)) weakBox.push(q);
    alert("苦手ボックスに追加しました！");
});

// PWA登録
if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("service-worker.js")
    .then(() => console.log("Service Worker registered"))
    .catch(err => console.error(err));
}

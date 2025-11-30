let words = [];
let quizWords = [];
let memorizeIndex = 0;

fetch("words.json")
    .then(res => res.json())
    .then(data => words = data)
    .catch(err => console.error(err));

const startBtn = document.getElementById("startBtn");
const quizContainer = document.getElementById("quizContainer");
const memorizeBox = document.getElementById("memorizeBox");
const showNextAnswerBtn = document.getElementById("showNextAnswerBtn");
const hideAllAnswersBtn = document.getElementById("hideAllAnswersBtn");

startBtn.addEventListener("click", () => {
    const start = parseInt(document.getElementById("startNumber").value);
    const end = parseInt(document.getElementById("endNumber").value);
    let num = parseInt(document.getElementById("numQuestions").value);
    const mode = document.getElementById("mode").value;

    // 範囲内単語抽出
    quizWords = words.filter(w => w.number >= start && w.number <= end);

    if(quizWords.length === 0){
        alert("指定範囲内に単語がありません。");
        return;
    }

    if(mode !== "memorize") {
        const order = document.getElementById("order").value;
        if(order === "desc") quizWords.sort((a,b)=>b.number-a.number);
        if(order === "random") quizWords.sort(()=>Math.random()-0.5);
    }

    if(num > quizWords.length) num = quizWords.length;
    quizWords = quizWords.slice(0,num);
    memorizeIndex = 0;

    if(mode === "memorize"){
        startMemorizeMode();
    } else {
        startNormalMode(mode);
    }
});

// 通常モード：全問題表示
function startNormalMode(mode){
    document.getElementById("quiz").classList.remove("hidden");
    document.getElementById("memorizeSection").classList.add("hidden");
    quizContainer.innerHTML = "";

    quizWords.forEach(q=>{
        let text = q.question;
        if(mode === "ja-en") text = q.answer;
        else if(mode === "random") text = Math.random() < 0.5 ? q.question : q.answer;

        const div = document.createElement("div");
        div.classList.add("questionItem");
        div.innerHTML = `<strong>${text}</strong>: <input type="text" placeholder="ここに入力">`;
        quizContainer.appendChild(div);
    });
}

// 暗記モード
function startMemorizeMode(){
    document.getElementById("quiz").classList.add("hidden");
    document.getElementById("memorizeSection").classList.remove("hidden");
    memorizeBox.innerHTML = "";

    quizWords.forEach(q=>{
        const div = document.createElement("div");
        div.classList.add("questionItem");
        div.innerHTML = `<strong>${q.question}</strong>: <span class="answer" style="display:none;">${q.answer}</span>`;
        memorizeBox.appendChild(div);
    });
}

// 暗記モード：次の答えを表示
showNextAnswerBtn.addEventListener("click", ()=>{
    const answers = memorizeBox.querySelectorAll(".answer");
    if(memorizeIndex < answers.length){
        answers[memorizeIndex].style.display = "inline";
        memorizeIndex++;
    }
});

// 暗記モード：全て隠す
hideAllAnswersBtn.addEventListener("click", ()=>{
    memorizeBox.querySelectorAll(".answer").forEach(el=>el.style.display="none");
    memorizeIndex = 0;
});

// PWA登録
if("serviceWorker" in navigator){
    navigator.serviceWorker.register("service-worker.js")
    .then(()=>console.log("Service Worker registered"))
    .catch(err=>console.error(err));
}

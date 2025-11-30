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
const showAllBtn = document.getElementById("showAllBtn");
const hideAllBtn = document.getElementById("hideAllBtn");

startBtn.addEventListener("click", () => {
    const start = parseInt(document.getElementById("startNumber").value);
    const end = parseInt(document.getElementById("endNumber").value);
    let num = parseInt(document.getElementById("numQuestions").value);
    const mode = document.getElementById("mode").value;
    const answerType = document.getElementById("answerType").value;
    const order = document.getElementById("order").value;

    // 範囲内単語抽出
    quizWords = words.filter(w => w.number >= start && w.number <= end);

    if(quizWords.length === 0){
        alert("指定範囲内に単語がありません。");
        return;
    }

    // 昇順・降順・ランダム処理
    if(order === "asc") quizWords = quizWords.slice().sort((a,b)=>a.number-b.number);
    if(order === "desc") quizWords = quizWords.slice().sort((a,b)=>b.number-a.number);
    if(order === "random") quizWords = shuffleArray(quizWords.slice());

    // 出題数制限
    if(num > quizWords.length) num = quizWords.length;
    quizWords = quizWords.slice(0,num);

    memorizeIndex = 0;

    if(mode === "memorize"){
        startMemorizeMode();
    } else {
        startNormalMode(mode, answerType);
    }
});

// 通常モード：問題番号なし、選択肢・自由入力対応
function startNormalMode(mode, answerType){
    document.getElementById("quiz").classList.remove("hidden");
    document.getElementById("memorizeSection").classList.add("hidden");
    quizContainer.innerHTML = "";

    quizWords.forEach((q,i)=>{
        let text = (mode === "ja-en") ? q.answer : (mode === "random" && Math.random()<0.5 ? q.answer : q.question);
        const div = document.createElement("div");
        div.classList.add("questionItem");

        let html = `<strong>${text}</strong><br>`;

        if(answerType === "choice"){
            let options = generateChoices(q, mode);
            options = shuffleArray(options);
            options.forEach(opt=>{
                html += `<button class="choiceBtn">${opt}</button> `;
            });
            html += `<div class="result"></div>`;
        } else {
            html += `<input type="text" class="userInput" placeholder="ここに入力">`;
            html += `<button class="checkBtn">答え合わせ</button>`;
            html += `<div class="result"></div>`;
        }

        div.innerHTML = html;
        quizContainer.appendChild(div);
    });

    // 選択肢ボタンクリック
    document.querySelectorAll(".choiceBtn").forEach(btn=>{
        btn.addEventListener("click", e=>{
            const parent = e.target.parentElement;
            const ansDiv = parent.querySelector(".result");
            const correct = quizWords[Array.from(quizContainer.children).indexOf(parent)];
            if(e.target.innerText === ((mode==="ja-en")?correct.answer:correct.question)){
                ansDiv.innerHTML = `<span style="color:green;">正解！</span>`;
            } else {
                ansDiv.innerHTML = `<span style="color:red;">不正解！あなた: ${e.target.innerText} 答え: ${(mode==="ja-en")?correct.answer:correct.question}</span>`;
            }
        });
    });

    // 自由入力ボタンクリック
    document.querySelectorAll(".checkBtn").forEach(btn=>{
        btn.addEventListener("click", e=>{
            const parent = e.target.parentElement;
            const input = parent.querySelector(".userInput").value.trim();
            const ansDiv = parent.querySelector(".result");
            const correct = quizWords[Array.from(quizContainer.children).indexOf(parent)];
            const correctText = (mode==="ja-en")?correct.answer:correct.question;
            if(input === correctText){
                ansDiv.innerHTML = `<span style="color:green;">正解！</span>`;
            } else {
                ansDiv.innerHTML = `<span style="color:red;">不正解！あなた: ${input} 答え: ${correctText}</span>`;
            }
        });
    });
}

// 選択肢生成（正解 + 他3つ）
function generateChoices(q, mode){
    let pool = (mode==="ja-en") ? words.map(w=>w.answer) : words.map(w=>w.question);
    pool = pool.filter(w=>w !== ((mode==="ja-en")?q.answer:q.question));
    pool = shuffleArray(pool).slice(0,3);
    pool.push((mode==="ja-en")?q.answer:q.question); // 必ず正解
    return pool;
}

// 配列シャッフル
function shuffleArray(array){
    return array.sort(()=>Math.random()-0.5);
}

// 暗記モード：カードクリックで答え表示/非表示
function startMemorizeMode(){
    document.getElementById("quiz").classList.add("hidden");
    document.getElementById("memorizeSection").classList.remove("hidden");
    memorizeBox.innerHTML = "";

    quizWords.forEach(q=>{
        const div = document.createElement("div");
        div.classList.add("questionItem");
        div.innerHTML = `<strong>${q.number}. ${q.question}</strong>: <span class="answer" style="display:none;">${q.answer}</span>`;
        memorizeBox.appendChild(div);

        div.addEventListener("click", ()=>{
            const ans = div.querySelector(".answer");
            ans.style.display = ans.style.display === "none" ? "inline" : "none";
        });
    });
}

// 暗記モード：一気に表示/隠す
showAllBtn.addEventListener("click", ()=>{
    memorizeBox.querySelectorAll(".answer").forEach(el=>el.style.display="inline");
});
hideAllBtn.addEventListener("click", ()=>{
    memorizeBox.querySelectorAll(".answer").forEach(el=>el.style.display="none");
});

// PWA登録
if("serviceWorker" in navigator){
    navigator.serviceWorker.register("service-worker.js")
    .then(()=>console.log("Service Worker registered"))
    .catch(err=>console.error(err));
}

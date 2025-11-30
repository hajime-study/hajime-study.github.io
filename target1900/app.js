let words = [];
let quizWords = [];
let memorizeIndex = 0;
let weakBox = new Set();

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
    const weakOnly = document.getElementById("weakOnly")?.checked;

    // 範囲内単語抽出
    quizWords = words.filter(w => w.number >= start && w.number <= end);

    if(weakOnly){
        quizWords = quizWords.filter(w=>weakBox.has(w.number));
    }

    if(quizWords.length === 0){
        alert("指定範囲内に単語がありません。");
        return;
    }

    // 昇降順でも番号は飛んでOK
    if(order === "asc") quizWords = shuffleArray(quizWords.slice()).sort((a,b)=>a.number-b.number);
    if(order === "desc") quizWords = shuffleArray(quizWords.slice()).sort((a,b)=>b.number-a.number);
    if(order === "random") quizWords = shuffleArray(quizWords.slice());

    if(num > quizWords.length) num = quizWords.length;
    quizWords = quizWords.slice(0,num);

    memorizeIndex = 0;

    if(mode === "memorize"){
        startMemorizeMode();
    } else {
        startNormalMode(mode, answerType);
    }
});

// 通常モード：番号表示＋選択肢・自由入力対応＋苦手ボタン
function startNormalMode(mode, answerType){
    document.getElementById("quiz").classList.remove("hidden");
    document.getElementById("memorizeSection").classList.add("hidden");
    quizContainer.innerHTML = "";

    quizWords.forEach((q,i)=>{
        const div = document.createElement("div");
        div.classList.add("questionItem");

        let text = (mode === "ja-en") ? q.answer : (mode === "random" && Math.random()<0.5 ? q.answer : q.question);
        let html = `<strong>${q.number}. ${text}</strong><br>`;

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

        html += `<button class="weakBtn">${weakBox.has(q.number) ? "苦手解除" : "苦手にする"}</button>`;
        div.innerHTML = html;
        quizContainer.appendChild(div);

        // 苦手ボタン
        const weakBtn = div.querySelector(".weakBtn");
        weakBtn.addEventListener("click", ()=>{
            if(weakBox.has(q.number)){
                weakBox.delete(q.number);
                weakBtn.innerText = "苦手にする";
            } else {
                weakBox.add(q.number);
                weakBtn.innerText = "苦手解除";
            }
        });
    });

    // 選択肢クリック
    document.querySelectorAll(".choiceBtn").forEach(btn=>{
        btn.addEventListener("click", e=>{
            const parent = e.target.parentElement;
            const ansDiv = parent.querySelector(".result");
            const idx = Array.from(quizContainer.children).indexOf(parent);
            const correct = quizWords[idx];
            const correctText = (mode==="ja-en")?correct.answer:correct.question;
            if(e.target.innerText === correctText){
                ansDiv.innerHTML = `<span style="color:green;">正解！</span>`;
            } else {
                ansDiv.innerHTML = `<span style="color:red;">不正解！あなた: ${e.target.innerText} 答え: ${correctText}</span>`;
            }
        });
    });

    // 自由入力
    document.querySelectorAll(".checkBtn").forEach(btn=>{
        btn.addEventListener("click", e=>{
            const parent = e.target.parentElement;
            const input = parent.querySelector(".userInput").value.trim();
            const ansDiv = parent.querySelector(".result");
            const idx = Array.from(quizContainer.children).indexOf(parent);
            const correct = quizWords[idx];
            const correctText = (mode==="ja-en")?correct.answer:correct.question;
            if(input === correctText){
                ansDiv.innerHTML = `<span style="color:green;">正解！</span>`;
            } else {
                ansDiv.innerHTML = `<span style="color:red;">不正解！あなた: ${input} 答え: ${correctText}</span>`;
            }
        });
    });
}

// 選択肢生成（必ず正解入り）
function generateChoices(q, mode){
    let pool = (mode==="ja-en") ? words.map(w=>w.answer) : words.map(w=>w.question);
    pool = pool.filter(w=>w!==((mode==="ja-en")?q.answer:q.question));
    pool = shuffleArray(pool).slice(0,3);
    pool.push((mode==="ja-en")?q.answer:q.question);
    return pool;
}

function shuffleArray(array){
    return array.sort(()=>Math.random()-0.5);
}

// 暗記モード
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
            ans.style.display = ans.style.display==="none"?"inline":"none";
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

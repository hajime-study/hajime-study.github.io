let words = [];
let quizWords = [];
let memorizeIndex = 0;
let weakBox = new Set();

fetch("words.json")
    .then(res => res.json())
    .then(data => words = data)
    .catch(err => console.error(err));

const mainMode = document.getElementById("mainMode");
const subSettings = document.getElementById("subSettings");
const startBtn = document.getElementById("startBtn");
const quizContainer = document.getElementById("quizContainer");
const memorizeBox = document.getElementById("memorizeBox");
const showAllBtn = document.getElementById("showAllBtn");
const hideAllBtn = document.getElementById("hideAllBtn");
const weakOnly = document.getElementById("weakOnly");

// プルダウン段階表示
mainMode.addEventListener("change", ()=>{
    subSettings.innerHTML = "";
    startBtn.classList.add("hidden");
    const mode = mainMode.value;
    if(!mode) return;

    // 出題形式選択
    const selectFormat = document.createElement("select");
    selectFormat.id = "formatSelect";
    selectFormat.innerHTML = `<option value="">出題形式選択</option>
        <option value="en-ja">英語→日本語</option>
        <option value="ja-en">日本語→英語</option>
        <option value="random">ランダム</option>`;
    subSettings.appendChild(selectFormat);

    selectFormat.addEventListener("change", ()=>{
        const oldNext = document.getElementById("nextSelect");
        if(oldNext) oldNext.remove();
        if(!selectFormat.value) return;

        const nextDiv = document.createElement("div");
        nextDiv.id = "nextSelect";

        if(mode==="memorize"){
            // 昇順/降順/ランダム
            nextDiv.innerHTML = `<label>順序:
                <select id="orderSelect">
                    <option value="asc">昇順</option>
                    <option value="desc">降順</option>
                    <option value="random">ランダム</option>
                </select>
            </label>`;
        } else {
            // 自由入力/選択肢
            nextDiv.innerHTML = `<label>回答方式:
                <select id="answerTypeSelect">
                    <option value="input">自由入力</option>
                    <option value="choice">選択肢</option>
                </select>
            </label>`;
        }

        subSettings.appendChild(nextDiv);
        startBtn.classList.remove("hidden");
    });
});

// 開始ボタン
startBtn.addEventListener("click", ()=>{
    const mode = mainMode.value;
    const format = document.getElementById("formatSelect")?.value;
    if(!format) return;

    let order = "random";
    let answerType = "input";
    if(mode==="memorize") order = document.getElementById("orderSelect")?.value || "random";
    else answerType = document.getElementById("answerTypeSelect")?.value || "input";

    let num = 10; // デフォルト出題数
    let start = 1;
    let end = 1900;

    // 範囲内抽出
    quizWords = words.filter(w=>w.number>=start && w.number<=end);
    if(weakOnly.checked) quizWords = quizWords.filter(w=>weakBox.has(w.number));

    if(mode==="memorize"){
        if(order==="asc") quizWords = shuffleArray(quizWords.slice()).sort((a,b)=>a.number-b.number);
        if(order==="desc") quizWords = shuffleArray(quizWords.slice()).sort((a,b)=>b.number-a.number);
        if(order==="random") quizWords = shuffleArray(quizWords.slice());
        startMemorizeMode(format);
    } else {
        startNormalMode(format, answerType);
    }
});

// 通常モード
function startNormalMode(format, answerType){
    document.getElementById("quiz").classList.remove("hidden");
    document.getElementById("memorizeSection").classList.add("hidden");
    quizContainer.innerHTML = "";

    quizWords.forEach((q,i)=>{
        const div = document.createElement("div");
        div.classList.add("questionItem");
        let questionText = format==="ja-en"?q.question:format==="en-ja"?q.question:q.question;
        let answerText = format==="ja-en"?q.answer:format==="en-ja"?q.answer:q.answer;

        let html = `<strong>${q.number}. ${questionText}</strong><br>`;

        if(answerType==="choice"){
            let options = generateChoices(q, format);
            options = shuffleArray(options);
            options.forEach(opt=>html+=`<button class="choiceBtn">${opt}</button> `);
            html+=`<div class="result"></div>`;
        } else {
            html+=`<input type="text" class="userInput" placeholder="ここに入力">
                   <button class="checkBtn">答え合わせ</button>
                   <div class="result"></div>`;
        }

        html+=`<button class="weakBtn">${weakBox.has(q.number)?"苦手解除":"苦手にする"}</button>`;
        div.innerHTML = html;
        quizContainer.appendChild(div);

        // 苦手ボタン
        div.querySelector(".weakBtn").addEventListener("click", ()=>{
            if(weakBox.has(q.number)){
                weakBox.delete(q.number);
                div.querySelector(".weakBtn").innerText="苦手にする";
            } else {
                weakBox.add(q.number);
                div.querySelector(".weakBtn").innerText="苦手解除";
            }
        });
    });

    // 選択肢クリック
    document.querySelectorAll(".choiceBtn").forEach(btn=>{
        btn.addEventListener("click", e=>{
            const parent = e.target.parentElement;
            const idx = Array.from(quizContainer.children).indexOf(parent);
            const correct = format==="ja-en"?quizWords[idx].answer:quizWords[idx].answer;
            const ansDiv = parent.querySelector(".result");
            if(e.target.innerText===correct) ansDiv.innerHTML=`<span style="color:green;">正解！</span>`;
            else ansDiv.innerHTML=`<span style="color:red;">不正解！あなた: ${e.target.innerText} 答え: ${correct}</span>`;
        });
    });

    // 自由入力
    document.querySelectorAll(".checkBtn").forEach(btn=>{
        btn.addEventListener("click", e=>{
            const parent = e.target.parentElement;
            const idx = Array.from(quizContainer.children).indexOf(parent);
            const correct = format==="ja-en"?quizWords[idx].answer:quizWords[idx].answer;
            const input = parent.querySelector(".userInput").value.trim();
            const ansDiv = parent.querySelector(".result");
            if(input===correct) ansDiv.innerHTML=`<span style="color:green;">正解！</span>`;
            else ansDiv.innerHTML=`<span style="color:red;">不正解！あなた: ${input} 答え: ${correct}</span>`;
        });
    });
}

// 選択肢生成
function generateChoices(q, format){
    let pool = words.map(w=>format==="ja-en"?w.answer:w.answer);
    pool = pool.filter(w=>w!==((format==="ja-en")?q.answer:q.answer));
    pool = shuffleArray(pool).slice(0,3);
    pool.push((format==="ja-en")?q.answer:q.answer);
    return pool;
}

// 暗記モード
function startMemorizeMode(format){
    document.getElementById("quiz").classList.add("hidden");
    document.getElementById("memorizeSection").classList.remove("hidden");
    memorizeBox.innerHTML = "";

    quizWords.forEach(q=>{
        const div = document.createElement("div");
        div.classList.add("questionItem");
        const questionText = format==="ja-en"?q.question:q.question;
        const answerText = format==="ja-en"?q.answer:q.answer;
        div.innerHTML = `<strong>${q.number}. ${questionText}</strong>: <span class="answer" style="display:none;">${answerText}</span>`;
        memorizeBox.appendChild(div);

        div.addEventListener("click", ()=>{
            const ans = div.querySelector(".answer");
            ans.style.display = ans.style.display==="none"?"inline":"none";
        });
    });
}

// 一気に表示/隠す
showAllBtn.addEventListener("click", ()=>memorizeBox.querySelectorAll(".answer").forEach(el=>el.style.display="inline"));
hideAllBtn.addEventListener("click", ()=>memorizeBox.querySelectorAll(".answer").forEach(el=>el.style.display="none"));

function shuffleArray(array){return array.sort(()=>Math.random()-0.5);}

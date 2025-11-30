let words = [];
let quizWords = [];
let weakBoxTest = new Set();
let weakBoxMemorize = new Set();

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
const rangeSection = document.getElementById("rangeSection");
const numQuestionsLabel = document.getElementById("numQuestionsLabel");

// プルダウン段階表示
mainMode.addEventListener("change", ()=>{
    subSettings.innerHTML = "";
    const mode = mainMode.value;
    if(!mode) return;

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
            nextDiv.innerHTML = `<label>順序:
                <select id="orderSelect">
                    <option value="asc">昇順</option>
                    <option value="desc">降順</option>
                    <option value="random">ランダム</option>
                </select>
            </label>`;
            subSettings.appendChild(nextDiv);

            // 昇順/降順なら出題数非表示
            const orderSelect = document.getElementById("orderSelect");
            const toggleNumInput = ()=>{ numQuestionsLabel.style.display = (orderSelect.value==="random")?"block":"none"; };
            orderSelect.addEventListener("change", toggleNumInput);
            toggleNumInput();
        } else {
            nextDiv.innerHTML = `<label>回答方式:
                <select id="answerTypeSelect">
                    <option value="input">自由入力</option>
                    <option value="choice">選択肢</option>
                </select>
            </label>`;
            subSettings.appendChild(nextDiv);
            numQuestionsLabel.style.display="block";
        }
    });
});

// 開始ボタン
startBtn.addEventListener("click", ()=>{
    const mode = mainMode.value;
    const format = document.getElementById("formatSelect")?.value;
    if(!mode || !format) return alert("モードと出題形式を選択してください。");

    const order = mode==="memorize"?document.getElementById("orderSelect")?.value || "random":"random";
    const answerType = mode==="test"?document.getElementById("answerTypeSelect")?.value || "input":"input";

    let startNum = parseInt(document.getElementById("startNumber").value) || 1;
    let endNum = parseInt(document.getElementById("endNumber").value) || 10;
    let num = parseInt(document.getElementById("numQuestions").value) || 10;

    quizWords = words.filter(w=>w.number>=startNum && w.number<=endNum);

    // モード別苦手ボックス
    let weakBox = mode==="memorize"?weakBoxMemorize:weakBoxTest;
    if(weakOnly.checked) quizWords = quizWords.filter(w=>weakBox.has(w.number));

    if(quizWords.length===0) return alert("範囲内に単語がありません。");

    // 日本語→英語の場合に正しく問題・答えを反映
    const isJaEn = format==="ja-en";

    if(mode==="memorize"){
        if(order==="asc") quizWords = quizWords.slice().sort((a,b)=>a.number-b.number);
        else if(order==="desc") quizWords = quizWords.slice().sort((a,b)=>b.number-a.number);
        else quizWords = shuffleArray(quizWords.slice());

        if(order!=="random") num = quizWords.length;
        quizWords = quizWords.slice(0,num);
        startMemorizeMode(isJaEn, weakBox);
    } else {
        quizWords = shuffleArray(quizWords.slice());
        if(num>quizWords.length) num=quizWords.length;
        quizWords = quizWords.slice(0,num);
        startNormalMode(isJaEn, answerType, weakBox);
    }
});

function shuffleArray(arr){return arr.sort(()=>Math.random()-0.5);}

// 通常モード
function startNormalMode(isJaEn, answerType, weakBox){
    document.getElementById("quiz").classList.remove("hidden");
    document.getElementById("memorizeSection").classList.add("hidden");
    quizContainer.innerHTML="";

    quizWords.forEach((q,i)=>{
        const div = document.createElement("div");
        div.classList.add("questionItem");

        const questionText = isJaEn?q.answer:q.question;
        const answerText = isJaEn?q.question:q.answer;

        let html = `<strong>${q.number}. ${questionText}</strong><br>`;

        if(answerType==="choice"){
            let options = generateChoices(q, isJaEn);
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
            const correct = isJaEn?quizWords[idx].question:quizWords[idx].answer;
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
            const correct = isJaEn?quizWords[idx].question:quizWords[idx].answer;
            const input = parent.querySelector(".userInput").value.trim();
            const ansDiv = parent.querySelector(".result");
            if(input===correct) ansDiv.innerHTML=`<span style="color:green;">正解！</span>`;
            else ansDiv.innerHTML=`<span style="color:red;">不正解！あなた: ${input} 答え: ${correct}</span>`;
        });
    });
}

// 選択肢生成
function generateChoices(q, isJaEn){
    let pool = words.map(w=>isJaEn?w.question:w.answer);
    pool = pool.filter(w=>w!==((isJaEn)?q.question:q.answer));
    pool = shuffleArray(pool).slice(0,3);
    pool.push((isJaEn)?q.question:q.answer);
    return pool;
}

// 暗記モード
function startMemorizeMode(isJaEn, weakBox){
    document.getElementById("quiz").classList.add("hidden");
    document.getElementById("memorizeSection").classList.remove("hidden");
    memorizeBox.innerHTML="";

    quizWords.forEach(q=>{
        const div = document.createElement("div");
        div.classList.add("questionItem");

        const questionText = isJaEn?q.answer:q.question;
        const answerText = isJaEn?q.question:q.answer;

        div.innerHTML=`<strong>${q.number}. ${questionText}</strong>: <span class="answer" style="display:none;">${answerText}</span>`;
        memorizeBox.appendChild(div);

        div.addEventListener("click", ()=>{
            const ans = div.querySelector(".answer");
            ans.style.display = ans.style.display==="none"?"inline":"none";
        });

        // 苦手ボタン
        const btn = document.createElement("button");
        btn.innerText = weakBox.has(q.number)?"苦手解除":"苦手にする";
        btn.classList.add("weakBtn");
        btn.addEventListener("click", ()=>{
            if(weakBox.has(q.number)){
                weakBox.delete(q.number);
                btn.innerText="苦手にする";
            } else {
                weakBox.add(q.number);
                btn.innerText="苦手解除";
            }
        });
        div.appendChild(btn);
    });
}

// 暗記モード：一気に表示/隠す
showAllBtn.addEventListener("click", ()=>memorizeBox.querySelectorAll(".answer").forEach(el=>el.style.display="inline"));
hideAllBtn.addEventListener("click", ()=>memorizeBox.querySelectorAll(".answer").forEach(el=>el.style.display="none"));

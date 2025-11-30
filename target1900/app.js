let words = [];
let quizWords = [];
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
        } else {
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

    let startNum = parseInt(document.getElementById("startNumber").value) || 1;
    let endNum = parseInt(document.getElementById("endNumber").value) || 10;
    let num = parseInt(document.getElementById("numQuestions").value) || 10;

    quizWords = words.filter(w=>w.number>=startNum && w.number<=endNum);
    if(weakOnly.checked) quizWords = quizWords.filter(w=>weakBox.has(w.number));

    if(quizWords.length === 0){
        alert("指定範囲内に単語がありません。");
        return;
    }

    // 暗記モード
    if(mode==="memorize"){
        if(order==="asc") quizWords = shuffleArray(quizWords.slice()).sort((a,b)=>a.number-b.number);
        if(order==="desc") quizWords = shuffleArray(quizWords.slice()).sort((a,b)=>b.number-a.number);
        if(order==="random") quizWords = shuffleArray(quizWords.slice());
        startMemorizeMode(format);
    } else {
        // テストモードは常にランダム
        quizWords = shuffleArray(quizWords.slice());
        startNormalMode(format, answerType);
    }

    // 出題数調整
    if(num>quizWords.length) num = quizWords.length;
    quizWords = quizWords.slice(0,num);
});

// 以下は前回の startNormalMode / startMemorizeMode / generateChoices / shuffleArray をそのまま使用

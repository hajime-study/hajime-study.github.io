// ターゲット1900 データ読み込み（変数 target1900 に配列で入っている想定）

document.getElementById("generateBtn").addEventListener("click", generateQuestions);

function generateQuestions() {
    const mode = document.getElementById("mode").value;
    const count = Number(document.getElementById("count").value);
    const start = Number(document.getElementById("start").value) - 1;
    const end = Number(document.getElementById("end").value) - 1;

    const resultArea = document.getElementById("questionArea");
    resultArea.innerHTML = "";

    const rangeWords = target1900.slice(start, end + 1);
    const selected = [];

    for (let i = 0; i < count; i++) {
        const randomIndex = Math.floor(Math.random() * rangeWords.length);
        selected.push(rangeWords[randomIndex]);
    }

    selected.forEach((word, i) => {
        const wrapper = document.createElement("div");
        wrapper.classList.add("questionBox");

        const q = document.createElement("p");
        q.innerHTML = `Q${start + i + 1}. ${mode === "en-ja" ? word.en : word.ja}`;
        wrapper.appendChild(q);

        const a = document.createElement("p");
        a.innerHTML = `${mode === "en-ja" ? word.ja : word.en}`;
        a.style.display = "none";
        wrapper.appendChild(a);

        const btnShow = document.createElement("button");
        btnShow.textContent = "答えを見る";
        btnShow.onclick = () => {
            a.style.display = "block";
        };
        wrapper.appendChild(btnShow);

        const btnWeak = document.createElement("button");
        btnWeak.textContent = "苦手ボックスに入れる";
        btnWeak.style.marginLeft = "10px";
        btnWeak.onclick = () => addWeakWord(word);
        wrapper.appendChild(btnWeak);

        resultArea.appendChild(wrapper);
    });
}

/* -------------------
    苦手ボックス機能
--------------------*/

function addWeakWord(word) {
    let weakList = JSON.parse(localStorage.getItem("weakWords") || "[]");

    // 重複回避
    if (!weakList.find(w => w.en === word.en)) {
        weakList.push(word);
        localStorage.setItem("weakWords", JSON.stringify(weakList));
        renderWeakWords();
    }
}

function renderWeakWords() {
    const weakContainer = document.getElementById("weakContainer");
    weakContainer.innerHTML = "";

    let weakList = JSON.parse(localStorage.getItem("weakWords") || "[]");

    if (weakList.length === 0) {
        weakContainer.innerHTML = "<p>まだ苦手ボックスは空っぽだよ！</p>";
        return;
    }

    weakList.forEach((word, i) => {
        const box = document.createElement("div");
        box.classList.add("weakBox");

        box.innerHTML = `
            <p><strong>${word.en}</strong> — ${word.ja}</p>
            <button onclick="removeWeak(${i})">削除</button>
        `;

        weakContainer.appendChild(box);
    });
}

function removeWeak(index) {
    let weakList = JSON.parse(localStorage.getItem("weakWords") || "[]");
    weakList.splice(index, 1);
    localStorage.setItem("weakWords", JSON.stringify(weakList));
    renderWeakWords();
}

// 初回読み込み時に苦手ボックス表示
renderWeakWords();

// ======================
// ELEMENT
// ======================

const killPopup =
    document.getElementById(
        "killPopup"
    );
const homeRank =
    document.getElementById("homeRank");
const resultRank =
    document.getElementById("resultRank");

const statRank =
    document.getElementById("statRank");

const homeStats =
    document.getElementById("homeStats");

const homeAttempts =
    document.getElementById("homeAttempts");

const homeBest =
    document.getElementById("homeBest");

const homeLast =
    document.getElementById("homeLast");

const homeAverage =
    document.getElementById("homeAverage");
const statAttempts =
    document.getElementById("statAttempts");

const statBest =
    document.getElementById("statBest");

const statLast =
    document.getElementById("statLast");

const statAverage =
    document.getElementById("statAverage");

const homePage = document.getElementById("homePage");
const quizPage = document.getElementById("quizPage");
const resultPage = document.getElementById("resultPage");

const jsonFile = document.getElementById("jsonFile");
const pickBtn = document.getElementById("pickBtn");
const fileInfo = document.getElementById("fileInfo");
const fileName = document.getElementById("fileName");
const questionCount = document.getElementById("questionCount");
const startBtn = document.getElementById("startBtn");

const backBtn = document.getElementById("backBtn");
const nextBtn = document.getElementById("nextBtn");

const progressText = document.getElementById("progressText");
const progressBar = document.getElementById("progressBar");

const questionText = document.getElementById("questionText");
const optionsContainer = document.getElementById("optionsContainer");

const explanationBox = document.getElementById("explanationBox");
const explanationText = document.getElementById("explanationText");

const scoreValue = document.getElementById("scoreValue");
const correctCount = document.getElementById("correctCount");
const wrongCount = document.getElementById("wrongCount");

const retryBtn = document.getElementById("retryBtn");
const newFileBtn = document.getElementById("newFileBtn");

const themeBtn = document.getElementById("themeBtn");

// ======================
// STATE
// ======================
let userAnswers = [];
let originalQuestions = [];
let questions = [];
let currentIndex = 0;
let score = 0;
let currentFileName = "";
let streak = 0;
// ======================
// DARK MODE
// ======================

if (localStorage.getItem("theme") === "dark") {
    document.body.classList.add("dark");
    themeBtn.textContent = "☀️";
}

themeBtn.addEventListener("click", () => {

    document.body.classList.toggle("dark");

    const isDark =
        document.body.classList.contains("dark");

    themeBtn.textContent =
        isDark ? "☀️" : "🌙";

    localStorage.setItem(
        "theme",
        isDark ? "dark" : "light"
    );

});

// ======================
// PILIH FILE
// ======================

pickBtn.addEventListener("click", () => {
    jsonFile.click();
});

jsonFile.addEventListener("change", loadJSON);

// ======================
// LOAD JSON
// ======================

function loadJSON(e) {

    const file = e.target.files[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onload = function () {

        try {

            const data =
                JSON.parse(reader.result);

            if (!Array.isArray(data)) {

                alert(
                    "Format JSON harus berupa array!"
                );

                return;

            }

            if (data.length === 0) {

                alert(
                    "Soal tidak ditemukan!"
                );

                return;

            }

            originalQuestions = data;

currentFileName = file.name;

fileName.textContent = currentFileName;

            questionCount.textContent =
                data.length;

            fileInfo.classList.remove(
                "hidden"
            );
renderHomeStatistics();
        }

catch(error) {

    console.error(error);

    alert(error.message);

}
    };

    reader.readAsText(file);

}

// ======================
// MULAI BELAJAR
// ======================

startBtn.addEventListener(
    "click",
    startQuiz
);

function startQuiz() {

    currentIndex = 0;
    score = 0;
    userAnswers = [];
    streak = 0;

    // Acak soal
    questions =
        shuffleArray(originalQuestions);

    // Acak pilihan
    questions =
        questions.map(q => {

            const correctAnswer =
                q.options[q.answer];

            const shuffledOptions =
                shuffleArray(q.options);

            return {

                ...q,

                options: shuffledOptions,

                answer:
                    shuffledOptions.indexOf(
                        correctAnswer
                    )

            };

        });

    showPage("quiz");

    renderQuestion();

}
// ======================
// TAMPILKAN SOAL
// ======================

function renderQuestion() {

    const q =
        questions[currentIndex];

    progressText.textContent =
        `Soal ${currentIndex + 1} / ${questions.length}`;

    const percent =
        (currentIndex / questions.length) * 100;

    progressBar.style.width =
        percent + "%";

    questionText.textContent =
        q.question;

    optionsContainer.innerHTML = "";

    explanationBox.classList.add(
        "hidden"
    );

    nextBtn.classList.add(
        "hidden"
    );

    q.options.forEach(
        (option, index) => {

            const div =
                document.createElement("div");

            div.className = "option";

            div.textContent = option;

            div.onclick = () =>
                checkAnswer(index);

            optionsContainer.appendChild(
                div
            );

        }
    );

}

// ======================
// CEK JAWABAN
// ======================

function checkAnswer(selected) {

    userAnswers[currentIndex] = selected;

    const q = questions[currentIndex];

    const options =
        document.querySelectorAll(".option");

    options.forEach(
        opt => opt.onclick = null
    );

    options[q.answer]
        .classList.add("correct");

if(selected === q.answer){

    score++;

    streak++;

    console.log("STREAK =", streak);

    showKillStreak();

}
else{

    console.log("SALAH, RESET STREAK");

    streak = 0;

}

    explanationText.textContent =
        q.explanation;

    explanationBox.classList.remove(
        "hidden"
    );

    nextBtn.classList.remove(
        "hidden"
    );

}

// ======================
// SOAL BERIKUTNYA
// ======================

nextBtn.addEventListener(
    "click",
    nextQuestion
);

function nextQuestion() {

    currentIndex++;

    if (
        currentIndex >= questions.length
    ) {

        showResult();
        return;

    }

    renderQuestion();

}

// ======================
// HASIL AKHIR
// ======================

function showResult() {

    showPage("result");

    const wrong =
        questions.length - score;

    const percent =
        Math.round(
            (score / questions.length) * 100
        );

scoreValue.textContent =
    percent + "%";

resultRank.textContent =
    getRank(percent);

    correctCount.textContent =
        score;

    wrongCount.textContent =
        wrong;

    // Simpan statistik khusus file ini
    updateStatistics(percent);

    // Tampilkan statistik file ini
    renderStatistics();

}

function updateStatistics(percent){

    const key =
        "learningStats_" +
        currentFileName;

    let stats =
        JSON.parse(
            localStorage.getItem(key)
        ) || {

            attempts:0,
            best:0,
            total:0,
            last:0

        };

    stats.attempts++;

    stats.last = percent;

    stats.total += percent;

    if(percent > stats.best){

        stats.best = percent;

    }

    localStorage.setItem(
        key,
        JSON.stringify(stats)
    );

}

function showReview() {

    reviewContainer.innerHTML = "";

    questions.forEach((q, i) => {

        const userAnswer =
            userAnswers[i];

        reviewContainer.innerHTML += `

        <div class="review-card">

            <div class="review-question">

                ${i+1}. ${q.question}

            </div>

            <div class="review-answer user">

                ❌ Jawaban Anda:

                ${q.options[userAnswer]}

            </div>

            <div class="review-answer correct">

                ✅ Jawaban Benar:

                ${q.options[q.answer]}

            </div>

            <div class="review-explanation">

                <b>Pembahasan:</b><br>

                ${q.explanation}

            </div>

        </div>

        `;

    });

    showPage("review");

}


reviewBtn.addEventListener(
    "click",
    showReview
);

backResultBtn.addEventListener(
    "click",
    () => {

        showPage("result");

    }
);
// ======================
// ULANGI LATIHAN
// ======================

retryBtn.addEventListener(
    "click",
    () => {

        currentIndex = 0;
        score = 0;

        showPage("quiz");

        renderQuestion();

    }
);

// ======================
// FILE BARU
// ======================

newFileBtn.addEventListener(
    "click",
    () => {

        questions = [];

        jsonFile.value = "";

        fileInfo.classList.add(
            "hidden"
        );

        showPage("home");

    }
);

// ======================
// KEMBALI KE HOME
// ======================

backBtn.addEventListener(
    "click",
    () => {

        if (
            confirm(
                "Keluar dari latihan?"
            )
        ) {

            showPage("home");

        }

    }
);

// ======================
// GANTI HALAMAN
// ======================

function showPage(page) {

    homePage.classList.remove(
        "active"
    );

    quizPage.classList.remove(
        "active"
    );

    resultPage.classList.remove(
        "active"
    );

    reviewPage.classList.remove(
    "active"
   );

    switch (page) {

        case "home":

            homePage.classList.add(
                "active"
            );

            break;

        case "quiz":

            quizPage.classList.add(
                "active"
            );

            break;

        case "result":

            resultPage.classList.add(
                "active"
            );

            break;
       case "review":

    reviewPage.classList.add(
        "active"
    );

    break;

    }

}
function shuffleArray(array) {

    const arr = [...array];

    for (let i = arr.length - 1; i > 0; i--) {

        const j =
            Math.floor(Math.random() * (i + 1));

        [arr[i], arr[j]] =
        [arr[j], arr[i]];

    }

    return arr;

}

function getRank(score){

    if(score >= 95)
        return "🔥 Mythical Immortal";

    if(score >= 85)
        return "👑 Mythical Glory";

    if(score >= 75)
        return "💎 Mythical Honor";

    if(score >= 60)
        return "❤️ Mythic";

    if(score >= 50)
        return "🧡 Legend";

    if(score >= 40)
        return "💜 Epic";

    if(score >= 30)
        return "🥇 Grandmaster";

    if(score >= 20)
        return "🥈 Master";

    if(score >= 10)
        return "🥉 Elite";

    return "🪖 Warrior";

}
function showKillStreak(){

    if(!killPopup) return;

    let text = "";

    if(streak === 2){

        text = "⚔️ DOUBLE KILL";

    }
    else if(streak === 3){

        text = "🔥 TRIPLE KILL";

    }
    else if(streak === 4){

        text = "💀 MANIAC";

    }
    else if(streak >= 5){

        text = "👑 SAVAGE";

    }

    if(!text) return;

    killPopup.textContent = text;

    // Paksa tampil
    killPopup.style.display = "block";

    // Reset animasi
    killPopup.classList.remove("show");
    void killPopup.offsetWidth;
    killPopup.classList.add("show");

    setTimeout(() => {

        killPopup.style.display = "none";

    }, 1800);

}

function renderStatistics(){

    const key =
        "learningStats_" + currentFileName;

    const stats =
        JSON.parse(
            localStorage.getItem(key)
        );

    if(!stats) return;

    const average =
        Math.round(
            stats.total /
            stats.attempts
        );

    statAttempts.textContent =
        stats.attempts;

    statBest.textContent =
        stats.best + "%";

    statLast.textContent =
        stats.last + "%";

    statAverage.textContent =
        average + "%";

    statRank.textContent =
        getRank(stats.last);

}
function renderHomeStatistics(){

    const key =
        "learningStats_" +
        currentFileName;

    const stats =
        JSON.parse(
            localStorage.getItem(key)
        );

    if(!stats){

        homeStats.classList.add(
            "hidden"
        );

        return;

    }

    homeStats.classList.remove(
        "hidden"
    );

    homeAttempts.textContent =
        stats.attempts;

    homeBest.textContent =
        stats.best + "%";

    homeLast.textContent =
        stats.last + "%";

homeRank.textContent =
    getRank(stats.last);
}

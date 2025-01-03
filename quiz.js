
const progressbar = document.querySelector(".progress-bar");
const progresstext = document.querySelector(".progress-text");

const progress = (red, totalTime) => {
  const percentage = (red / totalTime) * 100;
  progressbar.style.width = `${percentage}%`;
  progresstext.innerHTML = `${red}`;
};

let questions = [],
  time = 60,
  score = 0,
  currentQuestion,
  timer;

const startBtn = document.querySelector(".start");
const numquestions = document.querySelector("#num-questions"),
  category = document.querySelector("#category"),
  difficulty = document.querySelector("#difficulty"),
  timePerQuestion = document.querySelector("#time"),
  quiz = document.querySelector(".quiz"),
  startScreen = document.querySelector(".start-screen"),
  submitbtn = document.querySelector(".submit"),
  nextbtn = document.querySelector(".next"),
  endScreen = document.querySelector(".end-screen"),
  finalScore = document.querySelector(".final-score"),
  totalScore = document.querySelector(".total-score");

const startquiz = () => {
  const num = numquestions.value || 5;
  const cat = category.value !== "any" ? `&category=${category.value}` : "";
  const diff = difficulty.value ? `&difficulty=${difficulty.value}` : "";

  const url = `https://opentdb.com/api.php?amount=${num}${cat}${diff}&type=multiple`;

  fetch(url)
    .then((res) => res.json())
    .then((data) => {
      if (data.response_code !== 0) {
        alert("No questions found. Please adjust your settings and try again.");
        return;
      }
      questions = data.results;

      startScreen.classList.add("hide");
      quiz.classList.remove("hide");

      currentQuestion = 1;
      showQuestion(questions[0]);
    });
};

startBtn.addEventListener("click", () => {
  startquiz();
});

const showQuestion = (question) => {
  const questiontext = document.querySelector(".question"),
    answerwrapper = document.querySelector(".answer-wrapper"),
    questionnumber = document.querySelector(".number");
  //console.log("")
  questiontext.innerHTML = question.question;

  const answers = [...question.incorrect_answers, question.correct_answer];
  answers.sort(() => Math.random() - 0.5);

  answerwrapper.innerHTML = "";
  answers.forEach((answer) => {
    answerwrapper.innerHTML += `
      <div class="answer">
        <span class="text">${answer}</span>
        <span class="checkbox">
          <span class="icon">✔</span>
         </span>
      </div>`;
  });

  questionnumber.innerHTML = `
       Question <span class="current">${currentQuestion}</span>
       <span class="total">/${questions.length}</span>
   `;

  const answerdiv = document.querySelectorAll(".answer");
  answerdiv.forEach((answer) => {
    answer.addEventListener("click", () => {
      if (!answer.classList.contains("checked")) {
        answerdiv.forEach((ans) => ans.classList.remove("selected"));
        answer.classList.add("selected");
        submitbtn.disabled = false;
      }
    });
  });

  time = parseInt(timePerQuestion.value);
  startTimer(time);
};

const startTimer = (timeValue) => {
  let redvalue = timeValue;

  progress(redvalue, timeValue);

  timer = setInterval(() => {
    if (redvalue > 0) {
      redvalue--;
      progress(redvalue, timeValue);
    } else {
      clearInterval(timer);
      checkanswer(); 
    }
  }, 1000);
};

const checkanswer = () => {
  clearInterval(timer);
  const selectedAnswer = document.querySelector(".answer.selected");
  if (selectedAnswer) {
    const selectedText = selectedAnswer.querySelector(".text").innerHTML;
    const correctAnswer = questions[currentQuestion - 1].correct_answer;
    if (selectedText === correctAnswer) {
      score++;
      selectedAnswer.classList.add("correct");
    } else {
      selectedAnswer.classList.add("wrong");
      document.querySelectorAll(".answer").forEach((answer) => {
        if (answer.querySelector(".text").innerHTML === correctAnswer) {
          answer.classList.add("correct");
        }
      });
    }
  } else {
    document.querySelectorAll(".answer").forEach((answer) => {
      if (answer.querySelector(".text").innerHTML === questions[currentQuestion - 1].correct_answer) {
        answer.classList.add("correct");
      }
    });
  }
  submitbtn.disabled = true;
  setTimeout(nextQuestion, 2000); // Automatically move to the next question after 2 seconds
};
submitbtn.addEventListener("click", () => {
  checkanswer();
});
nextbtn.addEventListener("click", () => {
  nextQuestion();
});
const nextQuestion = () => {
  if (currentQuestion < questions.length) {
    currentQuestion++;
    showQuestion(questions[currentQuestion - 1]);
    submitbtn.disabled = true;
    nextbtn.disabled = true;
  } else {
    endQuiz();
  }
};

const endQuiz = () => {
  quiz.classList.add("hide");
  endScreen.classList.remove("hide");
  finalScore.textContent = score;
  totalScore.textContent ='/'+`${questions.length}`;
};
const restart=document.querySelector(".restart");
restart.addEventListener("click",()=>{
  endScreen.classList.add("hide");
  startScreen.classList.remove("hide");
})
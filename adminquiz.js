
// import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
// import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-database.js";
// import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js";


// const firebaseConfig = {
//   apiKey: "AIzaSyDPxhJzHZD7wBJPaPV4D4n2656ixAwo6Rk",
//   authDomain: "quiz-grow-d36fd.firebaseapp.com",
//   databaseURL: "https://quiz-grow-d36fd-default-rtdb.asia-southeast1.firebasedatabase.app",
//   projectId: "quiz-grow-d36fd",
//   storageBucket: "quiz-grow-d36fd.firebasestorage.app",
//   messagingSenderId: "1000620946874",
//   appId: "1:1000620946874:web:f4e197e53d642b0efe9983",
//   measurementId: "G-9HK2BVX2NR"
// };


// const app = initializeApp(firebaseConfig);
// const db = getDatabase(app);
// const auth = getAuth(app);

//  function loadQuiz(quizId) {
//    const quizRef = ref(db, `quizzes/${quizId}`); //QUIZ ID PRODUCED IN ADMIN PANEL
//   const quizTitleElem = document.getElementById('quiz-title');
//    const quizTopicElem = document.getElementById('topic');
// //   const questionsContainer = document.getElementById('quiz-questions');

//    onValue(quizRef, (snapshot) => {
//     const quiz = snapshot.val();

//     if (quiz) {
//       if (!quiz.isPublished) {
//         alert("This quiz has not been published yet. Please try again later.");
//         return;
//       }

// //       // Populate quiz data
// //       quizTitleElem.textContent = quiz.title || "Quiz";
// //       quizTopicElem.textContent = quiz.topic || "General";

// //       questionsContainer.innerHTML = ""; // Clear previous questions

// //       quiz.questions.forEach((question, index) => {
// //         const questionDiv = document.createElement('div');
// //         questionDiv.className = 'question';

// //         questionDiv.innerHTML = ` 
// //           <p><strong>Q${index + 1}: ${question.text}</strong></p>
// //           <ul class="options">
// //             ${question.options.map((option, i) => `
// //               <li>
// //                 <input type="radio" name="question-${index}" value="${i}">
// //                 <label>${option}</label>
// //               </li>
// //             `).join('')}
// //           </ul>
// //         `;

// //         // Store correct answer for scoring
// //         questionDiv.setAttribute('data-correct-answer', question.correctAnswer);
// //         questionsContainer.appendChild(questionDiv);
// //       });
// //     } else {
// //       alert("Quiz not found. Please check the quiz ID.");
// //     }
// //   });
// // }

// // // Handle quiz submission
// // document.getElementById('submit-quiz').addEventListener('click', () => {
// //   const questionsContainer = document.getElementById('quiz-questions');
// //   const questions = questionsContainer.querySelectorAll('.question');
// //   let score = 0;

// //   questions.forEach((questionDiv, index) => {
// //     const selectedOption = questionDiv.querySelector('input[type="radio"]:checked');
// //     const correctAnswer = questionDiv.getAttribute('data-correct-answer');

// //     if (selectedOption && selectedOption.value === correctAnswer) {
// //       score++;
// //     }
// //   });

// //   // Display the result
// //   const resultContainer = document.getElementById('quiz-result');
// //   resultContainer.querySelector('#score').textContent = `You scored ${score}/${questions.length}`;
// //   resultContainer.classList.remove('hidden');
// // });

// // // Ensure user is authenticated
// // onAuthStateChanged(auth, (user) => {
// //   if (user) {
// //     const urlParams = new URLSearchParams(window.location.search);
// //     const quizId = urlParams.get('quizId');
// //     if (quizId) {
// //       loadQuiz(quizId);
// //     } else {
// //       alert("No quiz selected. Redirecting...");
// //       window.location.href = "admin.html"; // Redirect to admin or user dashboard
// //     }
// //   } else {
// //     alert("Please log in to attempt the quiz.");
// //     window.location.href = "sign.html"; // Redirect to login page
// //   }
// // });
const startScreen = document.getElementById("start-quiz");
const quizContent = document.getElementById("quiz-content");
const questionText = document.getElementById("question-text");
const optionsContainer = document.getElementById("options");
const scoreDisplay = document.getElementById("score");
const endQuizContainer = document.querySelector(".end-quiz");

let questions = [];
let currentQuestion = 0;
let score = 0;

const startquiz = () => {
  const numQuestions = 5; // Default number of questions
  const category = ""; // Add your category logic if needed
  const difficulty = ""; // Add your difficulty logic if needed
  const url = `https://opentdb.com/api.php?amount=${numQuestions}${category}${difficulty}&type=multiple`;

  fetch(url)
    .then((res) => res.json())
    .then((data) => {
      if (data.response_code !== 0) {
        alert("No questions found. Please adjust your settings and try again.");
        return;
      }
      questions = data.results.map((q) => ({
        text: q.question,
        options: [...q.incorrect_answers, q.correct_answer].sort(() => Math.random() - 0.5),
        correctAnswer: q.correct_answer,
      }));

      startScreen.classList.add("hide");
      quizContent.classList.remove("hide");
      currentQuestion = 0;
      score = 0;
      showQuestion();
    })
    .catch((error) => {
      console.error("Error fetching questions:", error);
    });
};

const showQuestion = () => {
  const question = questions[currentQuestion];
  questionText.innerHTML = question.text;

  optionsContainer.innerHTML = ""; // Clear previous options
  question.options.forEach((option, index) => {
    const button = document.createElement("button");
    button.textContent = option;
    button.classList.add("btn");
    button.onclick = () => checkAnswer(option);
    optionsContainer.appendChild(button);
  });
};

const checkAnswer = (selectedOption) => {
  const correctAnswer = questions[currentQuestion].correctAnswer;
  if (selectedOption === correctAnswer) {
    score++;
  }

  currentQuestion++;
  if (currentQuestion < questions.length) {
    showQuestion();
  } else {
    endQuiz();
  }
};

const endQuiz = () => {
  quizContent.classList.add("hide");
  endQuizContainer.classList.remove("hide");
  scoreDisplay.textContent = `${score}/${questions.length}`;
};

// Attach event listener to start quiz button
startScreen.addEventListener("click", startquiz);

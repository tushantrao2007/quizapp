import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import { getDatabase, ref, set, push, get } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-database.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDPxhJzHZD7wBJPaPV4D4n2656ixAwo6Rk",
  authDomain: "quiz-grow-d36fd.firebaseapp.com",
  databaseURL: "https://quiz-grow-d36fd-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "quiz-grow-d36fd",
  storageBucket: "quiz-grow-d36fd.firebasestorage.app",
  messagingSenderId: "1000620946874",
  appId: "1:1000620946874:web:f4e197e53d642b0efe9983",
  measurementId: "G-9HK2BVX2NR"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);

// Check if user is authenticated
onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log("Authenticated as: ", user.email);
  } else {
    alert("Please log in to access the admin panel.");
    window.location.href = "sign.html"; // Redirect to login if not authenticated
  }
});

// Add quiz form submission
document.getElementById('add-quiz-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const quizTitle = document.getElementById('quiz-title').value;
  const quizTopic = document.getElementById('quiz-topic').value;
  const numQuestions = parseInt(document.getElementById('num-questions').value, 10);
  const timeLimit = parseInt(document.getElementById('time-limit').value, 10);
  const difficulty = document.getElementById('quiz-difficulty').value || "";
  const category = document.getElementById('quiz-category').value || "any";

  const cat = category !== "any" ? `&category=${category}` : "";
  const diff = difficulty ? `&difficulty=${difficulty}` : "";
  const url = `https://opentdb.com/api.php?amount=${numQuestions}${cat}${diff}&type=multiple`;

  try {
    const res = await fetch(url);
    const data = await res.json();

    if (data.response_code !== 0) {
      alert("No questions found. Please adjust your settings and try again.");
      return;
    }

    const questions = data.results.map((q) => ({
      text: q.question,
      options: [...q.incorrect_answers, q.correct_answer].sort(() => Math.random() - 0.5),
      correctAnswer: q.correct_answer,
    }));

    const quizRef = ref(db, `quizzes/`);
    const newQuizKey = push(quizRef).key;

    const quizData = {
      title: quizTitle,
      topic: quizTopic,
      timeLimit: timeLimit,
      isPublished: true,
      questions: questions,
    };

    await set(ref(db, `quizzes/${newQuizKey}`), quizData);
    alert("Quiz created successfully!");
    document.getElementById('add-quiz-form').reset();
  } catch (error) {
    alert("Error creating quiz: " + error.message);
  }
});


// Load and display all users in the "Manage Users" section
async function loadUsers() {
  const usersTableBody = document.querySelector('#users-table tbody');
  usersTableBody.innerHTML = ''; // Clear existing rows

  try {
      const usersRef = ref(db, 'users');
      const usersSnapshot = await get(usersRef);

      if (usersSnapshot.exists()) {
          const users = usersSnapshot.val();
          for (const userId in users) {
              const user = users[userId];

              // Create a table row
              const row = document.createElement('tr');
              row.innerHTML = `
                  <td>${userId}</td>
                  <td>${user.username || 'N/A'}</td>
                  <td>${user.email || 'N/A'}</td>
                  <td>
                      <button class="btn btn-primary btn-sm" onclick="viewUser('${userId}')">View</button>
                      <button class="btn btn-danger btn-sm" onclick="deleteUser('${userId}')">Delete</button>
                  </td>
              `;
              usersTableBody.appendChild(row);
          }
      } else {
          usersTableBody.innerHTML = '<tr><td colspan="4">No users found.</td></tr>';
      }
  } catch (error) {
      console.error('Error loading users:', error.message);
      usersTableBody.innerHTML = '<tr><td colspan="4">Error loading users.</td></tr>';
  }
}

// View user details
function viewUser(userId) {
  alert(`View user details for User ID: ${userId}`);
  // Add additional logic for displaying detailed user information here
}

// Delete a user
import { deleteUser as authDeleteUser } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js";

async function deleteUser(userId) {
  if (confirm(`Are you sure you want to delete user with ID: ${userId}?`)) {
    try {
      // Get the user's email or UID from the database
      const userRef = ref(db, `users/${userId}`);
      const userSnapshot = await get(userRef);

      if (userSnapshot.exists()) {
        const user = userSnapshot.val();

        // Delete the user from Firebase Authentication
        const userAuth = await getAuth().getUserByEmail(user.email); // Use their email to find them in Authentication
        await authDeleteUser(userAuth.uid);

        // Remove the user from the database
        await set(userRef, null);

        alert("User deleted successfully from both Authentication and Database.");
        loadUsers(); // Refresh the user list
      } else {
        alert("User not found in the database.");
      }
    } catch (error) {
      console.error("Error deleting user:", error.message);
      alert("Error deleting user.");
    }
  }
}

window.viewUser = function(userId) {
  console.log(`View function triggered for User ID: ${userId}`);
  alert(`View user details for User ID: ${userId}`);
};

window.deleteUser = async function(userId) {
  console.log(`Delete function triggered for User ID: ${userId}`);
  if (confirm(`Are you sure you want to delete user with ID: ${userId}?`)) {
      try {
          const userRef = ref(db, `users/${userId}`);
          await set(userRef, null); 
          console.log('User deleted successfully.');
          // alert('User deleted successfully.');
          loadUsers(); // Refresh the user list
      } catch (error) {
          console.error('Error deleting user:', error.message);
          alert('Error deleting user.');
      }
  }
};


// Load users when the page is ready
document.addEventListener('DOMContentLoaded', loadUsers);


// Logout Functionality
document.getElementById("logout").addEventListener("click", () => {
  signOut(auth)
    .then(() => {
      alert("Logged out successfully!");
      window.location.href = "sign.html";
    })
    .catch((error) => {
      alert("Error logging out: " + error.message);
    });
});

// Function to load users and their scores in the report section
async function loadReports() {
  try {
      const usersRef = ref(db, "users");
      const usersSnapshot = await get(usersRef);

      if (!usersSnapshot.exists()) {
          alert("No users found.");
          return;
      }

      const users = usersSnapshot.val();
      const scoresTableBody = document.getElementById("scores-table").querySelector("tbody");
      scoresTableBody.innerHTML = ""; // Clear the previous table rows

      for (const userId in users) {
          const user = users[userId];
          const userScoreRef = ref(db, `users/${userId}/quizScores`);

          // Fetch the user's quiz scores
          const scoresSnapshot = await get(userScoreRef);
          let score = "-"; // Default score is "-"
          if (scoresSnapshot.exists()) {
              // If quiz scores exist, show them
              const scores = scoresSnapshot.val();
              score = Object.values(scores).map(score => score).join(", "); // Combine all quiz scores if any
          }

          // Add row for the user
          const row = document.createElement("tr");
          row.innerHTML = `
              <td>${userId}</td>
              <td>${score}</td>
              <td>${new Date().toLocaleString()}</td>  <!-- Assuming you want to show the current time -->
          `;
          scoresTableBody.appendChild(row);
      }
  } catch (error) {
      console.error("Error loading reports:", error);
      alert("Error loading reports.");
  }
}

// Call loadReports on page load or whenever you want to refresh the reports table
document.addEventListener("DOMContentLoaded", loadReports);
const newUser = {
  name: "John Doe",
  email: "john.doe@example.com",
  quizScores: {
    quiz1: 10,
    quiz2: 8
  }
};
const newUserRef = ref(db, 'users/user123'); // Storing user data under user123
set(newUserRef, newUser)
  .then(() => console.log("Data saved successfully"))
  .catch((error) => console.error("Error saving data:", error));

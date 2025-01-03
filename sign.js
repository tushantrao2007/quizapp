// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
// import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-analytics.js";
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  onAuthStateChanged, 
  GoogleAuthProvider, 
  signInWithPopup,
  fetchSignInMethodsForEmail
} from "https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js";

import { getDatabase, ref, set, get } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-database.js";

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
// const analytics = getAnalytics(app);
const auth = getAuth();
const db = getDatabase();

// Sign-Up Functionality
document.querySelector('.sign-up form').addEventListener('submit', (e) => {
  e.preventDefault();
  const email = e.target.querySelector('input[type="email"]').value;
  const password = e.target.querySelector('input[type="password"]').value;
  const username = e.target.querySelector('input[type="text"]').value;

  createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      const user = userCredential.user;

      // Check if the email and password match admin credentials
      const isAdmin = (email === "tushantsahab1010g@gmail.com" && password === "tush@nts@h@b1010g@");

      // Save user info to the database with appropriate isAdmin flag
      set(ref(db, 'users/' + user.uid), {
        username: username,
        email: email,
        isAdmin: isAdmin, // Set as admin if credentials match
      });

      alert(isAdmin ? "Admin account created successfully!" : "Account created successfully!");
      e.target.querySelector('input[type="text"]').value = "";
      e.target.querySelector('input[type="password"]').value = "";
      e.target.querySelector('input[type="email"]').value = "";
    })
    .catch((error) => {
      alert(error.message);
    });
});

document.querySelector('.sign-in form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const emailInput = e.target.querySelector('input[type="email"]');
  const passwordInput = e.target.querySelector('input[type="password"]');
  const email = emailInput.value;
  const password = passwordInput.value;

  try {
    // Check sign-in methods for the email
    const signInMethods = await fetchSignInMethodsForEmail(auth, email);

    if (signInMethods.includes('google.com')) {
      // If Google is the sign-in method, prompt the user to use Google Sign-In
      alert("This email is linked to a Google account. Please use Google Sign-In.");
    } else if (signInMethods.includes('password')) {
      // Email/Password account exists, proceed with signInWithEmailAndPassword
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Redirect based on user role
      const userRef = ref(db, 'users/' + user.uid);
      const snapshot = await get(userRef);
      if (snapshot.exists()) {
        const userData = snapshot.val();
        if (userData.isAdmin) {
          window.location.href = "admin.html"; // Redirect to admin page
        } else {
          window.location.href = "creating.html"; // Redirect to user page
        }
      } else {
        console.error("User data not found.");
      }
    } else {
      alert("No account found with this email or Either it is linked with google please check with it.");
    }
  } catch (error) {
    console.error("Error during sign-in:", error.message);
    alert(error.message);
    emailInput.value = ""; 
    passwordInput.value = ""; 
  }
});

// Google Sign-In Functionality
document.getElementById('googleSignUp').addEventListener('click', handleGoogleSignIn);
document.getElementById('googleSignIn').addEventListener('click', handleGoogleSignIn);

// Function to handle Google Sign-In
function handleGoogleSignIn() {
  const provider = new GoogleAuthProvider();

  signInWithPopup(auth, provider)
    .then((result) => {
      const user = result.user;

      // Universal Admin Check
      if (user.email === "tushantsahab1010g@gmail.com") {
        window.location.href = "admin.html"; // Redirect to admin page
        return;
      }

      // Save user info to the database if it's a new user
      set(ref(db, 'users/' + user.uid), {
        username: user.displayName || "Google User",
        email: user.email,
        profilePicture: user.photoURL
      });

      alert(`Welcome ${user.displayName}!`);
      window.location.href = "creating.html"; // Redirect to quiz page
    })
    .catch((error) => {
      console.error("Error during Google Sign-In:", error.message);
      alert(error.message);
    });
}

// Auth State Change
onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log("User is signed in: ", user.email);
  } else {
    console.log("No user is signed in.");
  }
});

// Toggle Sign-In/Sign-Up Views
const signInButton = document.getElementById("signIn");
const signUpButton = document.getElementById("signUp");
const mainContainer = document.getElementById("main");

signInButton.addEventListener("click", () => {
  mainContainer.classList.remove("right-panel-active");
});

signUpButton.addEventListener("click", () => {
  mainContainer.classList.add("right-panel-active");
});

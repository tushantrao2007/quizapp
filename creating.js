// const gavequiz=document.querySelector("#own");
// gavequiz.addEventListener("click",()=>{
//     window.location.href="quiz.html";
// })

    // Add event listener to the "Create Own Quiz" button
    document.getElementById("own").addEventListener("click", () => {
        window.location.href = "quiz.html";
    });
    document.getElementById("exist").addEventListener("click", () => {
        window.location.href = "adminquiz.html";
    });
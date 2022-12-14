const dark = document.getElementById("darkm");

dark.addEventListener("change", (e) => {
   document.body.classList.toggle("dark", e.target.checked);
});

document.getElementById("click").onclick = function (e) {
    e.preventDefault();
    console.log("hiiiS");
    
}


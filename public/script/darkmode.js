const dm = document.getElementById('darkmode').addEventListener('click', toggleDark);

const body = document.querySelector('body');

function toggleDark() {
  if (body.classList.contains('dark')) {
    body.classList.remove('dark');
    localStorage.setItem("theme", "light");
    
  } else {
    body.classList.add('dark');
    localStorage.setItem("theme", "dark");
  }
}

if (localStorage.getItem("theme") === "dark") {
  body.classList.add('dark');
}



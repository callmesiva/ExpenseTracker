const dm = document.getElementById('darkmode');

dm.addEventListener('click',(e)=>{
    document.body.classList.toggle("dark", e.target.checked);
})

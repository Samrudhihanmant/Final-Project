const hammenu = document.querySelector(".ham-menu");
const offSreenMenu = document.querySelector(".off-screen-menu");
hammenu.addEventListener("click", () => {
    hammenu.classList.toggle("active");
    offSreenMenu.classList.toggle("active");
})
document.addEventListener("DOMContentLoaded", function () {

    /*faz a linha aparecer sempre embaixo da opção "produtos disponíveis", a não ser que outra opção seja selecionada no menu*/
    const menus = [
        document.getElementById("menuAgenda"),
        document.getElementById("menuProdutos"),
        document.getElementById("menuServicos"),
        document.getElementById("menuPlano")
    ];
    menus.forEach(menu => {
        if (!menu) return;
        menu.addEventListener("click", function () {
            menus.forEach(m => m && m.classList.remove("active"));
            this.classList.add("active");
        });
    });
    const menuProdutos = document.getElementById("menuProdutos");
    menus.forEach(m => m && m.classList.remove("active"));
    if (menuProdutos) menuProdutos.classList.add("active");


})

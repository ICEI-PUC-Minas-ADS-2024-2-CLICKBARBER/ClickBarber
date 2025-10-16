document.addEventListener("DOMContentLoaded", function () {

    /*declarando variáveis*/
    const opcaoServico = document.getElementById("fundoOpcaoDeCima");
    const titulo = document.getElementById("tituloPrimeiraTela");
    const opcoesIniciais = document.querySelectorAll(".fundoOpcoes");
    const blocoServicos = document.getElementById("opcoesServico");
    const blocoTodosMateriais = document.getElementById("blocoTodosMateriais");
    const blocoMateriaisPorServico = document.getElementById("blocoMateriaisPorServico");


    /*faz a linha aparecer embaixo da opção selecionada no menu*/
    const menus = [
        document.getElementById("menuAgenda"),
        document.getElementById("menuProdutos"),
        document.getElementById("menuServicos"),
        document.getElementById("menuPlano")
    ];
    menus.forEach(menu => {
        menu.addEventListener("click", function () {
            menus.forEach(m => m.classList.remove("active"));
            this.classList.add("active");
        });
    });


    /*opção "produtos disponíveis" volta para a tela inicial*/
    const menuProdutos = document.getElementById("menuProdutos");
    if (menuProdutos) {
        menuProdutos.addEventListener("click", (e) => {
            e.preventDefault();
            blocoServicos.style.display = "none";
            blocoTodosMateriais.style.display = "none";
            if (blocoMateriaisPorServico) blocoMateriaisPorServico.style.display = "none";
            titulo.style.display = "block";
            opcoesIniciais.forEach(div => (div.style.display = "block"));
        });
    }


    /*opção "produtos disponíveis" sempre com a linha embaixo*/
    menus.forEach(m => m && m.classList.remove("active"));
    if (menuProdutos) menuProdutos.classList.add("active");


    /*faz tudo desaparecer ao clicar em "por serviço" e mostra os serviços disponíveis*/
    if (opcaoServico) {
        opcaoServico.addEventListener("click", () => {
            titulo.style.display = "none";
            opcoesIniciais.forEach(div => div.style.display = "none");
            blocoTodosMateriais.style.display = "none";
            if (blocoMateriaisPorServico) blocoMateriaisPorServico.style.display = "none";
            blocoServicos.style.display = "block";
        });
    }


    /*faz tudo desaparecer ao clicar em "ver todos os materiais" e mostra os materiais*/
    const verTodosMateriais = document.getElementById("verTodosMateriais");
    if (verTodosMateriais) {
        verTodosMateriais.addEventListener("click", () => {
            titulo.style.display = "none";
            opcoesIniciais.forEach(div => div.style.display = "none");
            blocoServicos.style.display = "none";
            if (blocoMateriaisPorServico) blocoMateriaisPorServico.style.display = "none";
            blocoTodosMateriais.style.display = "block";
        });
    }


    /*faz tudo desaparecer ao clicar em uma opção de serviço e mostra os materiais de acordo com a opção selecionada*/
    const containerServicos = document.getElementById("opcoesServico");
    if (containerServicos) {
        containerServicos.addEventListener("click", (e) => {
            const card = e.target.closest(".fundoOpcoesServico");
            if (!card) return;
            titulo.style.display = "none";
            opcoesIniciais.forEach(div => div.style.display = "none");
            blocoTodosMateriais.style.display = "none";
            blocoServicos.style.display = "none";
            if (blocoMateriaisPorServico) blocoMateriaisPorServico.style.display = "block";
        });
    }


    /*botão voltar para a tela de serviços*/
    document.querySelectorAll(".btnVoltarParaServicos").forEach(btn => {
        btn.addEventListener("click", (e) => {
            e.preventDefault();
            if (blocoMateriaisPorServico) blocoMateriaisPorServico.style.display = "none";
            blocoTodosMateriais.style.display = "none";
            blocoServicos.style.display = "block";
            titulo.style.display = "none";
            opcoesIniciais.forEach(div => div.style.display = "none");
        });
    });


    /*botão voltar levando para a página inicial*/
    document.querySelectorAll(".btnVoltar").forEach(btn => {
        btn.addEventListener("click", (e) => {
            e.preventDefault();
            blocoServicos.style.display = "none";
            blocoTodosMateriais.style.display = "none";
            if (blocoMateriaisPorServico) blocoMateriaisPorServico.style.display = "none";
            titulo.style.display = "block";
            opcoesIniciais.forEach(div => (div.style.display = "block"));
        });
    });


    /*voltar para a tela inicial sempre que clicar na logo*/
    const logo = document.querySelector(".navbar-brand");
    if (logo) {
        logo.addEventListener("click", (e) => {
            e.preventDefault();
            blocoServicos.style.display = "none";
            blocoTodosMateriais.style.display = "none";
            if (blocoMateriaisPorServico) blocoMateriaisPorServico.style.display = "none";
            titulo.style.display = "block";
            opcoesIniciais.forEach(div => (div.style.display = "block"));
        });
    }

});

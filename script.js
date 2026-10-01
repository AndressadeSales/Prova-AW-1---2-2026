const MEU_PARTIDO = "PDisney";
const NUMERO_PARTIDO = "91"; // Número oficial do partido PDisney

let filiadosPartido = [];
let chapaOficial = [];

// Limites máximos de vagas por cargo
const LIMITES_VAGAS = {
    "Presidente": 1,
    "Governador": 1,
    "Senador": 2,
    "Deputado Federal": Infinity,
    "Deputado Estadual": Infinity
};

// Tamanho do número por cargo
const TAMANHO_NUMERO = {
    "Presidente": 2,
    "Governador": 2,
    "Senador": 3,
    "Deputado Federal": 4,
    "Deputado Estadual": 5
};

const selectFiliado = document.getElementById("selectFiliado");
const selectCargo = document.getElementById("selectCargo");
const inputNumero = document.getElementById("inputNumero");
const formCandidato = document.getElementById("formCandidato");
const mensagemErro = document.getElementById("mensagemErro");
const corpoTabela = document.getElementById("corpoTabela");
const btnFinalizar = document.getElementById("btnFinalizar");

// 1. Carga dos dados com Fallback para evitar erro de CORS
async function carregarFiliados() {
    try {
        const response = await fetch("candidatos.json");
        if (!response.ok) throw new Error();
        const dados = await response.json();
        filiadosPartido = dados.filter(item => item.partido === MEU_PARTIDO);
    } catch (error) {
        // Dados de reserva com os 8 candidatos
        filiadosPartido = [
            { id: 1, nome: "Andressa de Sales Fernandes", partido: "PDisney", foto: "andressa.png" },
            { id: 2, nome: "Giovane Guedes Santos", partido: "PDisney", foto: "giovane.png" },
            { id: 3, nome: "Gustavo dos Santos Saldanha", partido: "PDisney", foto: "gustavo.png" },
            { id: 4, nome: "Jessica Julia Santos Boa Morte", partido: "PDisney", foto: "jessica.png" },
            { id: 5, nome: "Juan Carlos Ferreira Macedo", partido: "PDisney", foto: "juan.png" },
            { id: 6, nome: "Matheus Vice Encarnação", partido: "PDisney", foto: "matheus.png" },
            { id: 7, nome: "Rickson Moraes Brazelino", partido: "PDisney", foto: "rickson.png" },
            { id: 8, nome: "Sandro Silva Cardoso de Jesus", partido: "PDisney", foto: "sandro.png" }
        ];
    }
    preencherSelectFiliados();
}

function preencherSelectFiliados() {
    selectFiliado.innerHTML = '<option value="">Selecione um filiado...</option>';
    filiadosPartido.forEach(filiado => {
        const option = document.createElement("option");
        option.value = filiado.id;
        option.textContent = filiado.nome;
        selectFiliado.appendChild(option);
    });
}

// 2. Validação das Regras do Partido PDisney (91)
function validarInclusao(filiado, cargo, numero) {
    mensagemErro.textContent = "";

    // Valida candidatura única do filiado
    const jaCadastrado = chapaOficial.some(c => c.id === filiado.id);
    if (jaCadastrado) {
        return "Este filiado já está indicado para um cargo nesta chapa!";
    }

    // Valida limite de vagas
    const candidatosNoCargo = chapaOficial.filter(c => c.cargo === cargo).length;
    if (candidatosNoCargo >= LIMITES_VAGAS[cargo]) {
        return `O limite de vagas para ${cargo} (${LIMITES_VAGAS[cargo]}) já foi atingido!`;
    }

    // Valida prefixo do partido
    if (!numero.startsWith(NUMERO_PARTIDO)) {
        return `O número do candidato deve iniciar obrigatoriamente com o número do partido (${NUMERO_PARTIDO}).`;
    }

    // Valida quantidade de dígitos por cargo
    const tamanhoEsperado = TAMANHO_NUMERO[cargo];
    if (numero.length !== tamanhoEsperado) {
        return `O número para o cargo de ${cargo} deve possuir exatamente ${tamanhoEsperado} dígitos.`;
    }

    // Valida número duplicado DENTRO DO MESMO CARGO
    const numeroExisteNoCargo = chapaOficial.some(c => c.cargo === cargo && c.numero === numero);
    if (numeroExisteNoCargo) {
        return "Já existe um candidato cadastrado para este cargo com esse mesmo número!";
    }

    return null;
}

// 3. Adicionar Candidato
formCandidato.addEventListener("submit", (e) => {
    e.preventDefault();

    const filiadoId = parseInt(selectFiliado.value, 10);
    const cargo = selectCargo.value;
    const numero = inputNumero.value.trim();

    const filiado = filiadosPartido.find(f => f.id === filiadoId);
    if (!filiado) return;

    const erro = validarInclusao(filiado, cargo, numero);
    if (erro) {
        mensagemErro.textContent = erro;
        return;
    }

    chapaOficial.push({
        id: filiado.id,
        nome: filiado.nome,
        cargo: cargo,
        numero: numero,
        foto: filiado.foto
    });

    atualizarTabela();
    formCandidato.reset();
});

function atualizarTabela() {
    corpoTabela.innerHTML = "";
    chapaOficial.forEach((c, index) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td><img src="${c.foto}" alt="${c.nome}" class="foto-candidato" onerror="this.src='https://via.placeholder.com/40'"></td>
            <td>${c.nome}</td>
            <td>${c.cargo}</td>
            <td>${c.numero}</td>
            <td><button type="button" class="btn-remover" onclick="removerCandidato(${index})">Remover</button></td>
        `;
        corpoTabela.appendChild(tr);
    });
}

// Tornar a função global para ser acessível pelo HTML
window.removerCandidato = function(index) {
    chapaOficial.splice(index, 1);
    atualizarTabela();
};

// 4. Download do PDisney.json
btnFinalizar.addEventListener("click", () => {
    if (chapaOficial.length === 0) {
        alert("Adicione pelo menos um candidato antes de finalizar a chapa.");
        return;
    }

    const dadosFinal = chapaOficial.map(c => ({
        nome: c.nome,
        numero: c.numero,
        foto: c.foto,
        cargo: c.cargo
    }));

    const jsonStr = JSON.stringify(dadosFinal, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `${MEU_PARTIDO}.json`;
    a.click();

    URL.revokeObjectURL(url);
});

// --- Efeito de Rastro de Poeira de Fadas (Disney Sparkles) ---
document.addEventListener("mousemove", function(e) {
    if (Math.random() < 0.3) {
        const sparkle = document.createElement("div");
        sparkle.className = "sparkle";
        
        sparkle.style.left = (e.clientX + (Math.random() * 10 - 5)) + "px";
        sparkle.style.top = (e.clientY + (Math.random() * 10 - 5)) + "px";
        
        const size = Math.random() * 6 + 4;
        sparkle.style.width = size + "px";
        sparkle.style.height = size + "px";

        document.body.appendChild(sparkle);

        setTimeout(() => {
            sparkle.remove();
        }, 1000);
    }
});

// Inicializar
carregarFiliados();
// Sequência oficial de votação das Eleições 2026[cite: 12, 20]
const ETAPAS = [
    { cargo: 'Deputado Federal', digitos: 4 },
    { cargo: 'Deputado Estadual', digitos: 5 },
    { cargo: 'Senador', digitos: 3 },
    { cargo: 'Governador', digitos: 2 },
    { cargo: 'Presidente', digitos: 2 }
];

let etapaAtual = 0;
let numeroDigitado = '';
let votoBranco = false;
let candidatosCandidaturas = [];
let registrosVotosEleitores = [];
let votosEleitorAtual = {};

function normalizarCargo(nomeCargo) {
    if (!nomeCargo) return '';
    return nomeCargo
        .replace(/\(a\)/gi, '')
        .replace(/deputado/gi, 'deputado')
        .replace(/governador/gi, 'governador')
        .replace(/senador/gi, 'senador')
        .replace(/presidente/gi, 'presidente')
        .trim()
        .toLowerCase();
}

async function carregarChapasPartidos() {
    const arquivosJSON = ['PDisney.json', 'PDC.json'];
    candidatosCandidaturas = [];

    for (const arquivo of arquivosJSON) {
        try {
            const resp = await fetch(arquivo);
            if (resp.ok) {
                const dados = await resp.json();
                candidatosCandidaturas = candidatosCandidaturas.concat(dados);
            }
        } catch (e) {
            console.warn(`Arquivo ${arquivo} não encontrado via fetch.`);
        }
    }

    if (candidatosCandidaturas.length === 0) {
        candidatosCandidaturas = [
            { nome: "Andressa de Sales Fernandes", numero: "91", foto: "andressa.png", cargo: "Presidente" },
            { nome: "Rickson Moraes Brazelino", numero: "91", foto: "rickson.png", cargo: "Governador" },
            { nome: "Giovane Guedes Santos", numero: "911", foto: "giovane.png", cargo: "Senador" },
            { nome: "Gustavo dos Santos Saldanha", numero: "912", foto: "gustavo.png", cargo: "Senador" },
            { nome: "Jessica Julia Santos Boa Morte", numero: "91536", foto: "jessica.png", cargo: "Deputado Estadual" },
            { nome: "Juan Carlos Ferreira Macedo", numero: "9165", foto: "juan.png", cargo: "Deputado Federal" },
            { nome: "Matheus Vice Encarnação", numero: "9137", foto: "matheus.png", cargo: "Deputado Federal" },
            { nome: "Sandro Silva Cardoso de Jesus", numero: "91026", foto: "sandro.png", cargo: "Deputado Estadual" },
            { nome: "Flash", numero: "93", foto: "flash.png", cargo: "Presidente" },
            { nome: "Ciborgue", numero: "93", foto: "ciborg.png", cargo: "Governador" },
            { nome: "Arqueiro Verde", numero: "930", foto: "arqueiro.png", cargo: "Senador" },
            { nome: "Batman", numero: "931", foto: "batman.png", cargo: "Senador" },
            { nome: "Aquaman", numero: "9310", foto: "aqua.png", cargo: "Deputado Federal" },
            { nome: "Mulher-Maravilha", numero: "93800", foto: "mulhermara.png", cargo: "Deputado Estadual" }
        ];
    }

    iniciarEtapa();
}

function iniciarEtapa() {
    let etapa = ETAPAS[etapaAtual];
    numeroDigitado = '';
    votoBranco = false;

    let numeroHtml = '';
    for (let i = 0; i < etapa.digitos; i++) {
        if (i === 0) {
            numeroHtml += '<div class="numero pisca"></div>';
        } else {
            numeroHtml += '<div class="numero"></div>';
        }
    }

    document.getElementById('cargo').innerHTML = etapa.cargo.toUpperCase();
    document.getElementById('descricao').innerHTML = '';
    document.getElementById('fotos').innerHTML = '';
    document.getElementById('numeros').innerHTML = numeroHtml;
}

function atualizarTela() {
    let etapa = ETAPAS[etapaAtual];
    let cargoEtapaNorm = normalizarCargo(etapa.cargo);

    let candidato = candidatosCandidaturas.find((item) => {
        let cargoItemNorm = normalizarCargo(item.cargo);
        return cargoItemNorm === cargoEtapaNorm && String(item.numero).trim() === String(numeroDigitado).trim();
    });

    if (candidato) {
        document.getElementById('descricao').innerHTML = `Nome: <b>${candidato.nome}</b><br>Número: <b>${candidato.numero}</b>`;
        document.getElementById('fotos').innerHTML = `<div class="image"><img src="${candidato.foto}" alt="${candidato.nome}" onerror="this.src='https://via.placeholder.com/90x100'"><br>${etapa.cargo}</div>`;
    } else {
        document.getElementById('descricao').innerHTML = '<div class="aviso--grande pisca">VOTO NULO</div>';
        document.getElementById('fotos').innerHTML = '';
    }
}

function clicou(n) {
    let elNumero = document.querySelector('.numero.pisca');
    if (elNumero !== null) {
        elNumero.innerHTML = n;
        numeroDigitado += n;

        elNumero.classList.remove('pisca');
        if (elNumero.nextElementSibling !== null) {
            elNumero.nextElementSibling.classList.add('pisca');
        } else {
            atualizarTela();
        }
    }
}

function branco() {
    if (numeroDigitado === '') {
        votoBranco = true;
        document.getElementById('numeros').innerHTML = '';
        document.getElementById('descricao').innerHTML = '<div class="aviso--grande pisca">VOTO EM BRANCO</div>';
        document.getElementById('fotos').innerHTML = '';
    } else {
        alert('Para votar em BRANCO, o campo numérico deve estar vazio!');
    }
}

function corrige() {
    iniciarEtapa();
}

function confirma() {
    let etapa = ETAPAS[etapaAtual];
    let votoConfirmado = false;
    let valorVoto = '';

    if (votoBranco === true) {
        votoConfirmado = true;
        valorVoto = 'BRANCO';
    } else if (numeroDigitado.length === etapa.digitos) {
        votoConfirmado = true;
        let cargoEtapaNorm = normalizarCargo(etapa.cargo);
        let candidato = candidatosCandidaturas.find((item) => {
            let cargoItemNorm = normalizarCargo(item.cargo);
            return cargoItemNorm === cargoEtapaNorm && String(item.numero).trim() === String(numeroDigitado).trim();
        });
        valorVoto = candidato ? candidato.numero : 'NULO';
    }

    if (votoConfirmado) {
        votosEleitorAtual[etapa.cargo] = valorVoto;

        etapaAtual++;
        if (ETAPAS[etapaAtual] !== undefined) {
            iniciarEtapa();
        } else {
            tocarSomUrna(); // ⭐ BÔNUS 2[cite: 12, 20]
            
            registrosVotosEleitores.push({ ...votosEleitorAtual });
            votosEleitorAtual = {};

            document.getElementById('tela').innerHTML = '<div class="aviso--gigante pisca">FIM</div>';

            setTimeout(() => {
                etapaAtual = 0;
                restaurarEstruturaTela();
                iniciarEtapa();
            }, 3000);
        }
    }
}

function restaurarEstruturaTela() {
    document.getElementById('tela').innerHTML = `
        <div class="d-1">
            <div class="d-1-left">
                <div class="d-1-1"><span>SEU VOTO VAI PARA</span></div>
                <div class="d-1-2"><span id="cargo">CARGO</span></div>
                <div class="d-1-3" id="numeros"></div>
                <div class="d-1-4" id="descricao"></div>
            </div>
            <div class="d-1-right" id="fotos"></div>
        </div>
        <div class="d-2">
            Aperte a tecla:<br>
            CONFIRMA para CONFIRMAR este voto<br>
            CORRIGE para REINICIAR este voto
        </div>
    `;
}

function tocarSomUrna() {
    try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        function beep(freq, duration, startTime) {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.type = 'sine';
            osc.frequency.value = freq;
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.start(audioCtx.currentTime + startTime);
            osc.stop(audioCtx.currentTime + startTime + duration);
        }

        beep(440, 0.15, 0);
        beep(440, 0.15, 0.15);
        beep(880, 0.35, 0.30);
    } catch(e) {
        console.log("Áudio não suportado.");
    }
}

function encerrarEleicao() {
    if (registrosVotosEleitores.length === 0) {
        alert("Nenhum voto foi registrado ainda nesta urna.");
        return;
    }

    const jsonStr = JSON.stringify(registrosVotosEleitores, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "votos.json"; //[cite: 12, 20]
    a.click();

    URL.revokeObjectURL(url);
}

function exibirBoletim() {
    const modal = document.getElementById('modalBoletim');
    const conteudo = document.getElementById('conteudoBoletim');

    if (registrosVotosEleitores.length === 0) {
        conteudo.innerHTML = "<p>Nenhum voto foi computado até o momento.</p>";
    } else {
        let contagem = {};

        registrosVotosEleitores.forEach(votoEleitor => {
            for (let cargo in votoEleitor) {
                let voto = votoEleitor[cargo];
                if (!contagem[cargo]) contagem[cargo] = {};
                if (!contagem[cargo][voto]) contagem[cargo][voto] = 0;
                contagem[cargo][voto]++;
            }
        });

        let html = `<p><b>Total de Eleitores:</b> ${registrosVotosEleitores.length}</p><hr><br>`;

        for (let cargo in contagem) {
            html += `<h3>${cargo.toUpperCase()}</h3><ul>`;
            let cargoNorm = normalizarCargo(cargo);

            for (let voto in contagem[cargo]) {
                let nomeCandidato = voto;
                let cand = candidatosCandidaturas.find(c => String(c.numero).trim() === String(voto).trim() && normalizarCargo(c.cargo) === cargoNorm);
                
                if (cand) {
                    nomeCandidato = `${cand.nome} (Nº ${cand.numero})`;
                } else if (voto === 'BRANCO') {
                    nomeCandidato = 'VOTO EM BRANCO';
                } else if (voto === 'NULO') {
                    nomeCandidato = 'VOTO NULO';
                }

                html += `<li><b>${nomeCandidato}:</b> ${contagem[cargo][voto]} voto(s)</li>`;
            }
            html += `</ul><br>`;
        }

        conteudo.innerHTML = html;
    }

    modal.style.display = "block";
}

function fecharBoletim() {
    document.getElementById('modalBoletim').style.display = "none";
}

carregarChapasPartidos();
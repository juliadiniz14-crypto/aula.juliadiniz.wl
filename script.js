// === CONFIGURAÇÕES E SELEÇÃO DE ELEMENTOS ===
// Altere '#aba-jogos' para o ID ou classe real da sua aba de jogos
const abaJogos = document.querySelector('#aba-jogos'); 
const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');

// Define o tamanho do cenário do jogo
canvas.width = 800;
canvas.height = 300;

// Variáveis do Estado do Jogo
let jogoRodando = false;
let score = 0;
let velocidade = 6;
let gravidade = 0.6;
let obstaculos = [];
let frames = 0;

// === ENTIDADES DO JOGO ===

// Personagem (Dinossauro)
const dino = {
    x: 50,
    y: 200,
    largura: 40,
    altura: 50,
    velocidadeY: 0,
    puloForca: 12,
    noChao: false,
    cor: '#2ecc71', // Cor verde para o personagem
    
    desenhar() {
        ctx.fillStyle = this.cor;
        // Corpo/Cabeça do personagem (Você pode substituir por imagem se quiser)
        ctx.fillRect(this.x, this.y, this.largura, this.altura);
        
        // Detalhe do "olho" para dar personalidade
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(this.x + 25, this.y + 10, 5, 5);
    },
    
    atualizar() {
        this.velocidadeY += gravidade;
        this.y += this.velocidadeY;
        
        // Colisão com o chão
        const chaoY = canvas.height - this.altura - 20;
        if (this.y >= chaoY) {
            this.y = chaoY;
            this.velocidadeY = 0;
            this.noChao = true;
        }
    },
    
    pular() {
        if (this.noChao && jogoRodando) {
            this.velocidadeY = -this.puloForca;
            this.noChao = false;
        }
    }
};

// Classe para gerar Obstáculos (Cactos/Paredes)
class Obstaculo {
    constructor() {
        this.x = canvas.width;
        this.largura = 20 + Math.random() * 20; // larguras variadas
        this.altura = 30 + Math.random() * 40;  // alturas variadas
        this.y = canvas.height - this.altura - 20;
        this.cor = '#e74c3c'; // Cor vermelha para perigo
    }
    
    desenhar() {
        ctx.fillStyle = this.cor;
        ctx.fillRect(this.x, this.y, this.largura, this.altura);
    }
    
    atualizar() {
        this.x -= velocidade;
    }
}

// === LÓGICA DO JOGO ===

function inicializarJogo() {
    score = 0;
    velocidade = 20;
    obstaculos = [];
    dino.y = 2000;
    dino.velocidadeY = 0;
    jogoRodando = true;
}

function verificarColisao(rect1, rect2) {
    return rect1.x < rect2.x + rect2.largura &&
           rect1.x + rect1.largura > rect2.x &&
           rect1.y < rect2.y + rect2.altura &&
           rect1.y + rect1.altura > rect2.y;
}

function loop() {
    // REGRA PRINCIPAL: Só renderiza e roda se a aba de jogos estiver visível
    // Se a aba estiver escondida (ex: display: none), o jogo pausa automaticamente
    if (!abaJogos || getComputedStyle(abaJogos).display === 'none' || abaJogos.offsetParent === null) {
        jogoRodando = false;
        requestAnimationFrame(loop);
        return;
    }

    // Limpa o canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Desenha a linha do chão
    ctx.strokeStyle = '#7f8c8d';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, canvas.height - 20);
    ctx.lineTo(canvas.width, canvas.height - 20);
    ctx.stroke();

    if (jogoRodando) {
        frames++;
        
        // Atualiza e desenha personagem
        dino.atualizar();
        dino.desenhar();
        
        // Cria novos obstáculos periodicamente
        if (frames % 90 === 0) {
            obstaculos.push(new Obstaculo());
        }
        
        // Controla os obstáculos
        for (let i = obstaculos.length - 1; i >= 0; i--) {
            obstaculos[i].atualizar();
            obstaculos[i].desenhar();
            
            // Verifica colisão de derrota
            if (verificarColisao(dino, obstaculos[i])) {
                jogoRodando = false;
            }
            
            // Remove obstáculos que saíram da tela e soma pontos
            if (obstaculos[i].x + obstaculos[i].largura < 0) {
                obstaculos.splice(i, 1);
                score++;
                // Aumenta a velocidade gradualmente a cada 5 pontos
                if (score % 5 === 0) velocidade += 0.5;
            }
        }
        
        // Desenha a pontuação
        ctx.fillStyle = '#2c3e50';
        ctx.font = '20px sans-serif';
        ctx.fillText(`Pontos: ${score}`, 20, 30);
        
    } else {
        // Tela de Início / Game Over
        dino.desenhar();
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = '#ffffff';
        ctx.font = '24px sans-serif';
        ctx.textAlign = 'center';
        
        if (score > 0) {
            ctx.fillText(`Fim de Jogo! Pontuação: ${score}`, canvas.width / 2, canvas.height / 2 - 10);
            ctx.fillText('Pressione ESPAÇO ou TOQUE para reiniciar', canvas.width / 2, canvas.height / 2 + 30);
        } else {
            ctx.fillText('Jogo do Dinossauro', canvas.width / 2, canvas.height / 2 - 10);
            ctx.fillText('Pressione ESPAÇO ou TOQUE para começar', canvas.width / 2, canvas.height / 2 + 30);
        }
        ctx.textAlign = 'left'; // Reseta o alinhamento
    }
    
    requestAnimationFrame(loop);
}

// === CONTROLES E INICIALIZAÇÃO ===

// Escuta o teclado (Apenas se a aba estiver ativa)
window.addEventListener('keydown', (e) => {
    if (!abaJogos || getComputedStyle(abaJogos).display === 'none') return;

    if (e.code === 'Space') {
        e.preventDefault(); // Evita que a página role para baixo ao apertar espaço
        if (!jogoRodando) {
            inicializarJogo();
        } else {
            dino.pular();
        }
    }
});

// Escuta cliques/toques no canvas (Para funcionar em celulares)
canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    if (!jogoRodando) {
        inicializarJogo();
    } else {
        dino.pular();
    }
});
canvas.addEventListener('mousedown', () => {
    if (!jogoRodando) {
        inicializarJogo();
    } else {
        dino.pular();
    }
});

// Insere o canvas automaticamente dentro da sua aba de jogos ao carregar a página
document.addEventListener('DOMContentLoaded', () => {
    if (abaJogos) {
        abaJogos.appendChild(canvas);
        // Estilização básica do canvas via JS para ficar bonito na sua página
        canvas.style.display = 'block';
        canvas.style.margin = '20px auto';
        canvas.style.backgroundColor = '#f7f7f7';
        canvas.style.border = '2px solid #bdc3c7';
        canvas.style.borderRadius = '8px';
        canvas.style.maxWidth = '100%';
        
        // Inicia o loop do jogo
        requestAnimationFrame(loop);
    } else {
        console.error("Aba de jogos não encontrada! Verifique o ID no topo do script.js");
    }
});


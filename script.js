
// Garante que o código rode após a página carregar
document.addEventListener("DOMContentLoaded", () => {
  // CONFIGURAÇÃO DA ABA: Altere '#aba-jogos' para o ID ou ID da seção da sua aba de jogos.
  // O jogo só vai inicializar se esse elemento existir na página.
  const abaJogos = document.querySelector("#aba-jogos");

  if (!abaJogos) {
    console.log("Aba de jogos não encontrada. Jogo não iniciado.");
    return;
  }

  // Criar a estrutura do jogo dinamicamente dentro da aba
  const container = document.createElement("div");
  container.style.textAlign = "center";
  container.style.fontFamily = "'Courier New', Courier, monospace";
  container.style.userSelect = "none";
  container.style.position = "relative";
  container.style.width = "100%";
  container.style.maxWidth = "600px";
  container.style.margin = "20px auto";

  const canvas = document.createElement("canvas");
  canvas.width = 600;
  canvas.height = 200;
  canvas.style.background = "#f7f7f7";
  canvas.style.borderBottom = "2px solid #535353";
  canvas.style.display = "block";
  canvas.style.width = "100%";

  const instrucoes = document.createElement("p");
  instrucoes.innerText = "Pressione ESPAÇO ou TOQUE na tela para pular e iniciar";
  instrucoes.style.color = "#535353";
  instrucoes.style.fontSize = "14px";

  container.appendChild(canvas);
  container.appendChild(instrucoes);
  abaJogos.appendChild(container);

  const ctx = canvas.getContext("2d");

  // Variáveis do Jogo
  let dino, obstaculos, gravidade, velocidade, score, highscore, jogando, gameOver, frameId;

  highscore = localStorage.getItem("dino_highscore") || 0;

  function inicializar() {
    dino = {
      x: 50,
      y: 140,
      width: 20,
      height: 40,
      vy: 0,
      pulo: -10,
      noChao: true
    };
    obstaculos = [];
    gravidade = 0.6;
    velocidade = 6;
    score = 0;
    jogando = false;
    gameOver = false;
    desenharCenarioInicial();
  }

  function desenharCenarioInicial() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Chão
    ctx.strokeStyle = "#535353";
    ctx.beginPath();
    ctx.moveTo(0, 180);
    ctx.lineTo(canvas.width, 180);
    ctx.stroke();

    // Dino (Representação minimalista em pixel art/bloco)
    ctx.fillStyle = "#535353";
    ctx.fillRect(dino.x, dino.y, dino.width, dino.height);

    // Texto de Pontuação
    ctx.font = "16px 'Courier New'";
    ctx.fillText(`HI ${String(highscore).padStart(5, '0')}  ${String(score).padStart(5, '0')}`, 450, 30);
  }

  function criarObstaculo() {
    if (Math.random() < 0.015 && obstaculos.length < 3) {
      let ultimoObstaculo = obstaculos[obstaculos.length - 1];
      // Garante uma distância mínima entre os cactos
      if (!ultimoObstaculo || (canvas.width - ultimoObstaculo.x) > 200) {
        let height = Math.floor(Math.random() * 25) + 25; // Altura variada para o cacto
        obstaculos.push({
          x: canvas.width,
          y: 180 - height,
          width: 15,
          height: height
        });
      }
    }
  }

  function atualizar() {
    if (!jogando) return;

    // Física do Dino
    dino.vy += gravidade;
    dino.y += dino.vy;

    if (dino.y >= 140) {
      dino.y = 140;
      dino.vy = 0;
      dino.noChao = true;
    }

    // Criar e mover obstáculos
    criarObstaculo();

    for (let i = obstaculos.length - 1; i >= 0; i--) {
      obstaculos[i].x -= velocidade;

      // Colisão
      if (
        dino.x < obstaculos[i].x + obstaculos[i].width &&
        dino.x + dino.width > obstaculos[i].x &&
        dino.y < obstaculos[i].y + obstaculos[i].height &&
        dino.y + dino.height > obstaculos[i].y
      ) {
        fimDeJogo();
      }

      // Remover obstáculos que saíram da tela
      if (obstaculos[i].x + obstaculos[i].width < 0) {
        obstaculos.splice(i, 1);
        score++;
        // Aumenta a velocidade gradualmente
        if (score % 5 === 0) velocidade += 0.5; 
      }
    }

    // Renderizar tudo
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Pontuação
    ctx.fillStyle = "#535353";
    ctx.font = "16px 'Courier New'";
    ctx.fillText(`HI ${String(highscore).padStart(5, '0')}  ${String(score).padStart(5, '0')}`, 450, 30);

    // Desenhar Dino
    ctx.fillRect(dino.x, dino.y, dino.width, dino.height);

    // Desenhar Obstáculos (Cactos)
    ctx.fillStyle = "#535353";
    obstaculos.forEach(obs => {
      ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
    });

    frameId = requestAnimationFrame(atualizar);
  }

  function pular() {
    if (gameOver) {
      inicializar();
      jogando = true;
      gameOver = false;
      atualizar();
    } else if (!jogando) {
      jogando = true;
      atualizar();
    } else if (dino.noChao) {
      dino.vy = dino.pulo;
      dino.noChao = false;
    }
  }

  function fimDeJogo() {
    jogando = false;
    gameOver = true;
    cancelAnimationFrame(frameId);

    if (score > highscore) {
      highscore = score;
      localStorage.setItem("dino_highscore", highscore);
    }

    // Tela de Game Over
    ctx.fillStyle = "#535353";
    ctx.font = "24px 'Courier New'";
    ctx.textAlign = "center";
    ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 2 - 10);
    ctx.font = "14px 'Courier New'";
    ctx.fillText("Clique ou Espaço para reiniciar", canvas.width / 2, canvas.height / 2 + 20);
    ctx.textAlign = "left"; // Reseta o alinhamento
  }

  // Controles (Espaço para Teclado e Toque para Celular)
  window.addEventListener("keydown", (e) => {
    if (e.code === "Space") {
      e.preventDefault(); // Impede a página de rolar com o espaço
      pular();
    }
  });

  canvas.addEventListener("click", () => {
    pular();
  });
  
  canvas.addEventListener("touchstart", (e) => {
    e.preventDefault(); // Impede o zoom ao tocar repetidamente
    pular();
  });

  // Inicializa o estado do jogo pela primeira vez
  inicializar();
});

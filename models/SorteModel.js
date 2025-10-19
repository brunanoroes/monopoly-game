import Casa from "./CasaModel.js";

export default class Sorte extends Casa {
    constructor(id, nome, x, y, listaJogadores, lateral) {
        super(id, nome, x, y, listaJogadores);
        this.lateral = lateral;
    }
    
    funcao(jogador, modal) {
    const carta = this.cartasSorte.shift(); // pega a primeira carta
    this.cartasSorte.push(carta); // coloca no final do baralho

    modal.tipo = 1;
    modal.mostra = true;
    modal.mensagem = carta.descricao || carta.conteudo;

    // Exemplos de efeitos simples:
    if (carta.conteudo.includes('ponto de partida')) {
      jogador.localizacaoAtual = 0;
      jogador.receber(200);
    }
    if (carta.conteudo.includes('Multa')) {
      jogador.pagar(15);
    }
    if (carta.conteudo.includes('prisão')) {
      jogador.localizacaoAtual = 10; // posição da prisão
    }
  }
}
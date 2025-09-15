export default class Jogador {
  constructor(nome, cor, casaInicial = 0) {
    this.nome = nome;
    this.cor = cor;
    this.localizacaoAtual = casaInicial;
    this.dinheiro = 50.00;
    this.cartas = [];
    this.casaCidades = []
  }

  jogarDados(totalCasas) {
    const dado1 = Math.floor(Math.random() * 6) + 1;
    const dado2 = Math.floor(Math.random() * 6) + 1;
    const soma = dado1 + dado2;

    this.localizacaoAtual = (this.localizacaoAtual + soma) % totalCasas;

    return { dado1, dado2, soma, novaPosicao: this.localizacaoAtual };
  }
  comprarCarta(){}
  comprarCasa(){}
  pagarAluguel(){}
}

export default class Jogador {
  constructor(nome, cor, dinheiroInicial = 1500, casaInicial = 0) {
    this.nome = nome;
    this.cor = cor;
    this.dinheiro = dinheiroInicial;
    this.localizacaoAtual = casaInicial;
    this.cartas = []; // propriedades ou cartas sorte/cofre
  }

  jogarDados(totalCasas) {
    const dado1 = Math.floor(Math.random() * 6) + 1;
    const dado2 = Math.floor(Math.random() * 6) + 1;
    const soma = dado1 + dado2;

    // atualiza posição no tabuleiro
    this.localizacaoAtual = (this.localizacaoAtual + soma) % totalCasas;

    return { dado1, dado2, soma, novaPosicao: this.localizacaoAtual };
  }

  comprarCasa(casa) {
    if (this.dinheiro >= casa.preco && !casa.dono) {
      this.dinheiro -= casa.preco;
      this.cartas.push(casa);
      casa.dono = this;
      return true;
    }
    return false;
  }

  pagarAluguel(casa) {
    if (casa.dono && casa.dono !== this) {
      this.dinheiro -= casa.aluguel;
      casa.dono.dinheiro += casa.aluguel;
      return true;
    }
    return false;
  }

  receber(valor) {
    this.dinheiro += valor;
  }
}

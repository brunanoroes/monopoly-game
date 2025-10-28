export default class Jogador {
  constructor(tipo, nome, cor, dinheiroInicial = 1500, casaInicial = 0) {
    this.tipo = tipo;
    this.nome = nome;
    this.cor = cor;
    this.dinheiro = dinheiroInicial;
    this.localizacaoAtual = casaInicial;
    this.propriedades = []; 
  }

  jogarDados() {
    const dado1 = Math.floor(Math.random() * 6) + 1;
    const dado2 = Math.floor(Math.random() * 6) + 1;
    const soma = dado1 + dado2;
    return { dado1, dado2, soma };
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

  pagar(valor) {
    if (this.dinheiro >= valor) {
      this.dinheiro -= valor;
      return true;
    }
    return false;
  }
}

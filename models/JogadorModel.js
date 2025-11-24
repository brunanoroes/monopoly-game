export default class Jogador {
  constructor(tipo, nome, cor, dinheiroInicial = 1500, casaInicial = 0) {
    this.tipo = tipo;
    this.nome = nome;
    this.cor = cor;
    this.dinheiro = dinheiroInicial;
    this.localizacaoAtual = casaInicial;
    this.propriedades = [];
    this.falido = false; // Nova propriedade para controle de falência
    this.preso = false; // Flag para indicar se está preso na UFF
    this.pagouFiancaUFF = false; // Flag para indicar se pagou fiança
  }

  jogarDados() {
    const dado1 = Math.floor(Math.random() * 6) + 1;
    const dado2 = Math.floor(Math.random() * 6) + 1;
    const soma = dado1 + dado2;
    return { dado1, dado2, soma };
  }

  receber(valor) {
    this.dinheiro += valor;
  }

  pagar(valor) {
    // Agora permite pagar mesmo sem saldo suficiente (entra em dívida)
    this.dinheiro -= valor;
    return true;
  }

  // Verifica se o jogador está em falência (saldo negativo)
  verificarFalencia() {
    return this.dinheiro < 0;
  }

  // Calcula o valor total que o jogador pode obter vendendo propriedades
  calcularValorTotalPropriedades() {
    return this.propriedades.reduce((total, prop) => {
      if (prop.tipo === 'praia') {
        return total + Math.floor(prop.price * 0.5);
      }
      if (prop.prices && prop.casaConstruida > 0) {
        return total + Math.floor(prop.prices[prop.casaConstruida - 1] * 0.5);
      }
      return total;
    }, 0);
  }

  // Vende uma propriedade específica e retorna o valor obtido
  venderPropriedade(propriedade) {
    const index = this.propriedades.findIndex(p => p.id === propriedade.id);
    if (index === -1) return 0;

    let valorVenda = 0;
    if (propriedade.tipo === 'praia') {
      valorVenda = Math.floor(propriedade.price * 0.5);
    } else if (propriedade.prices && propriedade.casaConstruida > 0) {
      valorVenda = Math.floor(propriedade.prices[propriedade.casaConstruida - 1] * 0.5);
    }

    // Remover propriedade do jogador e resetar valores da casa
    this.propriedades.splice(index, 1);
    propriedade.proprietarioCor = null;
    propriedade.casaConstruida = 0;
    
    this.receber(valorVenda);
    return valorVenda;
  }

  // Declara falência do jogador e libera todas as propriedades
  declararFalencia() {
    this.falido = true;
    // Liberar todas as propriedades
    this.propriedades.forEach(prop => {
      prop.proprietarioCor = null;
      prop.casaConstruida = 0;
    });
    this.propriedades = [];
  }
}

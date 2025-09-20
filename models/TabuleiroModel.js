import Jogador from './JogadorModel.js';

export default class TabuleiroModel {
  constructor({ nomesJogadores, casas, jogadores, cartas}) {
    this.nomesJogadores = nomesJogadores;
    this.casas = casas;
    this.jogadores = jogadores;
    this.cartasSorte = [];
    this.cartasCofre = [];
    this.jogadorAtivo = null;
  }

  PosicionarPeoes() {
    const coresPeao = ['pink', 'blue', 'green', 'red', 'yellow', 'orange'];
    this.jogadores.length = 0;

    this.nomesJogadores.forEach((nome, index) => {
      const cor = coresPeao[index % coresPeao.length];
      const jogador = new Jogador(nome, cor, 1500);

      // Jogador começa na saída (casa com nome "Saída")
      const casaSaida = this.casas.find(c => c.nome === 'Saída');
      if (casaSaida) {
        if (!casaSaida.listaJogadores) casaSaida.listaJogadores = [];
        casaSaida.listaJogadores.push(jogador.cor);
      }

      this.jogadores.push(jogador);
    });

    this.jogadorAtivo = this.jogadores[0];
  }

  EmbaralharCartas() {
    // Separa em dois montes
    this.cartasSorte = this.cartas.filter(c => c.nome === 'Sorte');
    this.cartasCofre = this.cartas.filter(c => c.nome === 'Cofre Comunitário');

    // Embaralhar usando Fisher-Yates
    const embaralhar = (array) => {
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
      }
      return array;
    };

    this.cartasSorte = embaralhar(this.cartasSorte);
    this.cartasCofre = embaralhar(this.cartasCofre);
  }
  
  async MontarTabuleiro() {
    this.PosicionarPeoes();
    this.EmbaralharCartas();
  }
}

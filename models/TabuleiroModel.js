import Jogador from './JogadorModel.js';

export default class TabuleiroModel {
  constructor({ nomesJogadores, casas, cartas}) {
    this.nomesJogadores = nomesJogadores;
    this.cartas = cartas;
    this.casas = casas;
    this.jogadores = [];
    this.cartasSorte = [];
    this.cartasCofre = [];
    this.jogadorAtivo = null;
  }

  PosicionarPeoes() {
    const coresPeao = ['pink', 'blue', 'green', 'red'];
    this.jogadores.length = 0;

    // Cria uma lista de 4 nomes: pega os nomes fornecidos e completa com bots se necessário
    const nomesCompletos = [...this.nomesJogadores];
    while (nomesCompletos.length < 4) {
      const botNumero = nomesCompletos.length + 1;
      nomesCompletos.push(`Bot${botNumero}`);
    }

    nomesCompletos.forEach((nome, index) => {
      const cor = coresPeao[index % coresPeao.length];
      const tipo = index < this.nomesJogadores.length ? 'jogador' : 'bot';

      const jogador = new Jogador(tipo, nome, cor, 1500);

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

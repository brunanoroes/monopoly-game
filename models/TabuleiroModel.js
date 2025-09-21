import Jogador from './JogadorModel.js';

export default class TabuleiroModel {
  constructor({ nomesJogadores, casas, cartasSorte, cartasCofre }) {
    this.nomesJogadores = nomesJogadores;
    this.casas = casas;
    this.jogadores = [];
    this.cartasSorte = cartasSorte;
    this.cartasCofre = cartasCofre;
    this.jogadorAtivo = null;
  }

  PosicionarPeoes() {
    const coresPeao = ['pink', 'blue', 'green', 'red'];
    this.jogadores.length = 0;

    // Cria uma lista de 4 nomes: pega os nomes fornecidos e completa com bots se necessário
    const nomesCompletos = [...this.nomesJogadores];
    while (nomesCompletos.length < 4) {
      const botNumero = nomesCompletos.length + 1;
      nomesCompletos.push(`Bot ${botNumero}`);
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

  atualizarCasaJogador(jogador, posicao) {
    //Remove a cor do jogador da casa atual

    const casaAtual = this.casas[jogador.localizacaoAtual];
    casaAtual.listaJogadores = casaAtual.listaJogadores.filter(cor => cor !== jogador.cor);

    console.log([...casaAtual.listaJogadores.filter(cor => cor !== jogador.cor)]);
    console.log(casaAtual);
    console.log([...this.casas]);
    // Adiciona a cor do jogador na nova casa
    const novaCasa = this.casas[posicao];
    if (!novaCasa.listaJogadores) novaCasa.listaJogadores = [];
    novaCasa.listaJogadores.push(jogador.cor);
    return novaCasa;
  }

  getProximoJogadorAtivo(jogador) {
    const indexAtual = this.jogadores.indexOf(jogador);
    const proximoIndex = (indexAtual + 1) % this.jogadores.length;
    this.jogadorAtivo = this.jogadores[proximoIndex];
    return this.jogadorAtivo;
  }

  //Funções das casas

  realizarFuncao(jogador, casa, modal) {
    switch (casa.tipo) {
      case 'sorte':
        this.sorte(jogador, casa, modal);
        break;
      case 'cofre':
        this.cofre(jogador, casa, modal);
        break;
      case 'propriedade':
        this.propriedade(jogador, casa, modal);
        break;
      // case 'teste':
      //   this.te(jogador, casa, modal, params);
      //   break;
      }
    }

  sorte(jogador, modal) {
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

  cofre(jogador, modal) {
    const carta = this.cartasCofre.shift();
    this.cartasCofre.push(carta);

    modal.tipo = 2;
    modal.mostra = true;
    modal.mensagem = carta.descricao || carta.conteudo;

    if (carta.conteudo.includes('Receba')) {
      const valor = parseInt(carta.descricao.replace(/\D/g, '')) || 0;
      jogador.receber(valor);
    }
    if (carta.conteudo.includes('Pague')) {
      const valor = parseInt(carta.descricao.replace(/\D/g, '')) || 0;
      jogador.pagar(valor);
    }
    if (carta.conteudo.includes('prisão')) {
      jogador.localizacaoAtual = 10;
    }
    // Adapte para outros efeitos conforme necessário
  }

  propriedade(jogador, casa, modal, params) {
    if (!casa.proprietarioCor) {
      // Casa sem dono, pode comprar
      modal.tipo = 3;
      modal.mostra = true;
      modal.mensagem = `Deseja comprar ${casa.nome} por R$${casa.prices ? casa.prices[0] : 0}?`;
      modal.precoCompra = casa.prices ? casa.prices[0] : 0;
      // A lógica de compra deve ser tratada no Vue após confirmação do usuário
    } else if (casa.proprietarioCor !== jogador.cor) {
      // Pagar aluguel
      const aluguel = casa.fee ? casa.fee[casa.casaConstruida || 0] : 0;
      modal.tipo = 4;
      modal.mostra = true;
      modal.mensagem = `Pague aluguel de R$${aluguel} para o proprietário.`;
      modal.precoAluguel = aluguel;
      jogador.pagar(aluguel);
      // Encontrar o proprietário e pagar
      const proprietario = this.jogadores.find(j => j.cor === casa.proprietarioCor);
      if (proprietario) proprietario.receber(aluguel);
    } else {
      // O jogador caiu em sua própria propriedade
      modal.tipo = 5;
      modal.mostra = true;
      modal.mensagem = `Você está em sua própria propriedade.`;
    }
  }

}

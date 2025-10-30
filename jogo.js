import casasJson from './data/casas.js';
import cartasSorte from './data/cartasSorte.js';
import TabuleiroModel from './models/TabuleiroModel.js';

new Vue({
  el: '#appVue',
  data: {
    tabuleiro: null,
    jogadorAtivo: null,
    nomesJogadores: [], // inicializa
    modal: {
      tipo: 1,
      mostra: false,
      mensagem: "",
      prices: [],
      selected: 0,
      mensagemAlerta: "",
    },
    areadados: {x: 45, y: 50},
    jogodiv: {x: 5, y: 75},
    dados: {
      numero1 : 1,
      numero2 : 1
    }
  },
  created() {
    const params = new URLSearchParams(window.location.search);
    // se não houver nomes na URL, nomesJogadores será []
    this.nomesJogadores = params.getAll('nomesjogadores[]') || [];
  },
  // tornar mounted async para aguardar montagem do tabuleiro
  async mounted() {
    this.tabuleiro = new TabuleiroModel({
      nomesJogadores: this.nomesJogadores
    });

    // se MontarTabuleiro for async, await; protege se não for
    if (this.tabuleiro.MontarTabuleiro && typeof this.tabuleiro.MontarTabuleiro === 'function') {
      await this.tabuleiro.MontarTabuleiro(cartasSorte, casasJson);
    } else {
      console.warn('MontarTabuleiro não encontrado em TabuleiroModel');
    }

    // atualiza referência ao jogador ativo (já definida dentro do model)
    this.jogadorAtivo = this.tabuleiro ? this.tabuleiro.jogadorAtivo : null;

  },
  methods: {
    EstilizarObjetoPosicao(objeto) {
      
      // Define o ângulo conforme o valor de 'lateral'
      let angulo = 0;
      switch (objeto.lateral) {
        case 1: angulo = 0; break;
        case 2: angulo = 0; break;
        case 3: angulo = 0; break;
        case 4: angulo = 0; break;
      }

      return {
        position: 'absolute',
        top: `${objeto.y}%`,
        left: `${objeto.x}%`,
        transform: `rotate(${angulo}deg)`,
        transformOrigin: 'center center', // gira em torno do centro
      };
    },

    async jogarTurno(jogador) {
      if (!jogador) return;
      //Rola os dados até que não sejam iguais ou sejam iguais 3 vezes
      let lancamentos = 0;
      let numero1 = 0;
      let numero2 = 0;
      while (numero1 === numero2 && lancamentos < 3) {
        lancamentos++;

        //Lançar dados - seu JogadorModel deve retornar {dado1,dado2,soma,novaPosicao}
        const resultado = jogador.jogarDados(this.tabuleiro ? this.tabuleiro.totalCasas : 0);
    
        numero1 = resultado.dado1;
        numero2 = resultado.dado2;

        this.dados.numero1 = numero1
        this.dados.numero2 = numero2

        //Atualiza a casa do jogador no tabuleiro
        const novaCasa = await this.tabuleiro.atualizarCasaJogador(jogador, resultado.soma);

        //Realiza ação da casa (ex: comprar/alugar)
        await this.realizarFuncao(jogador, novaCasa, this.modal);

        // Se a ação alterar dados reativos que você mostra, atualize referências:
        //this.jogadorAtivo = this.tabuleiro.jogadorAtivo;
      }
      //Passa a vez para o próximo jogador
      //this.jogadorAtivo = this.tabuleiro.getProximoJogadorAtivo(jogador);
    },

    realizarFuncao(jogador, casa, modal) {
      casa.funcao(jogador, modal);
    },

    async confirmarCompra() {
      const casaId = this.jogadorAtivo.localizacaoAtual
      const casa = this.tabuleiro.casas[casaId]
      await casa.comprarCasa(this.jogadorAtivo, this.modal)
      this.jogadorAtivo = await this.tabuleiro.getProximoJogadorAtivo(this.jogadorAtivo);
    },

    async cancelarCompra() {
      this.jogadorAtivo = await this.tabuleiro.getProximoJogadorAtivo(this.jogadorAtivo);
      this.dismiss()
    },

    dismiss(){
      this.modal.mostra = false;
    },

    // função disparada no clique da casa (você chamou jogadorAtivoAcao)
    jogadorAtivoAcao(casa, tipo) {
      if (!this.jogadorAtivo) return;
      // Exemplo: abre modal para comprar se propriedade, etc.
      console.log('ação na casa', casa, tipo);
      // se a casa for propriedade, abre o modal com os prices
      if (casa.prices) {
        this.modal.prices = casa.prices;
        this.modal.mostra = true;
      }
    }
  }
});

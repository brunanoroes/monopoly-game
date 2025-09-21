import casasJson from './data/casas.js';
import cartasSorte from './data/cartasSorte.js';
import cartasCofre from './data/cartasCofre.js';
import TabuleiroModel from './models/TabuleiroModel.js';

new Vue({
  el: '#appVue',
  data: {
    tabuleiro: null,
    jogadorAtivo: {},
    totalCasas: casasJson.length,
    modal: {
      tipo: 0,
      mostra: false,
      mensagem: '',
      precoCompra: '',
      precoAluguel: '',
      precoPagar: '',
    }
  },
  created() {
    const params = new URLSearchParams(window.location.search);
    this.nomesJogadores = params.getAll('nomesjogadores[]');
  },
  mounted() {

    this.tabuleiro = new TabuleiroModel({
      nomesJogadores: this.nomesJogadores,
      casas: casasJson,
      cartasSorte: cartasSorte,
      cartasCofre: cartasCofre
    });

    this.tabuleiro.MontarTabuleiro();

    this.jogadorAtivo = this.tabuleiro.jogadorAtivo;
  },
  methods: {
    EstilizarObjetoPosicao(objeto) {
      return {
        position: 'absolute',
        top: `${objeto.y}%`,
        left: `${objeto.x}%`,
        backgroundColor: objeto.cor,
        width: '20px',
        height: '20px',
        borderRadius: '50%',
        transform: 'translate(-50%, -50%)',
      };
    },

    jogarTurno(jogador) {

      //Rola os dados até que não sejam iguais ou sejam iguais 3 vezes
      let lancamentos = 0;
      let numero1 = 0;
      let numero2 = 0;
      while (numero1 === numero2 && lancamentos < 3) {
        lancamentos++;
        //Rola os dados
        const resultado = jogador.jogarDados(this.totalCasas);

        //Atualiza os números do dado
        numero1 = resultado.dado1;
        numero2 = resultado.dado2;

        //Atualiza a casa do jogador no tabuleiro
        const novaCasa = this.tabuleiro.atualizarCasaJogador(jogador, resultado.novaPosicao);

        //Realiza ação da casa (ex: comprar/alugar)
        this.tabuleiro.realizarFuncao(jogador, novaCasa, this.modal, novaCasa.params);

        //Log
        console.log(`${jogador.nome} rolou ${numero1} + ${numero2} = ${resultado.soma}, nova posição: ${resultado.novaPosicao}`);
        //if (lancamentos >= 3) this.tabuleiro.prisao(jogador);
      }
      //Passa a vez para o próximo jogador
      this.jogadorAtivo = this.tabuleiro.getProximoJogadorAtivo(jogador);
    },


  },
});


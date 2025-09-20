import casasJson from './data/casas.js';
import cartasJson from './data/cartas.js';
import TabuleiroModel from './models/TabuleiroModel.js';

new Vue({
  el: '#appVue',
  data: {
    casas: casasJson,
    cartas: cartasJson,
    cartasSorte: [],
    cartasCofre: [],
    jogadores: [],
    jogadorAtivo: {},
    totalCasas: casasJson.length,
    modal: {
      tipo: 0,
      mostra: false,
      mensagem: '',
      precoCompra: '',
      precoAluguel: '',
      precoPagar: '',
    },
    dados: {
      numero1: 0,
      numero2: 0
    }
  },
  created() {
    const params = new URLSearchParams(window.location.search);
    this.nomesJogadores = params.getAll('nomesjogadores[]');
  },
  mounted() {
    this.tabuleiro = new TabuleiroModel({
      nomesJogadores: this.nomesJogadores,
      casas: this.casas,
      jogadores: this.jogadores,
      cartas: this.cartas,
    });

    this.tabuleiro.MontarTabuleiro();

    // sincronizar os dados de volta
    this.jogadores = this.tabuleiro.jogadores;
    this.jogadorAtivo = this.tabuleiro.jogadorAtivo;
    this.cartasSorte = this.tabuleiro.cartasSorte;
    this.cartasCofre = this.tabuleiro.cartasCofre;
  },
  // computed(){
  //   jogadoresRestantes = this.jogadores - jogadorAtivo
  // },
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
      // tira da casa atual
      this.casas[jogador.localizacaoAtual].listaJogadores =
        this.casas[jogador.localizacaoAtual].listaJogadores.filter(j => j !== jogador);

      // rola os dados e move
      const resultado = jogador.jogarDados(this.totalCasas);

      this.dados.numero1 = resultado.dado1;

      this.dados.numero2 = resultado.dado2;

      // adiciona na nova casa
      this.casas[jogador.localizacaoAtual].listaJogadores.push(jogador);

      if(this.casas[jogador.localizacaoAtual].tipoEspaco === 2){
        //this.mostraModalComprarouAlugar
      }

      console.log(`${jogador.nome} rolou ${resultado.dado1} + ${resultado.dado2} = ${resultado.soma}, nova posição: ${resultado.novaPosicao}`);
    }
  },
});


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
      cartas: this.cartas,
    });

    this.tabuleiro.MontarTabuleiro();

    // sincronizar os dados de volta
    this.jogadores = this.tabuleiro.jogadores;
    this.jogadorAtivo = this.tabuleiro.jogadorAtivo;
    this.cartasSorte = this.tabuleiro.cartasSorte;
    this.cartasCofre = this.tabuleiro.cartasCofre;
  },
  computed: {
    jogadoresRestantes() {
      return this.jogadores.filter(j => j !== this.jogadorAtivo);
    }
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
      //Remove a cor do jogador da casa atual
      const casaAtual = this.casas[jogador.localizacaoAtual];
      casaAtual.listaJogadores = casaAtual.listaJogadores.filter(cor => cor !== jogador.cor);

      //Rola os dados
      const resultado = jogador.jogarDados(this.totalCasas);

      //Atualiza os números do dado
      this.dados.numero1 = resultado.dado1;
      this.dados.numero2 = resultado.dado2;

      //Adiciona a cor do jogador na nova casa
      const novaCasa = this.casas[jogador.localizacaoAtual];
      if (!novaCasa.listaJogadores) novaCasa.listaJogadores = [];
      novaCasa.listaJogadores.push(jogador.cor);

      //Verifica ação da casa (ex: comprar/alugar)
      if (novaCasa.tipoEspaco === 2) {
        this.modal.mostra = true;
        this.modal.tipo = 'comprar';
        this.modal.mensagem = `Você caiu em ${novaCasa.nome}`;
        this.modal.precoCompra = novaCasa.preco;
      }

      //Log
      console.log(`${jogador.nome} rolou ${resultado.dado1} + ${resultado.dado2} = ${resultado.soma}, nova posição: ${resultado.novaPosicao}`);

      //Passa a vez para o próximo jogador
      const indexAtual = this.jogadores.indexOf(jogador);
      const proximoIndex = (indexAtual + 1) % this.jogadores.length;
      this.jogadorAtivo = this.jogadores[proximoIndex];
    }


  },
});


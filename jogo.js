import casasJson from './data/casas.js';
import Jogador from './models/jogador.js';

new Vue({
  el: '#appVue',
  data: {
    casas: casasJson,
    jogadores: [],
    totalCasas: casasJson.length
  },
  created() {
    const jogador1 = new Jogador("Bruna", "red", 0);
    this.jogadores.push(jogador1);
    this.casas[jogador1.localizacaoAtual].listaJogadores.push(jogador1);
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
      // tira da casa atual
      this.casas[jogador.localizacaoAtual].listaJogadores =
        this.casas[jogador.localizacaoAtual].listaJogadores.filter(j => j !== jogador);

      // rola os dados e move
      const resultado = jogador.jogarDados(this.totalCasas);

      // adiciona na nova casa
      this.casas[jogador.localizacaoAtual].listaJogadores.push(jogador);

      console.log(`${jogador.nome} rolou ${resultado.dado1} + ${resultado.dado2} = ${resultado.soma}, nova posição: ${resultado.novaPosicao}`);
    }
  },
});


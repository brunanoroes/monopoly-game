import cidadesJson from './data/cidades.js';

new Vue({
  el: '#appVue',
  data: {
     cidades: cidadesJson,
     jogadores: []
  },
  created() {
  },
  mounted() {
  },
  watch: {
  },
  methods: {
    EstilizarObjetoPosicao(objeto) {
      return {
        position: 'absolute',
        top: `${objeto.y}%`,
        left: `${objeto.x}%`,
        backgroundColor: objeto.cor,
        transform: 'translate(-50%, -50%)',
      };
    },
  },
});

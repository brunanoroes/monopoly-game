Vue.component('peao', {
  props: ['cor'],
  template: `
    <img 
      :src="imagem" 
      :alt="'Peão ' + cor" 
      class="peao"
    >
  `,
  computed: {
    imagem() {
      return 'assets/peoes/peao-' + this.cor + '.png';
    }
  }
});

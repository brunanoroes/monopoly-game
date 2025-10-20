Vue.component('pino-casa', {
  props: ['casaConstruida', 'proprietarioCor'],
  template: `
    <img 
      :src="imagem" 
      :alt="'Casa ' + proprietarioCor" 
      class="pino-casa"
    >
  `,
  computed: {
    imagem() {
      return `assets/casas/${this.proprietarioCor}/casa${this.casaConstruida}.png`;
    }
  }
});
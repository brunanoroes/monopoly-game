Vue.component('pino-casa', {
  props: ['casaConstruida'],
  template: `<div :style="estilo"></div>`,
  computed: {
    estilo() {
      return {
        width: '10px',
        height: '10px',
        backgroundColor: this.casaConstruida,
        margin: '1px auto',
      };
    }
  }
});
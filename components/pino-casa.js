Vue.component('pino-casa', {
  props: ['cor'],
  template: `<div :style="estilo"></div>`,
  computed: {
    estilo() {
      return {
        width: '10px',
        height: '10px',
        backgroundColor: this.cor,
        margin: '1px auto',
      };
    }
  }
});
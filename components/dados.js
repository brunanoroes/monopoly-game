Vue.component('dados', {
  props: ['numero1', 'numero2'],
  template: `
    <div class="dados">
      <img 
        :src="imagem1" 
        :alt="'Dado ' + numero1" 
        class="dado"
      >
      <img 
        :src="imagem2" 
        :alt="'Dado ' + numero2" 
        class="dado"
      >
    </div>
  `,
  computed: {
    imagem1() {
      return 'assets/dados/dado' + this.numero1 + '.png';
    },
    imagem2() {
      return 'assets/dados/dado' + this.numero2 + '.png';
    }
  }
});

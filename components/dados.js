Vue.component('dados', {
  props: ['numero1', 'numero2'],
  template: `
    <div style="display: flex; gap: 8px; justify-content: center;">
      <div :style="estilo">{{ numero1 }}</div>
      <div :style="estilo">{{ numero2 }}</div>
    </div>
  `,
  computed: {
    estilo() {
      return {
        width: '40px',
        height: '40px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: '2px solid black',
        borderRadius: '8px',
        fontWeight: 'bold',
        fontSize: '18px',
        backgroundColor: 'white'
      };
    }
  }
});

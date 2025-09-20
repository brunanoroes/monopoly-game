Vue.component('modal', {
  props: ['tipo'],
  template: `
    <div v-if="tipo === 1">
    </div>
    <div v-if="tipo === 2">
    </div>
  `,
});
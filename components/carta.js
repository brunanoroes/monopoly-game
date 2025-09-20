Vue.component('carta', {
  props: ['nome', 'conteudo', 'descricao'],
  template: `
    <div class="carta-jogavel" @click="$emit('click')">
      <h4>{{ nome }}</h4>
      <p >{{ conteudo }} {{ descricao }}</p>
    </div>
  `,
});

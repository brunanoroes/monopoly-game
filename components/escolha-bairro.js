Vue.component('escolha-bairro', {
  props: ['escolhaBairros'],
  template: `
    <div class="modal-overlay">
      <div class="modal-content">
        <h2 class="modal-title">
          {{ escolhaBairros.mensagem }}
        </h2>

        <p class="modal-subtitle" v-if="escolhaBairros.mensagemAlerta">
          {{ escolhaBairros.mensagemAlerta }}
        </p>

        <div class="bairros-list" v-if="escolhaBairros.bairros.length">
          <div 
            v-for="bairro in escolhaBairros.bairros" 
            :key="bairro"
            class="bairro-item"
            @click="$emit('selecionar-bairro', bairro)"
          >
            {{ bairro }}
          </div>
        </div>
        <div v-if="!escolhaBairros.bairros.length">
          <button class="btn cancel" @click="$emit('dismiss')">Fechar</button>
        </div>
      </div>
    </div>
  `
});

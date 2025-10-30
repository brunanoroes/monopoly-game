Vue.component('modal', {
  props: ['modal',],
  template: `
    <div>
      <div v-if="modal.tipo === 1">
        <div class="modal-overlay">
          <div class="modal-content">
            <h2 class="modal-title">{{ modal.mensagem }}</h2>
            <p class="modal-subtitle">{{ modal.mensagemAlerta }}</p>

            <div class="options">
              <label class="option">
                <input type="radio" v-model="modal.selected" value="1"/>
                Casa 1 <span class="price">{{ modal.prices[0] || 0 }} R$</span>
              </label>
              <label class="option">
                <input type="radio" v-model="modal.selected" value="2"/>
                Casa 2 <span class="price">{{ modal.prices[1] || 0 }} R$</span>
              </label>
              <label class="option">
                <input type="radio" v-model="modal.selected" value="3"/>
                Casa 3 <span class="price">{{ modal.prices[2] || 0 }} R$</span>
              </label>
              <label class="option">
                <input type="radio" v-model="modal.selected" value="4"/>
                Hotel <span class="price">{{ modal.prices[3] || 0 }} R$</span>
              </label>
            </div>

            <div class="buttons">
              <button class="btn confirm" @click="$emit('confirmar-compra')">Comprar</button>
              <button class="btn cancel" @click="$emit('cancelar-compra')">Não</button>
            </div>
          </div>
        </div>
      </div>

      <div v-if="modal.tipo === 2">
        <div class="modal-overlay">
          <div class="modal-content">
            <h2 class="modal-title">{{ modal.mensagem }}</h2>
            <p class="modal-subtitle">Preço: <span class="price">{{ modal.prices }} R$</span></p>

            <div class="buttons">
              <button class="btn confirm" @click="$emit('confirmar-compra')">Comprar</button>
              <button class="btn cancel" @click="$emit('cancelar-compra')">Não</button>
            </div>
          </div>
        </div>
      </div>

      <div v-if="modal.tipo === 3">
        <div class="modal-overlay">
          <div class="modal-content">
            {{ modal.mensagem }}
            <button @click="$emit('dismiss')">Fechar</button>
          </div>
        </div>
      </div>

      <div v-if="modal.tipo === 4">
        <div class="modal-overlay">
          <div class="modal-content">
            {{ modal.mensagem }}
             <button @click="$emit('dismiss')">Fechar</button>
          </div>
        </div>
      </div>
    </div>
  `
});
//Modal 1 - Compra de Propriedades Normais
//Modal 2 - Compra praia
//Modal 3 - Pagamento Aluguel
//Modal 4 - Avisos
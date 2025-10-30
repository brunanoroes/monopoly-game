Vue.component('modal', {
  props: ['modal',],
  template: `
    <div>
      <div v-if="modal.tipo === 1">
        <div class="modal-overlay">
          <div class="modal-content">
          <label>{{ modal.mensagem }}</label><br/>
          <p>{{modal.mensagemAlerta}}</p>
            <input type="radio" v-model="modal.selected" value="1"/>Casa 1 {{ modal.prices[0] || 0 }}R$ <br/>
            <input type="radio" v-model="modal.selected" value="2"/>Casa 2 {{ modal.prices[1] || 0 }}R$ <br/>
            <input type="radio" v-model="modal.selected" value="3"/>Casa 3 {{ modal.prices[2] || 0 }}R$ <br/>
            <input type="radio" v-model="modal.selected" value="4"/>Hotel {{ modal.prices[3] || 0 }}R$ <br/>
            <button @click="$emit('confirmar-compra')">Comprar</button>
            <button @click="$emit('cancelar-compra')">Não</button>
          </div>
        </div>
      </div>

      <div v-if="modal.tipo === 2">
        <div class="modal-overlay">
          <div class="modal-content">
            {{ modal.mensagem }}
             Preço {{modal.prices}}
          <button @click="$emit('confirmar-compra')">Comprar</button>
          <button @click="$emit('cancelar-compra')">Não</button>
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
Vue.component('modal', {
  props: ['modal'],
  template: `
    <div>
      <div v-if="modal.tipo === 1">
        <div class="modal-overlay">
          <div class="modal-content">
            <h2 class="modal-title">{{ modal.mensagem }}</h2>
            <p class="modal-subtitle">{{ modal.mensagemAlerta }}</p>

            <div class="options">
              <label class="option">
                <input type="radio" v-model="modal.selected" value="1" :disabled="modal.disabled[0]"/>
                Casa 1 <span class="price">{{ modal.prices[0] || 0 }} R$</span>
              </label>
              <label class="option">
                <input type="radio" v-model="modal.selected" value="2" :disabled="modal.disabled[1]"/>
                Casa 2 <span class="price">{{ modal.prices[1] || 0 }} R$</span>
              </label>
              <label class="option">
                <input type="radio" v-model="modal.selected" value="3" :disabled="modal.disabled[2]"/>
                Casa 3 <span class="price">{{ modal.prices[2] || 0 }} R$</span>
              </label>
              <label class="option">
                <input type="radio" v-model="modal.selected" value="4" :disabled="modal.disabled[3]"/>
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
            <p class="modal-subtitle">{{ modal.mensagemAlerta }}</p>
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
            <h2 class="modal-title">{{ modal.mensagem }}</h2>
            <p class="modal-subtitle">{{ modal.mensagemAlerta }}</p>
            <button class="btn confirm" @click="$emit('pagar-aluguel')">Pagar</button>
          </div>
        </div>
      </div>

      <div v-if="modal.tipo === 4">
        <div class="modal-overlay">
          <div class="modal-content">
            <h2 class="modal-title">{{ modal.mensagem }}</h2>
            <p class="modal-subtitle">{{ modal.mensagemAlerta }}</p>
             <button class="btn cancel" @click="$emit('dismiss')">Fechar</button>
          </div>
        </div>
      </div>

      <div v-if="modal.tipo === 5">
        <div class="modal-overlay">
          <div class="modal-content">
            <h2 class="modal-title">{{ modal.mensagem }}</h2>
            <p class="modal-subtitle">{{ modal.mensagemAlerta }}</p>
             <button class="btn confirm" @click="$emit('executar-carta-sorte')">Continuar</button>
          </div>
        </div>
      </div>

      <div v-if="modal.tipo === 6">
        <div class="modal-overlay">
          <div class="modal-content">
            <h2 class="modal-title">⚠️ FALÊNCIA</h2>
            <p class="modal-subtitle">{{ modal.mensagem }}</p>
            <p class="modal-subtitle" style="color: red; font-weight: bold;">
              Dívida: R$ {{ modal.divida }}
            </p>
            <p class="modal-subtitle">Saldo atual: R$ {{ modal.saldoAtual }}</p>

            <div v-if="modal.propriedadesVendiveis && modal.propriedadesVendiveis.length > 0">
              <h3 style="margin-top: 20px;">Suas Propriedades:</h3>
              <div class="options">
                <label class="option" v-for="prop in modal.propriedadesVendiveis" :key="prop.id">
                  <input 
                    type="checkbox" 
                    :value="prop.id" 
                    v-model="modal.propriedadesSelecionadas"
                  />
                  {{ prop.nome }} 
                  <span class="price">{{ calcularValorVenda(prop) }} R$</span>
                </label>
              </div>
              <p style="margin-top: 10px; font-weight: bold;">
                Total selecionado: R$ {{ calcularTotalSelecionado() }}
              </p>
            </div>

            <div v-else>
              <p style="color: red; margin-top: 20px;">
                Você não possui propriedades para vender.
              </p>
            </div>

            <div class="buttons" style="margin-top: 20px;">
              <button 
                class="btn confirm" 
                v-if="modal.propriedadesVendiveis && modal.propriedadesVendiveis.length > 0"
                @click="$emit('vender-propriedades')"
                :disabled="modal.propriedadesSelecionadas.length === 0"
              >
                Vender Selecionadas
              </button>
              <button 
                class="btn cancel" 
                @click="$emit('declarar-falencia')"
              >
                Declarar Falência
              </button>
            </div>
          </div>
        </div>
      </div>

      <div v-if="modal.tipo === 7">
        <div class="modal-overlay">
          <div class="modal-content">
            <div v-html="modal.mensagem"></div>

              <button class="btn confirm"
                      @click="$emit('casa-especial')"
                      style="margin-top: 2rem">
                Continuar
              </button>
          </div>
        </div>
      </div>
    </div>
  `,
  methods: {
    calcularValorVenda(propriedade) {
      if (propriedade.tipo === 'praia') {
        return Math.floor(propriedade.price * 0.5);
      }
      // Para propriedades normais, retorna 50% do valor da casa construída
      if (propriedade.prices && propriedade.casaConstruida > 0) {
        return Math.floor(propriedade.prices[propriedade.casaConstruida - 1] * 0.5);
      }
      return 0;
    },
    calcularTotalSelecionado() {
      if (!this.modal.propriedadesSelecionadas || !this.modal.propriedadesVendiveis) {
        return 0;
      }
      return this.modal.propriedadesSelecionadas.reduce((total, propId) => {
        const prop = this.modal.propriedadesVendiveis.find(p => p.id === propId);
        return total + (prop ? this.calcularValorVenda(prop) : 0);
      }, 0);
    }
  }
});
//Modal 1 - Compra de Propriedades Normais
//Modal 2 - Compra praia
//Modal 3 - Pagamento Aluguel
//Modal 4 - Avisos
//Modal 5 - Cartas de Sorte/Azar
//Modal 6 - Casas Especiais
//Modal 7 - Falência

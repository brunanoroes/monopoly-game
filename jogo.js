import casasJson from './data/casas.js';
import cartasSorte from './data/cartasSorte.js';
import TabuleiroModel from './models/TabuleiroModel.js';

new Vue({
  el: '#appVue',
  data: {
    tabuleiro: null,
    jogadorAtivo: null,
    nomesJogadores: [], // inicializa
    dadosBloqueados: false, // Controla se o botão de rolar dados está bloqueado
    botPensando: false, // Indica quando o bot está "pensando"
    mensagemBot: '', // Mensagem de ação do bot
    modal: {
      tipo: 1,
      mostra: false,
      mensagem: "",
      prices: [],
      selected: 0,
      mensagemAlerta: "",
      disabled: [true, true, true, true]
    },
    areadados: {x: 45, y: 50},
    jogodiv: {x: 5, y: 75},
    dados: {
      numero1 : 1,
      numero2 : 1
    }
  },
  created() {
    const params = new URLSearchParams(window.location.search);
    // se não houver nomes na URL, nomesJogadores será []
    this.nomesJogadores = params.getAll('nomesjogadores[]') || [];
  },
  // tornar mounted async para aguardar montagem do tabuleiro
  async mounted() {
    this.tabuleiro = new TabuleiroModel({
      nomesJogadores: this.nomesJogadores
    });

    // se MontarTabuleiro for async, await; protege se não for
    if (this.tabuleiro.MontarTabuleiro && typeof this.tabuleiro.MontarTabuleiro === 'function') {
      await this.tabuleiro.MontarTabuleiro(cartasSorte, casasJson);
    } else {
      console.warn('MontarTabuleiro não encontrado em TabuleiroModel');
    }

    // atualiza referência ao jogador ativo (já definida dentro do model)
    this.jogadorAtivo = this.tabuleiro ? this.tabuleiro.jogadorAtivo : null;

    // Inicia o turno do bot se for bot
    if (this.jogadorAtivo && this.jogadorAtivo.tipo === 'bot') {
      this.iniciarTurnoBot();
    }
  },
  watch: {
    jogadorAtivo(novoJogador) {
      // Quando muda o jogador ativo, verifica se é bot
      if (novoJogador && novoJogador.tipo === 'bot' && !this.modal.mostra) {
        // Pequeno delay para dar tempo da UI atualizar
        setTimeout(() => {
          this.iniciarTurnoBot();
        }, 500);
      }
    }
  },
  methods: {
    // ========== MÉTODOS DO BOT ==========
    async iniciarTurnoBot() {
      if (!this.jogadorAtivo || this.jogadorAtivo.tipo !== 'bot') return;
      
      this.botPensando = true;
      this.mensagemBot = `${this.jogadorAtivo.nome} está jogando...`;
      
      // Aguarda um tempo para simular "pensamento"
      await this.aguardar(1000);
      
      // Rola os dados
      await this.jogarTurno(this.jogadorAtivo);
    },

    async botDecidirCompra(casa) {
      if (!this.jogadorAtivo || this.jogadorAtivo.tipo !== 'bot') return;
      
      this.mensagemBot = `${this.jogadorAtivo.nome} está analisando...`;
      await this.aguardar(1500); // Simula que está pensando
      
      // Verifica o tipo de modal/decisão
      if (this.modal.tipo === 1) {
        // Propriedade com níveis (casa 1, 2, 3, hotel)
        const escolha = this.jogadorAtivo.escolherTipoCompra(casa, this.modal.prices, casa.casaConstruida);
        
        if (escolha > 0) {
          this.modal.selected = escolha;
          this.mensagemBot = `${this.jogadorAtivo.nome} decidiu comprar!`;
          await this.aguardar(800);
          await casa.comprarCasa(this.jogadorAtivo, this.modal);
          Vue.set(this.jogadorAtivo, 'dinheiro', this.jogadorAtivo.dinheiro);
        } else {
          this.mensagemBot = `${this.jogadorAtivo.nome} decidiu não comprar.`;
          await this.aguardar(800);
        }
      } else if (this.modal.tipo === 2) {
        // Praia ou propriedade simples
        const preco = this.modal.prices;
        const deveComprar = this.jogadorAtivo.deveComprarPropriedade(casa, preco);
        
        if (deveComprar) {
          this.mensagemBot = `${this.jogadorAtivo.nome} decidiu comprar ${casa.nome}!`;
          await this.aguardar(800);
          await casa.comprarCasa(this.jogadorAtivo, this.modal);
          Vue.set(this.jogadorAtivo, 'dinheiro', this.jogadorAtivo.dinheiro);
        } else {
          this.mensagemBot = `${this.jogadorAtivo.nome} decidiu não comprar.`;
          await this.aguardar(800);
        }
      }
      
      // Passa a vez para o próximo jogador
      this.mensagemBot = '';
      this.botPensando = false;
      await this.aguardar(500);
      this.jogadorAtivo = await this.tabuleiro.getProximoJogadorAtivo(this.jogadorAtivo);
      this.dadosBloqueados = false;
    },

    async botPagarAluguel() {
      if (!this.jogadorAtivo || this.jogadorAtivo.tipo !== 'bot') return;
      
      this.mensagemBot = `${this.jogadorAtivo.nome} está pagando aluguel...`;
      await this.aguardar(1200);
      
      const casa = this.tabuleiro.casas.find(
        casa => casa.id === this.jogadorAtivo.localizacaoAtual
      );

      var _valor = 0;
      if(casa.tipo === "praia"){
        _valor = casa ? casa.fee : 0;
      }
      else{
        _valor = casa ? casa.fee[casa.casaConstruida - 1] : 0;
      }
      
      const _jogador = this.tabuleiro.jogadores.find(
        jogador => jogador.cor === casa.proprietarioCor
      );

      if(this.jogadorAtivo.pagar(_valor)){
        _jogador.receber(_valor);
        Vue.set(_jogador, 'dinheiro', _jogador.dinheiro);
        Vue.set(this.jogadorAtivo, 'dinheiro', this.jogadorAtivo.dinheiro);
        
        this.mensagemBot = `${this.jogadorAtivo.nome} pagou R$ ${_valor}.`;
        await this.aguardar(1000);
        
        // Verifica se quer comprar a propriedade
        const precoCompra = Array.isArray(casa.prices) ? casa.prices[0] + 100 : casa.price + 100;
        const deveComprar = this.jogadorAtivo.deveComprarDeOutroJogador(casa, precoCompra);
        
        if (deveComprar && Array.isArray(casa.prices)) {
          this.mensagemBot = `${this.jogadorAtivo.nome} decidiu comprar a propriedade!`;
          await this.aguardar(1000);
          this.modal.selected = 1;
          await casa.comprarCasa(this.jogadorAtivo, this.modal);
          Vue.set(this.jogadorAtivo, 'dinheiro', this.jogadorAtivo.dinheiro);
        } else if (deveComprar) {
          this.mensagemBot = `${this.jogadorAtivo.nome} decidiu comprar ${casa.nome}!`;
          await this.aguardar(1000);
          await casa.comprarCasa(this.jogadorAtivo, this.modal);
          Vue.set(this.jogadorAtivo, 'dinheiro', this.jogadorAtivo.dinheiro);
        }
      }
      
      // Passa a vez
      this.mensagemBot = '';
      this.botPensando = false;
      await this.aguardar(500);
      this.jogadorAtivo = await this.tabuleiro.getProximoJogadorAtivo(this.jogadorAtivo);
      this.dadosBloqueados = false;
    },

    async botExecutarCartaSorte() {
      if (!this.jogadorAtivo || this.jogadorAtivo.tipo !== 'bot') return;
      
      this.mensagemBot = `${this.jogadorAtivo.nome} pegou uma carta...`;
      await this.aguardar(1500);
      
      // Executa a carta sem mostrar modal
      if (this.modal.executarCartaSorte) {
        this.modal.executarCartaSorte();
      }
      
      this.mensagemBot = '';
      this.botPensando = false;
      await this.aguardar(500);
      
      // Se a carta não moveu o jogador, passa a vez
      if (!this.modal.keepOpen) {
        this.jogadorAtivo = await this.tabuleiro.getProximoJogadorAtivo(this.jogadorAtivo);
        this.dadosBloqueados = false;
      }
      
      this.modal.keepOpen = false;
    },

    aguardar(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
    },

    // ========== MÉTODOS ORIGINAIS ==========
    EstilizarObjetoPosicao(objeto) {
      
      // Define o ângulo conforme o valor de 'lateral'
      let angulo = 0;
      switch (objeto.lateral) {
        case 1: angulo = 0; break;
        case 2: angulo = 0; break;
        case 3: angulo = 0; break;
        case 4: angulo = 0; break;
      }

      return {
        position: 'absolute',
        top: `${objeto.y}%`,
        left: `${objeto.x}%`,
        transform: `rotate(${angulo}deg)`,
        transformOrigin: 'center center', // gira em torno do centro
      };
    },

    async jogarTurno(jogador) {
      if (!jogador || this.dadosBloqueados) return;
      
      // Bloqueia o botão de dados
      this.dadosBloqueados = true;
      
      //Lançar dados - seu JogadorModel deve retornar {dado1,dado2,soma,novaPosicao}
      const resultado = jogador.jogarDados(this.tabuleiro ? this.tabuleiro.totalCasas : 0);

      this.dados.numero1 = resultado.dado1;
      this.dados.numero2 = resultado.dado2;

      //Atualiza a casa do jogador no tabuleiro
      const novaCasa = await this.tabuleiro.atualizarCasaJogador(jogador, resultado.soma);

      //Realiza ação da casa (ex: comprar/alugar)
      novaCasa.funcao(jogador, this.modal);
      
      // Se for bot, automaticamente processa a ação após o movimento
      if (jogador.tipo === 'bot') {
        await this.aguardar(800);
        await this.processarAcaoBot(novaCasa);
      }
    },

    async processarAcaoBot(casa) {
      // Se não houver modal, apenas passa a vez
      if (!this.modal.mostra) {
        this.mensagemBot = '';
        this.botPensando = false;
        await this.aguardar(500);
        this.jogadorAtivo = await this.tabuleiro.getProximoJogadorAtivo(this.jogadorAtivo);
        this.dadosBloqueados = false;
        return;
      }
      
      // Esconde o modal para o bot (ele decide internamente)
      this.modal.mostra = false;
      
      // Verifica o tipo de modal e age de acordo
      if (this.modal.tipo === 1 || this.modal.tipo === 2) {
        // Decisão de compra
        await this.botDecidirCompra(casa);
      } else if (this.modal.tipo === 3) {
        // Pagar aluguel
        await this.botPagarAluguel();
      } else if (this.modal.tipo === 5) {
        // Carta de sorte
        await this.botExecutarCartaSorte();
      } else if (this.modal.tipo === 4) {
        // Avisos gerais - apenas passa a vez
        this.mensagemBot = `${this.jogadorAtivo.nome} continua...`;
        await this.aguardar(1000);
        this.mensagemBot = '';
        this.botPensando = false;
        this.jogadorAtivo = await this.tabuleiro.getProximoJogadorAtivo(this.jogadorAtivo);
        this.dadosBloqueados = false;
      }
    },

    async confirmarCompra() {
      const casaId = this.jogadorAtivo.localizacaoAtual
      const casa = this.tabuleiro.casas[casaId]
      await casa.comprarCasa(this.jogadorAtivo, this.modal)
      Vue.set(this.jogadorAtivo, 'dinheiro', this.jogadorAtivo.dinheiro);
      this.jogadorAtivo = await this.tabuleiro.getProximoJogadorAtivo(this.jogadorAtivo);
      this.dadosBloqueados = false;
    },

    async cancelarCompra() {
      this.jogadorAtivo = await this.tabuleiro.getProximoJogadorAtivo(this.jogadorAtivo);
      this.dadosBloqueados = false;
      this.dismiss()
    },

      async dismiss(){
        this.modal.mostra = false;
        if (this.modal.passarVez) {
          this.jogadorAtivo = await this.tabuleiro.getProximoJogadorAtivo(this.jogadorAtivo);
          this.modal.passarVez = false;
          this.dadosBloqueados = false;
        }
      },

      async executarCartaSorte() {
        if (this.modal.executarCartaSorte) {
          this.modal.executarCartaSorte();
        }
        if (!this.modal.keepOpen) {
          this.dismiss();
        }
        if (this.modal.passarVez) {
          this.jogadorAtivo = await this.tabuleiro.getProximoJogadorAtivo(this.jogadorAtivo);
          this.modal.passarVez = false;
          this.dadosBloqueados = false;
        }
        this.modal.keepOpen = false;
      },

    jogadorAtivoAcao(casa, tipo) {
      if (!this.jogadorAtivo) return;
      // Exemplo: abre modal para comprar se propriedade, etc.
      console.log('ação na casa', casa, tipo);
      // se a casa for propriedade, abre o modal com os prices
      if (casa.prices) {
        this.modal.prices = casa.prices;
        this.modal.mostra = true;
      }
    },

    async pagarAluguel(){
 
      const casa = this.tabuleiro.casas.find(
        casa => casa.id === this.jogadorAtivo.localizacaoAtual
      );

      var _valor = 0;
      if(casa.tipo === "praia"){
        _valor = casa ? casa.fee : 0;
      }
      else{
        _valor = casa ? casa.fee[casa.casaConstruida - 1] : 0;
      }
      
      const _jogador = this.tabuleiro.jogadores.find(
        jogador => jogador.cor === casa.proprietarioCor
      );

      if(await this.jogadorAtivo.pagar(_valor)){
        _jogador.receber(_valor);
        
        // Atualiza UI
        Vue.set(_jogador, 'dinheiro', _jogador.dinheiro);
        Vue.set(this.jogadorAtivo, 'dinheiro', this.jogadorAtivo.dinheiro);
        
        this.modal.mostra = false;
        
        // Após pagar, mostra opção de compra apenas para jogadores humanos
        if (this.jogadorAtivo.tipo !== 'bot') {
          casa.funcao(this.jogadorAtivo, this.modal, 1);
        }
      }else{
        this.modal.mensagemAlerta = "Jogador não tem dinheiro para pagar Aluguel, precisa vender propriedades - Função não implementada ainda";
      }  
    }
  }
});

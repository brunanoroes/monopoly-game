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
      disabled: [true, true, true, true],
      divida: 0,
      saldoAtual: 0,
      propriedadesVendiveis: [],
      propriedadesSelecionadas: []
    },
    areadados: {x: 45, y: 50},
    jogodiv: {x: 5, y: 75},
    dados: {
      numero1 : 1,
      numero2 : 1
    },
    numeroCasasTeste: 0,
    modoTeste: false
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
          await casa.comprarCasa(this.jogadorAtivo, this.modal, this.tabuleiro);
          Vue.set(this.jogadorAtivo, 'dinheiro', this.jogadorAtivo.dinheiro);
          
          // Verifica falência após compra
          if (this.verificarFalencia(this.jogadorAtivo)) {
            return;
          }
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
          await casa.comprarCasa(this.jogadorAtivo, this.modal, this.tabuleiro);
          Vue.set(this.jogadorAtivo, 'dinheiro', this.jogadorAtivo.dinheiro);
          
          // Verifica falência após compra
          if (this.verificarFalencia(this.jogadorAtivo)) {
            return;
          }
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

      // Realiza o pagamento
      this.jogadorAtivo.pagar(_valor);
      _jogador.receber(_valor);
      Vue.set(_jogador, 'dinheiro', _jogador.dinheiro);
      Vue.set(this.jogadorAtivo, 'dinheiro', this.jogadorAtivo.dinheiro);
      
      this.mensagemBot = `${this.jogadorAtivo.nome} pagou R$ ${_valor}.`;
      await this.aguardar(1000);
      
      // Verifica falência após pagamento
      if (this.verificarFalencia(this.jogadorAtivo)) {
        // botGerenciarFalencia já foi chamado dentro de verificarFalencia
        return;
      }
      
      // Verifica se quer comprar a propriedade
      const precoCompra = Array.isArray(casa.prices) ? casa.prices[0] + 100 : casa.price + 100;
      const deveComprar = this.jogadorAtivo.deveComprarDeOutroJogador(casa, precoCompra);
      
      if (deveComprar && Array.isArray(casa.prices)) {
        this.mensagemBot = `${this.jogadorAtivo.nome} decidiu comprar a propriedade!`;
        await this.aguardar(1000);
        this.modal.selected = 1;
        await casa.comprarCasa(this.jogadorAtivo, this.modal, this.tabuleiro);
        Vue.set(this.jogadorAtivo, 'dinheiro', this.jogadorAtivo.dinheiro);
      } else if (deveComprar) {
        this.mensagemBot = `${this.jogadorAtivo.nome} decidiu comprar ${casa.nome}!`;
        await this.aguardar(1000);
        await casa.comprarCasa(this.jogadorAtivo, this.modal, this.tabuleiro);
        Vue.set(this.jogadorAtivo, 'dinheiro', this.jogadorAtivo.dinheiro);
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
      
      await this.aguardar(500);
      
      // Se a carta moveu o jogador (keepOpen = true), processa a ação da nova casa
      if (this.modal.keepOpen) {
        this.modal.keepOpen = false;
        const casaAtual = this.tabuleiro.casas[this.jogadorAtivo.localizacaoAtual];
        this.mensagemBot = `${this.jogadorAtivo.nome} foi movido para ${casaAtual.nome}...`;
        await this.aguardar(1000);
        
        // Processa a ação da nova casa
        await this.processarAcaoBot(casaAtual);
      } else {
        // Se a carta não moveu o jogador, apenas passa a vez
        this.mensagemBot = '';
        this.botPensando = false;
        this.jogadorAtivo = await this.tabuleiro.getProximoJogadorAtivo(this.jogadorAtivo);
        this.dadosBloqueados = false;
      }
    },

    async botGerenciarFalencia(jogador, divida, valorPropriedades) {
      this.mensagemBot = `${jogador.nome} está em dívida de R$ ${divida}...`;
      await this.aguardar(1500);

      // Verifica se tem propriedades suficientes para quitar
      if (valorPropriedades >= divida) {
        // Bot decide vender propriedades
        this.mensagemBot = `${jogador.nome} está vendendo propriedades...`;
        await this.aguardar(1200);

        const propriedadesParaVender = jogador.escolherPropriedadesParaVender(jogador.dinheiro);
        let totalArrecadado = 0;

        propriedadesParaVender.forEach(propId => {
          const prop = this.tabuleiro.casas.find(c => c.id === propId);
          if (prop) {
            const valor = jogador.venderPropriedade(prop);
            totalArrecadado += valor;
            Vue.set(prop, 'proprietarioCor', null);
            Vue.set(prop, 'casaConstruida', 0);
          }
        });

        Vue.set(jogador, 'dinheiro', jogador.dinheiro);
        Vue.set(jogador, 'propriedades', jogador.propriedades);

        this.mensagemBot = `${jogador.nome} vendeu propriedades por R$ ${totalArrecadado} e quitou a dívida!`;
        await this.aguardar(2000);

        // Passa a vez
        this.mensagemBot = '';
        this.botPensando = false;
        this.jogadorAtivo = await this.tabuleiro.getProximoJogadorAtivo(this.jogadorAtivo);
        this.dadosBloqueados = false;
      } else {
        // Bot não tem como quitar - declara falência
        this.mensagemBot = `${jogador.nome} não consegue pagar a dívida...`;
        await this.aguardar(1500);

        this.tabuleiro.eliminarJogador(jogador);
        Vue.set(jogador, 'falido', true);

        this.mensagemBot = `${jogador.nome} faliu e foi eliminado! 💔`;
        await this.aguardar(2000);

        // Verificar se há um vencedor
        const vencedor = this.tabuleiro.verificarVitoria();
        if (vencedor) {
          this.mensagemBot = `🎉 ${vencedor.nome} VENCEU O JOGO! 🎉`;
          await this.aguardar(3000);
        }

        // Passa a vez
        this.mensagemBot = '';
        this.botPensando = false;
        this.jogadorAtivo = await this.tabuleiro.getProximoJogadorAtivo(this.jogadorAtivo);
        this.dadosBloqueados = false;
      }
    },

    aguardar(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
    },

    // ========== MÉTODOS ORIGINAIS ==========
    // Mapeia cores em português para códigos CSS
    obterCorCSS(corPortugues) {
      const mapaCores = {
        'azul': '#0066CC',
        'vermelho': '#CC0000',
        'verde': '#00AA00',
        'amarelo': '#FFCC00'
      };
      return mapaCores[corPortugues] || corPortugues;
    },

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

    async jogarTurno(jogador, _tipo = 0) {
      if (!jogador || this.dadosBloqueados) return;
      
      // Bloqueia o botão de dados
      this.dadosBloqueados = true;

      let novaCasa;
      
      if(_tipo){
        // Modo teste: avança número específico de casas
        const numCasas = parseInt(this.numeroCasasTeste) || 0;
        novaCasa = await this.tabuleiro.atualizarCasaJogador(jogador, numCasas);
        this.numeroCasasTeste = 0;
      } else {
        // Modo normal: lança dados
        const resultado = jogador.jogarDados(this.tabuleiro ? this.tabuleiro.totalCasas : 0);
        this.dados.numero1 = resultado.dado1;
        this.dados.numero2 = resultado.dado2;
        
        //Atualiza a casa do jogador no tabuleiro
        novaCasa = await this.tabuleiro.atualizarCasaJogador(jogador, resultado.soma);
      }

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
      } else if (this.modal.tipo === 6) {
        // Falência - já foi tratada em verificarFalencia, apenas retorna
        return;
      } else if (this.modal.tipo === 4) {
        // Avisos gerais - apenas passa a vez
        this.mensagemBot = `${this.jogadorAtivo.nome} continua...`;
        await this.aguardar(1000);
        this.mensagemBot = '';
        this.botPensando = false;
        this.jogadorAtivo = await this.tabuleiro.getProximoJogadorAtivo(this.jogadorAtivo);
        this.dadosBloqueados = false;
        //Atualiza a casa do jogador no tabuleiro
        const novaCasa = await this.tabuleiro.atualizarCasaJogador(jogador, resultado.soma);

        //Realiza ação da casa (ex: comprar/alugar)
        novaCasa.funcao(jogador, this.modal);
      }
    },

    async confirmarCompra() {
      const casaId = this.jogadorAtivo.localizacaoAtual
      const casa = this.tabuleiro.casas[casaId]
      await casa.comprarCasa(this.jogadorAtivo, this.modal, this.tabuleiro)
      
      // Atualiza o saldo na UI de todos os jogadores envolvidos
      Vue.set(this.jogadorAtivo, 'dinheiro', this.jogadorAtivo.dinheiro);
      this.tabuleiro.jogadores.forEach(j => {
        Vue.set(j, 'dinheiro', j.dinheiro);
      });
      
      // Verifica se o jogador entrou em falência após a compra
      if (this.verificarFalencia(this.jogadorAtivo)) {
        return; // Modal de falência será exibido
      }
      
      this.jogadorAtivo = await this.tabuleiro.getProximoJogadorAtivo(this.jogadorAtivo);
      
      // Desbloqueia o botão de dados para o próximo jogador
      this.dadosBloqueados = false;
    },

    async cancelarCompra() {
      this.jogadorAtivo = await this.tabuleiro.getProximoJogadorAtivo(this.jogadorAtivo);
      
      // Desbloqueia o botão de dados para o próximo jogador
      this.dadosBloqueados = false;
      
      this.dismiss()
    },

      async dismiss(){
        this.modal.mostra = false;
        if (this.modal.passarVez) {
          this.jogadorAtivo = await this.tabuleiro.getProximoJogadorAtivo(this.jogadorAtivo);
          this.modal.passarVez = false;
          
          // Desbloqueia o botão de dados para o próximo jogador
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
          
          // Desbloqueia o botão de dados para o próximo jogador
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

    verificarFalencia(jogador) {
      if (jogador.verificarFalencia()) {
        const divida = Math.abs(jogador.dinheiro);
        const valorPropriedades = jogador.calcularValorTotalPropriedades();

        // Se for bot, gerencia falência automaticamente
        if (jogador.tipo === 'bot') {
          this.botGerenciarFalencia(jogador, divida, valorPropriedades);
          return true;
        }

        // Para jogadores humanos, mostra modal
        this.modal.tipo = 6;
        this.modal.mostra = true;
        this.modal.mensagem = `${jogador.nome}, você está em situação de falência!`;
        this.modal.divida = divida;
        this.modal.saldoAtual = jogador.dinheiro;
        this.modal.propriedadesVendiveis = [...jogador.propriedades];
        this.modal.propriedadesSelecionadas = [];

        if (valorPropriedades < divida) {
          this.modal.mensagemAlerta = 'Suas propriedades não são suficientes para quitar a dívida.';
        } else {
          this.modal.mensagemAlerta = 'Venda propriedades para quitar sua dívida e continuar no jogo.';
        }

        return true;
      }
      return false;
    },

    async venderPropriedades() {
      if (!this.modal.propriedadesSelecionadas.length) {
        this.modal.mensagemAlerta = 'Selecione ao menos uma propriedade.';
        return;
      }

      const jogador = this.jogadorAtivo;
      let totalArrecadado = 0;

      // Vender cada propriedade selecionada
      this.modal.propriedadesSelecionadas.forEach(propId => {
        const prop = this.tabuleiro.casas.find(c => c.id === propId);
        if (prop) {
          const valor = jogador.venderPropriedade(prop);
          totalArrecadado += valor;
          Vue.set(prop, 'proprietarioCor', null);
          Vue.set(prop, 'casaConstruida', 0);
        }
      });

      Vue.set(jogador, 'dinheiro', jogador.dinheiro);
      Vue.set(jogador, 'propriedades', jogador.propriedades);

      // Verificar se ainda está em falência
      if (jogador.verificarFalencia()) {
        this.modal.saldoAtual = jogador.dinheiro;
        this.modal.divida = Math.abs(jogador.dinheiro);
        this.modal.propriedadesVendiveis = [...jogador.propriedades];
        this.modal.propriedadesSelecionadas = [];
        
        if (jogador.propriedades.length === 0) {
          this.modal.mensagemAlerta = 'Você não possui mais propriedades. Declare falência.';
        } else {
          this.modal.mensagemAlerta = `Você vendeu propriedades por R$ ${totalArrecadado}, mas ainda está devendo.`;
        }
      } else {
        // Conseguiu quitar a dívida
        this.modal.mostra = false;
        this.modal.tipo = 4;
        this.modal.mostra = true;
        this.modal.mensagem = `${jogador.nome} quitou a dívida vendendo propriedades!`;
        this.modal.mensagemAlerta = `Total arrecadado: R$ ${totalArrecadado}`;
        this.modal.passarVez = true; // Passa a vez após quitar a dívida
      }
    },

    async declararFalencia() {
      const jogador = this.jogadorAtivo;
      this.tabuleiro.eliminarJogador(jogador);

      // Força atualização visual do jogador falido
      Vue.set(jogador, 'falido', true);

      this.modal.mostra = false;
      this.modal.tipo = 4;
      this.modal.mostra = true;
      this.modal.mensagem = `${jogador.nome} faliu e foi eliminado do jogo! 💔`;
      this.modal.mensagemAlerta = '';
      this.modal.passarVez = true;

      // Verificar se há um vencedor
      const vencedor = this.tabuleiro.verificarVitoria();
      if (vencedor) {
        setTimeout(() => {
          this.modal.mensagem = `🎉 ${vencedor.nome} VENCEU O JOGO! 🎉`;
          this.modal.mensagemAlerta = `Parabéns! Você é o único jogador restante.`;
        }, 2000);
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

      // Realiza o pagamento (agora sempre funciona, mesmo sem saldo)
      this.jogadorAtivo.pagar(_valor);
      _jogador.receber(_valor);
      
      // Atualiza UI
      Vue.set(_jogador, 'dinheiro', _jogador.dinheiro);
      Vue.set(this.jogadorAtivo, 'dinheiro', this.jogadorAtivo.dinheiro);
      
      this.modal.mostra = false;
      
      // Verificar falência após pagamento
      if (this.verificarFalencia(this.jogadorAtivo)) {
        return; // Modal de falência será exibido (ou bot gerencia automaticamente)
      }

      // Após pagar aluguel, exibe opção de comprar a propriedade (tipo = 1)
      casa.funcao(this.jogadorAtivo, this.modal, 1);
    }
  }
});

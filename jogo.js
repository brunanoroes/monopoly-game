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
    jogoEncerrado: false, // Indica quando o jogo foi finalizado
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
      propriedadesSelecionadas: [],
      mostrarOpcaoPagarFianca: false,
      valorFianca: 250
    },
    areadados: {x: 45, y: 50},
    jogodiv: {x: 5, y: 75},
    dados: {
      numero1 : 1,
      numero2 : 1
    },
    escolhaBairros: {
      bairros: [],
      mensagem: '',
      mensagemAlerta: '',
      mostra: false
    },
    numeroCasasTeste: 0,
    modoTeste: false,
    // Timer da partida
    tempoDecorrido: 0, // em segundos
    timerInterval: null,
    inicioPartida: null
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

    // Inicia o timer da partida
    this.iniciarTimer();

    // Inicia o turno do bot se for bot
    if (this.jogadorAtivo && this.jogadorAtivo.tipo === 'bot') {
      this.iniciarTurnoBot();
    }
  },
  computed: {
    tempoFormatado() {
      const horas = Math.floor(this.tempoDecorrido / 3600);
      const minutos = Math.floor((this.tempoDecorrido % 3600) / 60);
      const segundos = this.tempoDecorrido % 60;
      
      if (horas > 0) {
        return `${horas}:${String(minutos).padStart(2, '0')}:${String(segundos).padStart(2, '0')}`;
      }
      return `${minutos}:${String(segundos).padStart(2, '0')}`;
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
      if (!this.jogadorAtivo || this.jogadorAtivo.tipo !== 'bot' || this.jogoEncerrado) return;
      
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
      await this.aguardar(500);
      await this.passarVez();
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
      await this.aguardar(500);
      await this.passarVez();
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
        await this.passarVez();
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

        await this.passarVez();
      } else {
        // Bot não tem como quitar - declara falência
        this.mensagemBot = `${jogador.nome} não consegue pagar a dívida...`;
        await this.aguardar(1500);

        this.tabuleiro.eliminarJogador(jogador);
        Vue.set(jogador, 'falido', true);

        this.mensagemBot = `${jogador.nome} faliu e foi eliminado! 💔`;
        await this.aguardar(2000);

        // Verificar se há um vencedor
        const resultado = this.tabuleiro.verificarVitoria();
        if (resultado) {
          this.mensagemBot = '';
          this.botPensando = false;
          this.jogoEncerrado = true;
          this.dadosBloqueados = true;
          this.pararTimer(); // Para o timer
          
          // Exibir modal de vitória
          this.modal.tipo = 7;
          this.modal.mostra = true;
          this.modal.mensagem = `🎉 ${resultado.jogador.nome} VENCEU O JOGO! 🎉`;
          
          if (resultado.tipo === 'praias') {
            this.modal.mensagemAlerta = `${resultado.jogador.nome} conquistou todas as praias e dominou o litoral! 🏖️<br><br>⏱️ Tempo de partida: ${this.tempoFormatado}`;
          } else {
            this.modal.mensagemAlerta = `${jogador.nome} faliu. ${resultado.jogador.nome} é o único jogador restante e conquistou a vitória!<br><br>⏱️ Tempo de partida: ${this.tempoFormatado}`;
          }
          this.modal.passarVez = false;
          return;
        }

        await this.passarVez();
      }
    },

    async botProcessarCasaEspecial(casa) {
      if (!this.jogadorAtivo || this.jogadorAtivo.tipo !== 'bot') return;

      // Fecha todos os modais
      this.modal.mostra = false;
      this.escolhaBairros.mostra = false;

      this.botPensando = true;
      this.mensagemBot = `${this.jogadorAtivo.nome} caiu em ${casa.nome}...`;
      await this.aguardar(1000);

      try {
        switch (casa.nome) {
          case 'MAC':
            await this.botProcessarMAC();
            break;
          
          case 'Terminal':
            await this.botProcessarTerminal();
            break;
          
          case 'UFF':
            // A prisão é gerenciada em jogarTurno
            this.mensagemBot = `${this.jogadorAtivo.nome} caiu na UFF! 📚`;
            await this.aguardar(1500);
            break;
          
          case 'Plaza':
            this.jogadorAtivo.dinheiro -= 100;
            this.mensagemBot = `${this.jogadorAtivo.nome} gastou R$100 no Plaza! 🛍️`;
            Vue.set(this.jogadorAtivo, 'dinheiro', this.jogadorAtivo.dinheiro);
            await this.aguardar(1500);
            break;
          
          case 'Início':
            this.jogadorAtivo.dinheiro += 200;
            this.mensagemBot = `${this.jogadorAtivo.nome} recebeu R$200! 🎁`;
            Vue.set(this.jogadorAtivo, 'dinheiro', this.jogadorAtivo.dinheiro);
            await this.aguardar(1500);
            break;
        }
      } catch (error) {
        console.error('[ERRO-CASA-ESPECIAL]', error);
      }
      
      // SEMPRE passa a vez
      await this.passarVez();
    },

    async botProcessarMAC() {
      const minhasPropriedades = this.tabuleiro.casas.filter(c => 
        c.proprietarioCor === this.jogadorAtivo.cor && c.tipo === 'propriedade'
      );

      if (minhasPropriedades.length === 0) {
        this.mensagemBot = `${this.jogadorAtivo.nome} não tem propriedades`;
        await this.aguardar(1500);
        return;
      }

      // Escolhe propriedade com maior aluguel médio
      const melhorProp = minhasPropriedades.reduce((melhor, atual) => {
        const aluguelAtual = atual.fee.reduce((a, b) => a + b, 0) / atual.fee.length;
        const aluguelMelhor = melhor.fee.reduce((a, b) => a + b, 0) / melhor.fee.length;
        return aluguelAtual > aluguelMelhor ? atual : melhor;
      });

      this.mensagemBot = `${this.jogadorAtivo.nome} valorizou ${melhorProp.nome}! 🎨`;
      
      // Remove bônus anterior
      this.tabuleiro.casas.forEach(c => {
        if (c.valorizada) {
          c.prices = c.prices.map(p => p - 200);
          c.fee = c.fee.map(f => f - 100);
          c.valorizada = false;
        }
      });
      
      // Aplica novo bônus
      melhorProp.prices = melhorProp.prices.map(p => p + 200);
      melhorProp.fee = melhorProp.fee.map(f => f + 100);
      melhorProp.valorizada = true;
      
      await this.aguardar(1500);
    },

    async botProcessarTerminal() {
      // Todas as propriedades do tabuleiro
      const todasPropriedades = this.tabuleiro.casas.filter(c => c.tipo === 'propriedade');
      
      let casaEscolhida = null;
      
      // 1ª Prioridade: Propriedades disponíveis (sem dono) da mesma cor que já possui
      if (this.jogadorAtivo.propriedades && this.jogadorAtivo.propriedades.length > 0) {
        for (const prop of this.jogadorAtivo.propriedades) {
          const mesmaCor = todasPropriedades.find(c => 
            c.cor === prop.cor && 
            !c.proprietarioCor
          );
          if (mesmaCor) {
            casaEscolhida = mesmaCor;
            break;
          }
        }
      }
      
      // 2ª Prioridade: Qualquer propriedade disponível (sem dono)
      if (!casaEscolhida) {
        const disponiveis = todasPropriedades.filter(c => !c.proprietarioCor);
        if (disponiveis.length > 0) {
          const idx = Math.floor(Math.random() * disponiveis.length);
          casaEscolhida = disponiveis[idx];
        }
      }
      
      // 3ª Prioridade: Se não há disponíveis, escolhe qualquer uma aleatoriamente
      if (!casaEscolhida && todasPropriedades.length > 0) {
        const idx = Math.floor(Math.random() * todasPropriedades.length);
        casaEscolhida = todasPropriedades[idx];
      }
      
      if (casaEscolhida) {
        // Move imediatamente para a casa escolhida
        const casaAtual = this.tabuleiro.casas.find(casa =>
          casa.listaJogadores.includes(this.jogadorAtivo.cor)
        );

        if (casaAtual) {
          const index = casaAtual.listaJogadores.indexOf(this.jogadorAtivo.cor);
          if (index > -1) {
            casaAtual.listaJogadores.splice(index, 1);
          }
        }

        casaEscolhida.listaJogadores.push(this.jogadorAtivo.cor);
        this.jogadorAtivo.localizacaoAtual = casaEscolhida.id;
        this.EstilizarObjetoPosicao(this.jogadorAtivo);
        
        this.mensagemBot = `${this.jogadorAtivo.nome} vai para ${casaEscolhida.nome}! 🚌`;
        await this.aguardar(1500);
        
        // Processa a nova casa (compra, aluguel, etc)
        casaEscolhida.funcao(this.jogadorAtivo, this.modal);
        await this.aguardar(800);
        await this.processarAcaoBot(casaEscolhida);
      } else {
        this.mensagemBot = `${this.jogadorAtivo.nome} não escolheu destino`;
        await this.aguardar(1500);
      }
    },

    aguardar(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
    },

    iniciarTimer() {
      this.inicioPartida = Date.now();
      this.timerInterval = setInterval(() => {
        this.tempoDecorrido = Math.floor((Date.now() - this.inicioPartida) / 1000);
      }, 1000);
    },

    pararTimer() {
      if (this.timerInterval) {
        clearInterval(this.timerInterval);
        this.timerInterval = null;
      }
    },

    async passarVez() {
      this.mensagemBot = '';
      this.botPensando = false;
      this.jogadorAtivo = await this.tabuleiro.getProximoJogadorAtivo(this.jogadorAtivo);
      this.dadosBloqueados = false;
    },

    async pagarFiancaUFF() {
      if (!this.jogadorAtivo || this.jogadorAtivo.dinheiro < this.modal.valorFianca) {
        alert('Você não tem dinheiro suficiente para pagar a fiança!');
        return;
      }

      // Deduz o valor da fiança
      this.jogadorAtivo.dinheiro -= this.modal.valorFianca;
      this.jogadorAtivo.pagouFiancaUFF = true; // Marca que pagou a fiança
      Vue.set(this.jogadorAtivo, 'dinheiro', this.jogadorAtivo.dinheiro);
      Vue.set(this.jogadorAtivo, 'pagouFiancaUFF', true);

      // Fecha o modal
      this.modal.mostra = false;
      this.modal.mostrarOpcaoPagarFianca = false;

      // Passa a vez
      await this.passarVez();
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

      // No começo do turno do jogador: movimento do Terminal
      if (this.jogadorAtivo.proximoBairro) {
        const destino = this.jogadorAtivo.proximoBairro;

        // Encontra a casa de destino
        const casaDestino = this.tabuleiro.casas.find(c => c.nome === destino);
        
        if (casaDestino) {
          // Remove o jogador da casa atual
          const casaAtual = this.tabuleiro.casas[this.jogadorAtivo.localizacaoAtual];
          if (casaAtual && casaAtual.listaJogadores) {
            const index = casaAtual.listaJogadores.indexOf(this.jogadorAtivo.cor);
            if (index > -1) {
              casaAtual.listaJogadores.splice(index, 1);
            }
          }
          
          // Move o jogador para a casa de destino
          this.jogadorAtivo.localizacaoAtual = casaDestino.id;
          if (!casaDestino.listaJogadores) {
            casaDestino.listaJogadores = [];
          }
          casaDestino.listaJogadores.push(this.jogadorAtivo.cor);
          
          // Aguarda animação visual
          await this.aguardar(800);
          
          // Executa a função da casa de destino
          casaDestino.funcao(this.jogadorAtivo, this.modal);
          
          // Se for bot, processa a ação
          if (this.jogadorAtivo.tipo === 'bot') {
            await this.aguardar(800);
            await this.processarAcaoBot(casaDestino);
          } else if (!this.modal.mostra) {
            this.dadosBloqueados = false;
          }
        }

        // Limpa o valor para voltar ao normal
        this.jogadorAtivo.proximoBairro = null;
        return;
      }


      this.dadosBloqueados = true;

      let novaCasa;

      if (_tipo) {
        // Modo teste
        const numCasas = parseInt(this.numeroCasasTeste) || 0;
        novaCasa = await this.tabuleiro.atualizarCasaJogador(jogador, numCasas);
        this.numeroCasasTeste = 0;
      } 
      else {
        // 📌 Achar a casa atual do jogador ANTES de jogar dados
        const casaAtualJogador = this.tabuleiro.casas.find(casa =>
          casa.listaJogadores.includes(jogador.cor)
        );

        // 📌 Regra da UFF (Prisão) - Verifica se está fisicamente na UFF E não pagou fiança
        if (casaAtualJogador?.nome === "UFF" && !jogador.pagouFiancaUFF) {
          // Modo normal: lança dados para verificar se tirou duplo 6
          const resultado = jogador.jogarDados(this.tabuleiro.totalCasas);
          this.dados.numero1 = resultado.dado1;
          this.dados.numero2 = resultado.dado2;
          const tirouDuploSeis = resultado.dado1 === 6 && resultado.dado2 === 6;

          if (!tirouDuploSeis) {
            // Não tirou duplo 6, fica preso
            if (jogador.tipo !== 'bot') {
              // Jogador humano: mostra opção de pagar fiança
              this.modal.tipo = 4;
              this.modal.mostra = true;
              this.modal.mensagem = `<strong>📚 Você está preso na UFF!</strong><br>Tire duplo 6 (duas vezes o 6) para sair da prisão ou pague R$ 250 de fiança.`;
              this.modal.mostrarOpcaoPagarFianca = true;
              this.modal.valorFianca = 250;
              this.modal.passarVez = true;
            } else {
              // Bot: decide se paga a fiança
              if (jogador.dinheiro >= 500) {
                jogador.dinheiro -= 250;
                jogador.pagouFiancaUFF = true;
                Vue.set(jogador, 'dinheiro', jogador.dinheiro);
                Vue.set(jogador, 'pagouFiancaUFF', true);
                this.mensagemBot = `${jogador.nome} pagou R$ 250 para sair da UFF! 💰`;
                await this.aguardar(1500);
              } else {
                this.mensagemBot = `${jogador.nome} ficou preso na UFF! 📚`;
                await this.aguardar(1500);
              }
              await this.passarVez();
            }
            this.dadosBloqueados = false;
            return;
          } else {
            // Tirou duplo 6! Move e sai da prisão
            jogador.pagouFiancaUFF = false; // Reseta flag
            Vue.set(jogador, 'pagouFiancaUFF', false);
            
            if (jogador.tipo !== 'bot') {
              this.modal.tipo = 4;
              this.modal.mostra = true;
              this.modal.mensagem = `<strong>🎉 Você tirou duplo 6!</strong><br>Você está livre da UFF e pode se mover.`;
              this.modal.passarVez = false;
              await this.aguardar(1500);
              this.modal.mostra = false;
            } else {
              this.mensagemBot = `${jogador.nome} tirou duplo 6 e saiu da UFF! 🎲`;
              await this.aguardar(1500);
            }
            
            // Move o jogador com a soma dos dados
            novaCasa = await this.tabuleiro.atualizarCasaJogador(jogador, resultado.soma);
          }
        } else if (casaAtualJogador?.nome === "UFF" && jogador.pagouFiancaUFF) {
          // Pagou a fiança, joga normalmente e sai da UFF
          const resultado = jogador.jogarDados(this.tabuleiro.totalCasas);
          this.dados.numero1 = resultado.dado1;
          this.dados.numero2 = resultado.dado2;
          novaCasa = await this.tabuleiro.atualizarCasaJogador(jogador, resultado.soma);
          
          // Reseta a flag de fiança paga
          jogador.pagouFiancaUFF = false;
          Vue.set(jogador, 'pagouFiancaUFF', false);
        } else {
          // Não está na UFF - joga normalmente
          const resultado = jogador.jogarDados(this.tabuleiro.totalCasas);
          this.dados.numero1 = resultado.dado1;
          this.dados.numero2 = resultado.dado2;
          novaCasa = await this.tabuleiro.atualizarCasaJogador(jogador, resultado.soma);
        }
      }

      // Executa lógica da casa
      novaCasa.funcao(jogador, this.modal);

      // Jogador bot
      if (jogador.tipo === "bot") {
        await this.aguardar(800);
        await this.processarAcaoBot(novaCasa);
        // Para bots, dadosBloqueados é gerenciado dentro de processarAcaoBot
        // Não desbloqueia aqui
      } else {
        // Para jogadores humanos, desbloqueia se não houver modal
        // Se houver modal, será desbloqueado após a ação (confirmar compra, etc)
        if (!this.modal.mostra) {
          this.dadosBloqueados = false;
        }
      }
    },

    async processarAcaoBot(casa) {
      if (!this.modal.mostra) {
        await this.aguardar(500);
        await this.passarVez();
        return;
      }
      
      this.modal.mostra = false;
      
      // Processa conforme tipo de modal
      switch (this.modal.tipo) {
        case 1:
        case 2:
          await this.botDecidirCompra(casa);
          break;
        case 3:
          await this.botPagarAluguel();
          break;
        case 4:
          this.mensagemBot = `${this.jogadorAtivo.nome} continua...`;
          await this.aguardar(1000);
          await this.passarVez();
          break;
        case 5:
          await this.botExecutarCartaSorte();
          break;
        case 6:
          // Falência já tratada
          return;
        case 7:
          await this.botProcessarCasaEspecial(casa);
          break;
        default:
          await this.passarVez();
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
      
      // Verificar se o jogador venceu por dominar todas as praias
      const resultado = this.tabuleiro.verificarVitoria();
      if (resultado && resultado.tipo === 'praias') {
        this.jogoEncerrado = true;
        this.dadosBloqueados = true;
        this.pararTimer(); // Para o timer
        this.modal.mostra = false;
        this.modal.tipo = 7;
        this.modal.mostra = true;
        this.modal.mensagem = `🎉 ${resultado.jogador.nome} VENCEU O JOGO! 🎉`;
        this.modal.mensagemAlerta = `${resultado.jogador.nome} conquistou todas as praias e dominou o litoral! 🏖️<br><br>⏱️ Tempo de partida: ${this.tempoFormatado}`;
        this.modal.passarVez = false;
        return;
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
        this.modal.mostrarOpcaoPagarFianca = false;
        this.escolhaBairros.mostra = false;
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
        
        // Verificar se alguém venceu após esta venda (improvável, mas verificação de segurança)
        const resultado = this.tabuleiro.verificarVitoria();
        if (resultado) {
          this.jogoEncerrado = true;
          this.dadosBloqueados = true;
          this.pararTimer(); // Para o timer
          this.modal.mostra = false;
          this.modal.tipo = 7;
          this.modal.mostra = true;
          this.modal.mensagem = `🎉 ${resultado.jogador.nome} VENCEU O JOGO! 🎉`;
          
          if (resultado.tipo === 'praias') {
            this.modal.mensagemAlerta = `${resultado.jogador.nome} conquistou todas as praias e dominou o litoral! 🏖️<br><br>⏱️ Tempo de partida: ${this.tempoFormatado}`;
          } else {
            this.modal.mensagemAlerta = `Apenas um jogador permanece ativo!<br><br>⏱️ Tempo de partida: ${this.tempoFormatado}`;
          }
          this.modal.passarVez = false;
        }
      }
    },

    async declararFalencia() {
      const jogador = this.jogadorAtivo;
      this.tabuleiro.eliminarJogador(jogador);

      // Força atualização visual do jogador falido
      Vue.set(jogador, 'falido', true);

      // Verificar se há um vencedor
      const resultado = this.tabuleiro.verificarVitoria();
      
      if (resultado) {
        // Encerrar o jogo
        this.jogoEncerrado = true;
        this.dadosBloqueados = true;
        this.pararTimer(); // Para o timer
        
        // Exibir modal de vitória
        this.modal.mostra = false;
        this.modal.tipo = 7; // Tipo 7 = Vitória
        this.modal.mostra = true;
        this.modal.mensagem = `🎉 ${resultado.jogador.nome} VENCEU O JOGO! 🎉`;
        
        if (resultado.tipo === 'praias') {
          this.modal.mensagemAlerta = `${resultado.jogador.nome} conquistou todas as praias e dominou o litoral! 🏖️<br><br>⏱️ Tempo de partida: ${this.tempoFormatado}`;
        } else {
          this.modal.mensagemAlerta = `${jogador.nome} faliu. ${resultado.jogador.nome} é o único jogador restante e conquistou a vitória!<br><br>⏱️ Tempo de partida: ${this.tempoFormatado}`;
        }
        this.modal.passarVez = false;
      } else {
        // Ainda há jogadores, apenas mostrar mensagem de falência
        this.modal.mostra = false;
        this.modal.tipo = 4;
        this.modal.mostra = true;
        this.modal.mensagem = `${jogador.nome} faliu e foi eliminado do jogo! 💔`;
        this.modal.mensagemAlerta = '';
        this.modal.passarVez = true;
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
        _jogador.receber(_valor)
        this.dismiss()
        casa.funcao(this.jogadorAtivo, this.modal, 1);
      }else{
        // Atualiza UI
        Vue.set(_jogador, 'dinheiro', _jogador.dinheiro);
        Vue.set(this.jogadorAtivo, 'dinheiro', this.jogadorAtivo.dinheiro);
        
        this.modal.mostra = false;
        
        // Verificar falência após pagamento
        if (this.verificarFalencia(this.jogadorAtivo)) {
          return; // Modal de falência será exibido
        }

        // Após pagar aluguel, exibe opção de comprar a propriedade (tipo = 1)
        casa.funcao(this.jogadorAtivo, this.modal, 1);
        }  
      
    },

    async funcaoEspecial(){
      this.modal.mostra = false;
      const casa = this.tabuleiro.casas.find(
        casa => casa.id === this.jogadorAtivo.localizacaoAtual
      );
      casa.funcaoEspecial(this.escolhaBairros, this.tabuleiro.casas, this.jogadorAtivo)
      
      // Casas que passam a vez automaticamente (não requerem escolha)
      const casasQueMovem = ["Plaza", "Início"];

      // Só passa a vez automaticamente se for jogador humano e for uma casa que não requer escolha
      if (casasQueMovem.includes(casa.nome) && this.jogadorAtivo.tipo !== 'bot') {
        this.jogadorAtivo = await this.tabuleiro.getProximoJogadorAtivo(this.jogadorAtivo);
        this.dadosBloqueados = false;
      }
      
      // Se MAC ou Terminal sem propriedades disponíveis, passa a vez
      if ((casa.nome === 'MAC' || casa.nome === 'Terminal') && this.escolhaBairros.bairros.length === 0) {
        this.escolhaBairros.mostra = false;
        this.jogadorAtivo = await this.tabuleiro.getProximoJogadorAtivo(this.jogadorAtivo);
        this.dadosBloqueados = false;
      }
      
      // Para bots, o processamento é feito em botProcessarCasaEspecial
      // Para MAC e Terminal (jogadores humanos), a vez é passada em bairroSelecionado
    },
    
    async bairroSelecionado(bairro) {
      console.log("Bairro escolhido:", bairro);

      const casaAtualJogador = this.tabuleiro.casas.find(casa =>
        casa.listaJogadores.includes(this.jogadorAtivo.cor)
      );

      const casaSelecionada = this.tabuleiro.casas.find(casa =>
        casa.nome === bairro
      );

      if (!casaAtualJogador || !casaSelecionada) return;

      // --- Regra MAC ---
      if (casaAtualJogador.nome === 'MAC') {
        // Remove bônus do bairro anteriormente valorizado (se houver)
        this.tabuleiro.casas.forEach(casa => {
          if (casa.tipo === 'propriedade' && casa.valorizada) {
            // Reverte os valores originais
            casa.prices = casa.prices.map(p => p - 200);
            casa.fee = casa.fee.map(f => f - 100);
            casa.valorizada = false;
          }
        });
        
        // Aplica bônus ao novo bairro escolhido
        casaSelecionada.prices = casaSelecionada.prices.map(p => p + 200);
        casaSelecionada.fee = casaSelecionada.fee.map(f => f + 100);
        casaSelecionada.valorizada = true; // Marca como valorizada
      }

      // --- Regra Terminal ---
      if (casaAtualJogador.nome === 'Terminal') {
        // Move imediatamente para a casa escolhida
        const index = casaAtualJogador.listaJogadores.indexOf(this.jogadorAtivo.cor);
        if (index > -1) {
          casaAtualJogador.listaJogadores.splice(index, 1);
        }
        
        casaSelecionada.listaJogadores.push(this.jogadorAtivo.cor);
        this.jogadorAtivo.localizacaoAtual = casaSelecionada.id;
        this.EstilizarObjetoPosicao(this.jogadorAtivo);
        
        // Fecha o modal de escolha
        this.escolhaBairros.mostra = false;
        
        // Processa a nova casa (permite compra, aluguel, etc)
        casaSelecionada.funcao(this.jogadorAtivo, this.modal);
        
        // Se não abriu modal, passa a vez
        if (!this.modal.mostra) {
          this.jogadorAtivo = await this.tabuleiro.getProximoJogadorAtivo(this.jogadorAtivo);
          this.dadosBloqueados = false;
        }
        return;
      }

      // Fecha o modal de escolha de bairros
      this.escolhaBairros.mostra = false;

      // Passa a vez do jogador (para MAC)
      this.jogadorAtivo = await this.tabuleiro.getProximoJogadorAtivo(this.jogadorAtivo);
      this.dadosBloqueados = false;
    }

  }
});

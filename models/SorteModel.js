import Casa from "./CasaModel.js";
import cartasSorte from "../data/cartasSorte.js";

export default class Sorte extends Casa {
    constructor(id, nome, x, y, listaJogadores, lateral) {
        super(id, nome, x, y, listaJogadores);
        this.lateral = lateral;
        this.cartas = [...cartasSorte];
        this.embaralharCartas();
    }
    
    embaralharCartas() {
        for (let i = this.cartas.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.cartas[i], this.cartas[j]] = [this.cartas[j], this.cartas[i]];
        }
    }
    
    funcao(jogador, modal) {
        const carta = this.cartas.shift();
        
        modal.tipo = 5; // Novo tipo específico para cartas de sorte/azar
        modal.mostra = true;
        modal.mensagem = carta.mensagem;
        modal.mensagemAlerta = carta.valor ? `Valor: R$ ${carta.valor}` : '';
        
        // Configurar a função que será executada quando clicar em Continuar
        modal.executarCartaSorte = () => {
            const app = document.getElementById('appVue').__vue__;
            const tabuleiro = app.tabuleiro;
            // flags de controle do fluxo no modal
            modal.passarVez = false;
            modal.keepOpen = false;

            switch (carta.funcao) {
                case 'sorte':
                    jogador.receber(carta.valor);
                    Vue.set(jogador, 'dinheiro', jogador.dinheiro);
                    // após ganhar/perder dinheiro, passa a vez
                    modal.passarVez = true;
                    break;
                case 'azar':
                    if (jogador.pagar(carta.valor)) {
                        Vue.set(jogador, 'dinheiro', jogador.dinheiro);
                    } else {
                        // Jogador não conseguiu pagar, registra dívida
                        jogador.dinheiro -= carta.valor;
                        Vue.set(jogador, 'dinheiro', jogador.dinheiro);
                    }
                    
                    // Verificar falência após o pagamento/dívida
                    if (app.verificarFalencia && jogador.verificarFalencia()) {
                        modal.mostra = false;
                        app.verificarFalencia(jogador);
                        return; // Sai para exibir modal de falência
                    }
                    
                    // independente de conseguir pagar, finaliza e passa a vez
                    modal.passarVez = true;
                    break;
                case 'mover':
                    // Encontrar a casa no tabuleiro usando o array de casas do tabuleiro
                    const casaDestino = tabuleiro.casas.find(casa => casa.nome === carta.destino);
                    
                    if (casaDestino) {
                        // Remover o jogador da casa atual
                        const casaAtual = tabuleiro.casas[jogador.localizacaoAtual];
                        if (casaAtual && casaAtual.listaJogadores) {
                            // listaJogadores armazena apenas a cor (string)
                            casaAtual.listaJogadores = casaAtual.listaJogadores.filter(cor => cor !== jogador.cor);
                            Vue.set(casaAtual, 'listaJogadores', casaAtual.listaJogadores);
                        }
                        
                        // Mover o jogador para a nova casa
                        jogador.localizacaoAtual = casaDestino.id;
                        if (!casaDestino.listaJogadores) {
                            casaDestino.listaJogadores = [];
                        }
                        // manter consistência: armazenar apenas a cor do peão
                        casaDestino.listaJogadores.push(jogador.cor);
                        Vue.set(casaDestino, 'listaJogadores', casaDestino.listaJogadores);
                        Vue.set(jogador, 'localizacaoAtual', casaDestino.id);

                        if (['propriedade', 'praia'].includes(casaDestino.tipo)) {
                            if (casaDestino.funcao && typeof casaDestino.funcao === 'function') {
                                casaDestino.funcao(jogador, modal);
                                modal.keepOpen = true;
                            }
                        } else {
                            if (casaDestino.funcao && typeof casaDestino.funcao === 'function') {
                                casaDestino.funcao(jogador, modal);
                            }
                            modal.passarVez = true;
                        }
                    }
                    break;
            }
            // Coloca a carta no final do baralho após a execução
            this.cartas.push(carta);
            // não fechar aqui; quem decide é o handler no jogo.js conforme flags
        };
    }

    // Removido método executarAcaoCarta pois toda a lógica foi movida para o callback do modal
    // const carta = this.cartasSorte.shift(); // pega a primeira carta
    // this.cartasSorte.push(carta); // coloca no final do baralho

    // modal.tipo = 1;
    // modal.mostra = true;
    // modal.mensagem = carta.descricao || carta.conteudo;

    // // Exemplos de efeitos simples:
    // if (carta.conteudo.includes('ponto de partida')) {
    //   jogador.localizacaoAtual = 0;
    //   jogador.receber(200);
    // }
    // if (carta.conteudo.includes('Multa')) {
    //   jogador.pagar(15);
    // }
    // if (carta.conteudo.includes('prisão')) {
    //   jogador.localizacaoAtual = 10; // posição da prisão
    // }
  }
  

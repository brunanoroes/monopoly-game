import Casa from "./CasaModel.js";

export default class Propriedade extends Casa {
    constructor(id, nome, x, y, listaJogadores, prices = [], fee = [], casaConstruida = 0, proprietarioCor = null, cor, lateral) {
        super(id, nome, x, y, listaJogadores);
        this.prices = prices;
        this.fee = fee;
        this.casaConstruida = casaConstruida; //1, 2, 3 ou 4
        this.proprietarioCor = proprietarioCor; //'azul', 'vermelho', 'verde', 'amarelo'
        this.cor = cor;
        this.lateral = lateral;
    }
    funcao(jogador, modal) {
        if (!this.proprietarioCor) {
            // Casa sem dono, pode comprar
            modal.tipo = 1;
            modal.mostra = true;
            modal.mensagem = `Deseja comprar ${this.nome}?`;
            modal.prices = this.prices;
            // A lógica de compra deve ser tratada no Vue após confirmação do usuário
        } else if (this.proprietarioCor !== jogador.cor) {
            // Pagar aluguel
            const aluguel = this.fee ? this.fee[this.casaConstruida || 0] : 0;
            modal.tipo = 4;
            modal.mostra = true;
            modal.mensagem = `Pague aluguel de R$${aluguel} para o proprietário.`;
            modal.precoAluguel = aluguel;
            jogador.pagar(aluguel);
            // Encontrar o proprietário e pagar
            const proprietario = this.jogadores.find(j => j.cor === this.proprietarioCor);
            if (proprietario) proprietario.receber(aluguel);
        } else {
            // O jogador caiu em sua própria propriedade
            modal.tipo = 5;
            modal.mostra = true;
            modal.mensagem = `Você está em sua própria propriedade.`;
        }
    }

    comprarCasa(jogador, selectedOption, modal) {
        if (!selectedOption) {
            modal.mensagemAlerta = 'Selecione uma opção.';
            return;
        }
        if (this && !this.proprietarioCor) {
            const preco = this.prices ? this.prices[selectedOption] : 0;
            if (jogador.dinheiro >= preco) {
                jogador.pagar(preco);
                this.proprietarioCor = jogador.cor;
                this.casaConstruida = selectedOption; // Marca o nível da construção
                jogador.propriedades.push(this);
                modal.mostra = false;
            }
            else {
                modal.mensagemAlerta = 'Saldo insuficiente para comprar esta propriedade.';
            }
        }
    }

}
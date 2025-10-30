import Casa from "./CasaModel.js";

export default class Propriedade extends Casa {
    constructor(id, nome, x, y, listaJogadores, prices = [], fee = [], casaConstruida = 0, proprietarioCor = null, cor, lateral, tipo) {
        super(id, nome, x, y, listaJogadores);
        this.prices = prices;
        this.fee = fee;
        this.casaConstruida = casaConstruida; //1, 2, 3 ou 4
        this.proprietarioCor = proprietarioCor; //'azul', 'vermelho', 'verde', 'amarelo'
        this.cor = cor;
        this.lateral = lateral;
        this.tipo = tipo
    }
    funcao(jogador, modal, tipo = 0) {
        if (this.proprietarioCor !== jogador.cor && this.proprietarioCor && !tipo) {
            // Pagar aluguel
            const aluguel = this.fee ? this.fee[this.casaConstruida - 1 || 0] : 0;
            modal.tipo = 3;
            modal.mostra = true;
            modal.mensagem = `Pague aluguel de R$${aluguel} para o proprietário.`;
            modal.precoAluguel = aluguel;
        }
        else {
            modal.tipo = 1;
            modal.selected = 0;
            modal.mostra = true;
            modal.mensagem = `Deseja comprar ${this.nome}?`;          
            if(tipo){
                modal.prices = this.prices.map(preco => preco + 100);
                modal.disabled = [true, true, true, true];
                if (this.casaConstruida >= 0 && this.casaConstruida < 4) {
                    modal.disabled[this.casaConstruida - 1] = false;
                }
            }
            else {
                modal.prices = this.prices;
                modal.disabled = [true, true, true, true];
                if (this.casaConstruida >= 0 && this.casaConstruida < 4) {
                    modal.disabled[this.casaConstruida] = false;
                }
            }
        }
    }

    comprarCasa(jogador, modal) {
        const tipoCasa = modal.selected;
        if (!tipoCasa) {
            modal.mensagemAlerta = 'Selecione uma opção.';
            return;
        }
        const preco = this.prices[tipoCasa - 1] + (this.proprietarioCor ? 100 : 0);
        if(!jogador.pagar(preco)){
            modal.mensagemAlerta = 'Saldo insuficiente.';
            return false
        }
            this.proprietarioCor = jogador.cor;
            this.casaConstruida = tipoCasa;
            jogador.propriedades.push(this);
            modal.mostra = false;
    }
}
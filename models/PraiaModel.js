import Casa from "./CasaModel.js";

export default class Praia extends Casa {
    constructor(id, nome, x, y, listaJogadores, price = 0, fee = 0, proprietarioCor = null, lateral, casaConstruida = 0, tipo) {
        super(id, nome, x, y, listaJogadores);
        this.price = price;
        this.fee = fee;
        this.casaConstruida = casaConstruida;
        this.proprietarioCor = proprietarioCor; //'azul', 'vermelho', 'verde', 'amarelo'
        this.lateral = lateral;
        this.tipo = tipo;
    }
    funcao(jogador, modal, tipo = 0) {
        if(this.proprietarioCor !== jogador.cor && this.proprietarioCor && !tipo) {
            // Pagar aluguel
            const aluguel = this.fee ? this.fee : 0;
            modal.tipo = 3;
            modal.mostra = true;
            modal.mensagem = `Pague aluguel da sua barraquinha de R$${aluguel} para o proprietário.`;
            modal.precoAluguel = aluguel;
        } 
        else {
            // Casa sem dono, pode comprar
            modal.tipo = 2;
            modal.mostra = true;
            modal.mensagem = `Deseja comprar a praia de ${this.nome}?`;
            
            modal.prices = this.price + (this.proprietarioCor ? 100 : 0);
        }
    }

    comprarCasa(jogador, modal) {
        const preco = this.price + (this.proprietarioCor ? 100 : 0);
            if(!jogador.pagar(preco)){
                modal.mensagemAlerta = 'Saldo insuficiente.';
                return false
            }
            this.proprietarioCor = jogador.cor;
            this.casaConstruida = 5;
            jogador.propriedades.push(this);
            modal.mostra = false;
        
    }

}
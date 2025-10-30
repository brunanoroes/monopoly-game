import Casa from "./CasaModel.js";

export default class Praia extends Casa {
    constructor(id, nome, x, y, listaJogadores, price = 0, fee = 0, proprietarioCor = null, lateral, casaConstruida = 0) {
        super(id, nome, x, y, listaJogadores);
        this.price = price;
        this.fee = fee;
        this.casaConstruida = casaConstruida;
        this.proprietarioCor = proprietarioCor; //'azul', 'vermelho', 'verde', 'amarelo'
        this.lateral = lateral;
    }
    funcao(jogador, modal) {
        if (!this.proprietarioCor) {
            // Casa sem dono, pode comprar
            modal.tipo = 2;
            modal.mostra = true;
            modal.mensagem = `Deseja comprar a praia de ${this.nome}?`;
            modal.prices = this.price;
            // A lógica de compra deve ser tratada no Vue após confirmação do usuário
        } else if (this.proprietarioCor !== jogador.cor) {
            // Pagar aluguel
            const aluguel = this.fee ? this.fee : 0;
            modal.tipo = 4;
            modal.mostra = true;
            modal.mensagem = `Pague aluguel da sua barraquinha de R$${aluguel} para o proprietário.`;
            modal.precoAluguel = aluguel;
            jogador.pagar(aluguel);
            // Encontrar o proprietário e pagar
            const proprietario = this.jogadores.find(j => j.cor === this.proprietarioCor);
            if (proprietario) proprietario.receber(aluguel);
        } else {
            // O jogador caiu em sua própria praia
            modal.tipo = 5;
            modal.mostra = true;
            modal.mensagem = `Você está em sua própria praia.`;
        }
    }

    comprarCasa(jogador, modal) {
        if (this && !this.proprietarioCor) {
            const preco = this.price ? this.price : 0;
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

}
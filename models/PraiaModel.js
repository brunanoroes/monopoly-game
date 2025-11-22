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
            modal.mensagemAlerta = ''; // Limpa mensagem de alerta
            modal.precoAluguel = aluguel;
        } 
        else {
            // Casa sem dono ou após pagar aluguel, pode comprar
            modal.tipo = 2;
            modal.mostra = true;
            modal.mensagemAlerta = ''; // Limpa mensagem de alerta
            
            if(this.proprietarioCor && this.proprietarioCor !== jogador.cor) {
                modal.mensagem = `Deseja comprar a praia de ${this.nome} do proprietário?`;
                modal.prices = this.price + 100;
            } else {
                modal.mensagem = `Deseja comprar a praia de ${this.nome}?`;
                modal.prices = this.price;
            }
        }
    }

    comprarCasa(jogador, modal, tabuleiro = null) {
        const antigoProprietario = this.proprietarioCor;
        const preco = this.price + (antigoProprietario && antigoProprietario !== jogador.cor ? 100 : 0);
        
        // Se está comprando de outro jogador, transferir dinheiro e remover propriedade
        if (antigoProprietario && antigoProprietario !== jogador.cor && tabuleiro) {
            const vendedor = tabuleiro.jogadores.find(j => j.cor === antigoProprietario);
            if (vendedor) {
                // Remove propriedade do vendedor
                const index = vendedor.propriedades.findIndex(p => p.id === this.id);
                if (index !== -1) {
                    vendedor.propriedades.splice(index, 1);
                }
                // Vendedor recebe o dinheiro
                vendedor.receber(preco);
            }
        }
        
        // Realiza o pagamento (agora sempre funciona, mesmo com saldo insuficiente)
        jogador.pagar(preco);
        
        // Se o jogador já não possui esta propriedade, adiciona
        if (!jogador.propriedades.find(p => p.id === this.id)) {
            jogador.propriedades.push(this);
        }
        
        this.proprietarioCor = jogador.cor;
        this.casaConstruida = 5;
        modal.mostra = false;
        
        return true;
    }

}
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
            modal.mensagemAlerta = ''; // Limpa mensagem de alerta
            modal.precoAluguel = aluguel;
        }
        else {
            modal.tipo = 1;
            modal.selected = 0;
            modal.mostra = true;
            modal.mensagemAlerta = ''; // Limpa mensagem de alerta
            
            // Se já tem dono (jogador atual), é upgrade de propriedade
            if(this.proprietarioCor === jogador.cor){
                // Verifica se já está no nível máximo
                if (this.casaConstruida >= 4) {
                    modal.tipo = 4;
                    modal.mensagem = `${this.nome} já está no nível máximo (Hotel)!`;
                    modal.mensagemAlerta = '';
                    return;
                }
                
                modal.mensagem = `Deseja melhorar ${this.nome}?`;
                modal.prices = this.prices.map(preco => preco + 100);
                modal.disabled = [true, true, true, true];
                // Habilita a próxima casa disponível
                const proximoNivel = this.casaConstruida;
                if (proximoNivel >= 0 && proximoNivel <= 3) {
                    modal.disabled[proximoNivel] = false;
                }
            }
            // Se tem outro dono e tipo=1 (após pagar aluguel), pode comprar por +100
            else if(this.proprietarioCor && tipo){
                // Verifica se já está no nível máximo
                if (this.casaConstruida >= 4) {
                    modal.tipo = 4;
                    modal.mensagem = `${this.nome} já está no nível máximo (Hotel)!`;
                    modal.mensagemAlerta = 'Não é possível melhorar esta propriedade.';
                    return;
                }
                
                modal.mensagem = `Deseja comprar ${this.nome} do proprietário?`;
                modal.prices = this.prices.map(preco => preco + 100);
                modal.disabled = [true, true, true, true];
                // Habilita a próxima casa disponível
                const proximoNivel = this.casaConstruida;
                if (proximoNivel >= 0 && proximoNivel <= 3) {
                    modal.disabled[proximoNivel] = false;
                }
            }
            // Casa sem dono
            else {
                modal.mensagem = `Deseja comprar ${this.nome}?`;
                modal.prices = this.prices;
                // Casa sem dono - permite comprar apenas Casa 1 (índice 0)
                modal.disabled = [false, true, true, true];
            }
        }
    }

    comprarCasa(jogador, modal, tabuleiro = null) {
        const tipoCasa = modal.selected;
        if (!tipoCasa) {
            modal.mensagemAlerta = 'Selecione uma opção.';
            return;
        }
        
        const antigoProprietario = this.proprietarioCor;
        const comprouDeOutroJogador = antigoProprietario && antigoProprietario !== jogador.cor;
        const preco = this.prices[tipoCasa - 1] + (comprouDeOutroJogador ? 100 : 0);
        
        // Se está comprando de outro jogador, transferir dinheiro e remover propriedade
        if (comprouDeOutroJogador && tabuleiro) {
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
        
        // Se comprou de outro jogador, evolui para o próximo nível
        // Se é upgrade da própria propriedade, usa tipoCasa
        if (comprouDeOutroJogador) {
            this.casaConstruida = Math.min(this.casaConstruida + 1, 4);
        } else {
            this.casaConstruida = tipoCasa;
        }
        
        modal.mostra = false;
        
        return true;
    }
}
export default class Casa {
    constructor(id, nome, x, y, listaJogadores, lateral) {
        this.id = id;
        this.nome = nome;
        this.x = x;
        this.y = y;
        this.listaJogadores = listaJogadores || [];
        this.lateral = lateral;
    }
    funcao(jogador, modal) {
        modal.tipo = 4;
        modal.mostra = true;
        modal.mensagem = 'Ainda não implementado';
    }
    
}   
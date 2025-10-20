export default class Casa {
    constructor(id, nome, x, y, listaJogadores, lateral) {
        this.id = id;
        this.nome = nome;
        this.x = x;
        this.y = y;
        this.listaJogadores = listaJogadores || [];
        this.lateral = lateral;
    }
    funcao() {
        return this.id;
    }
    
}   
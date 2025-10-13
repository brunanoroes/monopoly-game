export default class Casa {
    constructor(id, nome, x, y, listaJogadores) {
        this.id = id;
        this.nome = nome;
        this.x = x;
        this.y = y;
        this.listaJogadores = listaJogadores || [];
    }
    funcao() {
        return this.id;
    }
    
}   
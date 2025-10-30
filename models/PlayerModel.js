import Jogador from "./JogadorModel";

export default class Player extends Jogador {
    constructor(tipo, nome, cor, dinheiroInicial = 1500, casaInicial = 0) {
        super(tipo, nome, cor, dinheiroInicial, casaInicial);
    }

    jogarDados(totalCasas) {
        return super.jogarDados(totalCasas);
    }

    pagar(casa) {
        return super.pagar(casa);
    }

    receber(valor) {
        super.receber(valor);
    }
}

import Jogador from "./JogadorModel";

export default class Player extends Jogador {
    constructor(tipo, nome, cor, dinheiroInicial = 1500, casaInicial = 0) {
        super(tipo, nome, cor, dinheiroInicial, casaInicial);
    }

    jogarDados(totalCasas) {
        return super.jogarDados(totalCasas);
    }

    comprarCasa(casa) {
        return super.comprarCasa(casa);
    }

    pagarAluguel(casa) {
        return super.pagarAluguel(casa);
    }

    receber(valor) {
        super.receber(valor);
    }
}

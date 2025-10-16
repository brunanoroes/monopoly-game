import Jogador from './JogadorModel.js';
import Casa from './CasaModel.js';
import Propriedade from './PropriedadeModel.js';
import Sorte from './SorteModel.js';

export default class TabuleiroModel {
	constructor({ nomesJogadores }) {
		this.nomesJogadores = nomesJogadores;
		this.casas = [];
		this.totalCasas = 0;
		this.jogadores = [];
		this.jogadorAtivo = null;
	}

	CriarCasas(casasJson) {
		for (const casaData of casasJson) {
			switch (casaData.funcao) {
				case 'propriedade':
					this.casas.push(new Propriedade(casaData.id, casaData.nome, casaData.x, casaData.y, casaData.listaJogadores, casaData.prices, casaData.fee, casaData.casaConstruida, casaData.proprietarioCor));
					break;
				case 'sorte':
					this.casas.push(new Sorte(casaData.id, casaData.nome, casaData.x, casaData.y, casaData.listaJogadores, this.cartasSorte));
					break
				default:
					this.casas.push(new Casa(casaData.id, casaData.nome, casaData.x, casaData.y, casaData.listaJogadores)); // Casas simples sem lógica especial
			}
		}
		this.totalCasas = this.casas.length;
	}

	PosicionarPeoes() {
		const coresPeao = ['pink', 'blue', 'green', 'red'];
		this.jogadores.length = 0;

		// Cria uma lista de 4 nomes: pega os nomes fornecidos e completa com bots se necessário
		const nomesCompletos = [...this.nomesJogadores];
		while (nomesCompletos.length < 4) {
			const botNumero = nomesCompletos.length + 1;
			nomesCompletos.push(`Bot ${botNumero}`);
		}

		nomesCompletos.forEach((nome, index) => {
			const cor = coresPeao[index % coresPeao.length];
			const tipo = index < this.nomesJogadores.length ? 'jogador' : 'bot';

			const jogador = new Jogador(tipo, nome, cor, 1500);

			// Jogador começa na saída (casa com nome "Saída")
			const casaSaida = this.casas.find(c => c.nome === 'Saída');
			if (casaSaida) {
				if (!casaSaida.listaJogadores) casaSaida.listaJogadores = [];
				casaSaida.listaJogadores.push(jogador.cor);
			}
			this.jogadores.push(jogador);
		});


		this.jogadorAtivo = this.jogadores[0];
	}

	CriarCartas() {
		// Embaralhar usando Fisher-Yates
		const embaralhar = (array) => {
			for (let i = array.length - 1; i > 0; i--) {
				const j = Math.floor(Math.random() * (i + 1));
				[array[i], array[j]] = [array[j], array[i]];
			}
			return array;
		};
		this.cartasSorte = embaralhar(this.cartasSorte);
		this.cartasCofre = embaralhar(this.cartasCofre);
	}

	async MontarTabuleiro(cartasSorte, casasJson) {
		this.CriarCartas(cartasSorte);
		this.PosicionarPeoes();
		
		this.CriarCasas(casasJson);
	}

	atualizarCasaJogador(jogador, soma) {
		//Remove a cor do jogador da casa atual

		const casaAtual = this.casas[jogador.localizacaoAtual];
		casaAtual.listaJogadores = casaAtual.listaJogadores.filter(cor => cor !== jogador.cor);

		//Calcula nova posição
		const novaPosicao = (jogador.localizacaoAtual + soma) % this.totalCasas;
		// Adiciona a cor do jogador na nova casa
		const novaCasa = this.casas[novaPosicao];
		if (!novaCasa.listaJogadores) novaCasa.listaJogadores = [];
		novaCasa.listaJogadores.push(jogador.cor);
		jogador.localizacaoAtual = novaPosicao;
		return novaCasa;
	}

	getProximoJogadorAtivo(jogador) {
		const indexAtual = this.jogadores.indexOf(jogador);
		const proximoIndex = (indexAtual + 1) % this.jogadores.length;
		this.jogadorAtivo = this.jogadores[proximoIndex];
		return this.jogadorAtivo;
	}

	//Funções das casas

	realizarFuncao(jogador, casa, modal) {
		casa.funcao(jogador, modal);
	}

}

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
					this.casas.push(new Propriedade(casaData.id, casaData.nome, casaData.x, casaData.y, casaData.listaJogadores, casaData.prices, casaData.fee, casaData.casaConstruida, casaData.proprietarioCor, casaData.cor, casaData.lateral));
					break;
				case 'sorte':
					this.casas.push(new Sorte(casaData.id, casaData.nome, casaData.x, casaData.y, casaData.listaJogadores,  casaData.lateral));
					break
				default:
					this.casas.push(new Casa(casaData.id, casaData.nome, casaData.x, casaData.y, casaData.listaJogadores,  casaData.lateral)); // Casas simples sem lógica especial
			}
		}
		this.totalCasas = this.casas.length;
	}

	PosicionarPeoes() {
		const coresPeao = ['azul', 'vermelho', 'verde', 'amarelo'];
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
			const casaSaida = this.casas.find(c => c.nome === 'Início');
			if (casaSaida) {
				if (!casaSaida.listaJogadores) casaSaida.listaJogadores = [];
				casaSaida.listaJogadores.push(jogador.cor);
			}
			this.jogadores.push(jogador);
		});


		this.jogadorAtivo = this.jogadores[0];
	}

	CriarCartas(cartasSorte = [], cartasCofre = []) {
		this.cartasSorte = cartasSorte;
		this.cartasCofre = cartasCofre;

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

	async atualizarCasaJogador(jogador, soma) {
		// Remove o jogador da casa atual
		let casaAtual = this.casas[jogador.localizacaoAtual];
		casaAtual.listaJogadores = casaAtual.listaJogadores.filter(cor => cor !== jogador.cor);

		// Calcula o destino final
		const destino = (jogador.localizacaoAtual + soma) % this.totalCasas;

		// Anda uma casa por vez
		for (let i = 1; i <= soma; i++) {
			// Espera 1 segundo
			await new Promise(resolve => setTimeout(resolve, 1000));

			// Calcula a próxima posição (com wrap se passar do fim)
			const novaPosicao = (jogador.localizacaoAtual + 1) % this.totalCasas;

			// Remove o jogador da casa atual
			casaAtual = this.casas[jogador.localizacaoAtual];
			casaAtual.listaJogadores = casaAtual.listaJogadores.filter(cor => cor !== jogador.cor);

			// Adiciona o jogador na nova casa
			const novaCasa = this.casas[novaPosicao];
			if (!novaCasa.listaJogadores) novaCasa.listaJogadores = [];
			novaCasa.listaJogadores.push(jogador.cor);

			// Atualiza a posição atual
			jogador.localizacaoAtual = novaPosicao;

			// (Opcional) Atualiza visualmente o tabuleiro a cada passo
			// this.atualizarTabuleiro(); // <- se existir uma função de render
		}

		// Retorna a casa final
		return this.casas[jogador.localizacaoAtual];
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
	async MontarTabuleiro(cartasSorte, casasJson) {
		this.CriarCasas(casasJson);
		this.CriarCartas(cartasSorte);
		this.PosicionarPeoes();
	}


}

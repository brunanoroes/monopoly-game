import Jogador from './JogadorModel.js';
import Bot from './BotModel.js';
import Casa from './CasaModel.js';
import Propriedade from './PropriedadeModel.js';
import Sorte from './SorteModel.js';
import Praia from './PraiaModel.js';
import Especial from './EspecialModel.js';

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
			 switch (casaData.tipo) {
			 	case 'propriedade':
				this.casas.push(new Propriedade(casaData.id, casaData.nome, casaData.x, casaData.y, casaData.listaJogadores, casaData.prices, casaData.fee, casaData.casaConstruida, casaData.proprietarioCor, casaData.cor, casaData.lateral, casaData.tipo));
					 break;
				case 'sorte':
					this.casas.push(new Sorte(casaData.id, casaData.nome, casaData.x, casaData.y, casaData.listaJogadores,  casaData.lateral));
					break;
				case 'praia':
					this.casas.push(new Praia(casaData.id, casaData.nome, casaData.x, casaData.y, casaData.listaJogadores, casaData.price, casaData.fee, casaData.proprietarioCor,  casaData.lateral, casaData.casaConstruida, casaData.tipo));
					break
				case 'especial':
					this.casas.push(new Especial(casaData.id, casaData.nome, casaData.x, casaData.y, casaData.listaJogadores,  casaData.lateral));
					break
				 default:
				 	this.casas.push(new Casa(casaData.id, casaData.nome, casaData.x, casaData.y, casaData.listaJogadores,  casaData.lateral)); // Casas simples sem lógica especial
			}
		}
		this.totalCasas = this.casas.length;
	}

	PosicionarPeoes() {
		const coresPeao = ['azul', 'vermelho', 'verde', 'amarelo'];
		const nomesBots = [
			'Carlos', 'Zé', 'Tom', 'Maria',
			'Pedro', 'João', 'Fernanda', 'Roberto',
			'Lucinha', 'Marcos', 'Ana', 'Paulo',
			'Vitória', 'Ricardo', 'Juliana', 'Felipe'
		];
		
		// Embaralha os nomes dos bots para serem aleatórios
		const nomesBotsEmbaralhados = [...nomesBots].sort(() => Math.random() - 0.5);
		
		this.jogadores.length = 0;

		// Cria uma lista de 4 nomes: pega os nomes fornecidos e completa com bots se necessário
		const nomesCompletos = [...this.nomesJogadores];
		let indiceBots = 0;
		while (nomesCompletos.length < 4) {
			nomesCompletos.push(nomesBotsEmbaralhados[indiceBots]);
			indiceBots++;
		}

		nomesCompletos.forEach((nome, index) => {
			const cor = coresPeao[index % coresPeao.length];
			const tipo = index < this.nomesJogadores.length ? 'jogador' : 'bot';

			// Cria Bot ou Jogador dependendo do tipo
			const jogador = tipo === 'bot' 
				? new Bot(nome, cor, 1500, 0)
				: new Jogador(tipo, nome, cor, 1500, 0);

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
		if (jogador.movendo) return;
		jogador.movendo = true;

		for (let i = 1; i <= soma; i++) {
			await new Promise(resolve => setTimeout(resolve, 1000));

			// Remove o jogador da casa atual
			let casaAtual = this.casas[jogador.localizacaoAtual];
			casaAtual.listaJogadores = casaAtual.listaJogadores.filter(cor => cor !== jogador.cor);

			// Calcula nova posição
			const novaPosicao = (jogador.localizacaoAtual + 1) % this.totalCasas;

			// Adiciona na nova casa
			let novaCasa = this.casas[novaPosicao];
			if (!novaCasa.listaJogadores) novaCasa.listaJogadores = [];
			novaCasa.listaJogadores.push(jogador.cor);

			// Atualiza posição
			jogador.localizacaoAtual = novaPosicao;
		}

		jogador.movendo = false;
		return this.casas[jogador.localizacaoAtual];
	}


	getProximoJogadorAtivo(jogador) {
		let indexAtual = this.jogadores.indexOf(jogador);
		let tentativas = 0;
		const totalJogadores = this.jogadores.length;

		do {
			indexAtual = (indexAtual + 1) % totalJogadores;
			tentativas++;
			
			// Se todos os jogadores faliram, retorna null
			if (tentativas > totalJogadores) {
				return null;
			}
		} while (this.jogadores[indexAtual].falido);

		this.jogadorAtivo = this.jogadores[indexAtual];
		return this.jogadorAtivo;
	}

	// Verifica se há um vencedor (apenas um jogador ativo restante)
	verificarVitoria() {
		const jogadoresAtivos = this.jogadores.filter(j => !j.falido);
		if (jogadoresAtivos.length === 1) {
			return jogadoresAtivos[0];
		}
		return null;
	}

	// Elimina um jogador do jogo
	eliminarJogador(jogador) {
		jogador.declararFalencia();
		
		// Remove o peão do tabuleiro
		const casaAtual = this.casas[jogador.localizacaoAtual];
		if (casaAtual && casaAtual.listaJogadores) {
			casaAtual.listaJogadores = casaAtual.listaJogadores.filter(cor => cor !== jogador.cor);
		}
	}

	async MontarTabuleiro(cartasSorte, casasJson) {
		this.CriarCasas(casasJson);
		this.CriarCartas(cartasSorte);
		this.PosicionarPeoes();
	}


}

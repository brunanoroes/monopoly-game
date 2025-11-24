import Jogador from "./JogadorModel.js";

export default class Bot extends Jogador {
  constructor(nome, cor, dinheiroInicial = 1500, casaInicial = 0) {
    super('bot', nome, cor, dinheiroInicial, casaInicial);
    
    // Configurações de personalidade do Bot - Bots mais agressivos
    this.agressividade = 0.6 + Math.random() * 0.4; // 0.6-1.0: Sempre pelo menos moderadamente agressivo
    this.reservaMinima = 150 + Math.floor(Math.random() * 150); // R$150-300: Reserva menor para comprar mais
  }

  // Decide se deve comprar uma propriedade
  deveComprarPropriedade(casa, precoCompra) {
    // Não compra se não tiver dinheiro suficiente + reserva
    if (this.dinheiro < precoCompra + this.reservaMinima) {
      return false;
    }

    // Aumentado de 40% para 60% - permite compras mais caras
    if (precoCompra > this.dinheiro * 0.6) {
      return false;
    }

    // Verifica se já tem propriedades da mesma cor (prioriza completar conjuntos)
    const propriedadesMesmaCor = this.propriedades.filter(p => p.cor === casa.cor);
    if (propriedadesMesmaCor.length > 0) {
      // Muito interessado em completar o conjunto
      return true;
    }

    // Decisão baseada na agressividade e preço - aumentado peso da agressividade
    const chancesCompra = this.agressividade * 0.85 + (1 - (precoCompra / this.dinheiro)) * 0.15;
    return Math.random() < chancesCompra;
  }

  // Escolhe qual tipo de casa/hotel comprar
  escolherTipoCompra(casa, prices, casaConstruida) {
    if (!prices || prices.length === 0) return 0;

    // Para propriedades com níveis (casa 1, 2, 3, hotel)
    if (Array.isArray(prices)) {
      // Compra sempre o próximo nível disponível
      const proximoNivel = casaConstruida || 0;
      
      if (proximoNivel >= prices.length) {
        return 0; // Já está no máximo
      }

      const precoProximo = prices[proximoNivel];
      
      // Verifica se tem dinheiro para o próximo nível
      if (this.dinheiro >= precoProximo + this.reservaMinima) {
        return proximoNivel + 1; // +1 porque modal usa 1-based index
      }
    }

    return 0; // Não compra
  }

  // Decide se deve comprar de outro jogador (após pagar aluguel)
  deveComprarDeOutroJogador(casa, precoCompra) {
    // Reduzido multiplicador de 1.5 para 1.2 - menos criterioso
    if (this.dinheiro < precoCompra + this.reservaMinima * 1.2) {
      return false;
    }

    // Verifica se já tem outras propriedades da mesma cor
    const propriedadesMesmaCor = this.propriedades.filter(p => p.cor === casa.cor);
    
    // Se já tem da mesma cor, muito interessado em comprar
    if (propriedadesMesmaCor.length > 0) {
      return this.dinheiro >= precoCompra + this.reservaMinima;
    }

    // Reduzido threshold de 0.7 para 0.5 - mais bots compram de outros jogadores
    // Reduzido multiplicador de 2 para 1.5
    return this.agressividade > 0.5 && this.dinheiro > precoCompra + this.reservaMinima * 1.5;
  }

  // Decide quais propriedades vender em caso de falência
  escolherPropriedadesParaVender(dividaTotal) {
    if (this.propriedades.length === 0) return [];

    // Ordena propriedades por valor (vende as mais baratas primeiro)
    const propriedadesOrdenadas = [...this.propriedades].sort((a, b) => {
      const valorA = Array.isArray(a.prices) ? a.prices[0] : a.price;
      const valorB = Array.isArray(b.prices) ? b.prices[0] : b.price;
      return valorA - valorB;
    });

    const paraVender = [];
    let totalArrecadado = 0;
    const necessario = Math.abs(dividaTotal);

    for (const prop of propriedadesOrdenadas) {
      if (totalArrecadado >= necessario) break;
      
      paraVender.push(prop.id);
      const valorVenda = Array.isArray(prop.prices) 
        ? prop.prices[prop.casaConstruida - 1] * 0.5 
        : prop.price * 0.5;
      totalArrecadado += valorVenda;
    }

    return paraVender;
  }

  // Escolhe bairro para exposição no MAC (melhor retorno)
  escolherBairroParaMAC(casas, jogador) {
    const propriedadesDoBot = casas.filter(casa => 
      casa.proprietarioCor === jogador.cor && casa.tipo === 'propriedade'
    );

    if (propriedadesDoBot.length === 0) return null;

    // Escolhe a propriedade com maior potencial de aluguel
    const melhorPropriedade = propriedadesDoBot.reduce((melhor, atual) => {
      const aluguelAtualMedio = atual.fee ? atual.fee.reduce((a, b) => a + b, 0) / atual.fee.length : 0;
      const aluguelMelhorMedio = melhor.fee ? melhor.fee.reduce((a, b) => a + b, 0) / melhor.fee.length : 0;
      return aluguelAtualMedio > aluguelMelhorMedio ? atual : melhor;
    });

    return melhorPropriedade.nome;
  }

  // Escolhe casa estratégica para viajar no Terminal
  escolherCasaParaTerminal(casas, jogador) {
    // Filtra propriedades disponíveis (sem dono ou do próprio bot)
    const propriedadesDisponiveis = casas.filter(casa => 
      casa.tipo === 'propriedade' && 
      (!casa.proprietarioCor || casa.proprietarioCor === jogador.cor)
    );

    if (propriedadesDisponiveis.length === 0) {
      // Se não há propriedades disponíveis, escolhe uma aleatória
      const todasPropriedades = casas.filter(c => c.tipo === 'propriedade');
      return todasPropriedades[Math.floor(Math.random() * todasPropriedades.length)]?.nome;
    }

    // Prioriza propriedades da mesma cor que já possui
    const coresQueTemho = [...new Set(
      jogador.propriedades.map(p => p.cor).filter(c => c)
    )];

    for (const cor of coresQueTemho) {
      const propMesmaCor = propriedadesDisponiveis.find(p => p.cor === cor);
      if (propMesmaCor) return propMesmaCor.nome;
    }

    // Senão, escolhe propriedade mais barata disponível
    const maisBarata = propriedadesDisponiveis.reduce((min, atual) => {
      const precoAtual = Array.isArray(atual.prices) ? atual.prices[0] : atual.price || 0;
      const precoMin = Array.isArray(min.prices) ? min.prices[0] : min.price || 0;
      return precoAtual < precoMin ? atual : min;
    });

    return maisBarata.nome;
  }
}
import Casa from "./CasaModel.js";

export default class Especial extends Casa {
    constructor(id, nome, x, y, listaJogadores, lateral) {
        super(id, nome, x, y, listaJogadores);
        this.lateral = lateral;
        this.nome = nome;
    }
    
    funcao(jogador, modal) {
      modal.mensagem = this.getMensagemHtml()
      
      if (this.nome === "UFF") {
        // Para UFF, usa tipo 4 com opção de pagar fiança
        modal.tipo = 4;
        modal.mostrarOpcaoPagarFianca = true;
        modal.valorFianca = 250;
        modal.passarVez = false; // Não passa a vez automaticamente
      } else {
        modal.tipo = 8;
      }
      
      modal.mostra = true;
    }

    getMensagemHtml() {
      switch (this.nome) {
        case "MAC":
          return `
            <div>
              <strong>🎨 Você caiu no MAC!</strong><br>
              Escolha um bairro seu para realizar uma exposição de arte.<br>
              Enquanto a exposição estiver lá, o valor das propriedades desse bairro será <strong>dobrado</strong>!
            </div>
          `;

        case "UFF":
          return `
            <div>
              <strong>📚 Você caiu na UFF - Semana de Provas!</strong><br>
              Você ficará preso estudando até tirar <strong>duplo 6</strong> (duas vezes o número 6) nos dados<br>
              ou pagar <strong>R$ 250</strong> de fiança para sair livre no próximo turno.<br>
              Boa sorte nos estudos!
            </div>
          `;

        case "Terminal":
          return `
            <div>
              <strong>🚌 Você chegou ao Terminal!</strong><br>
              Escolha uma casa para pegar o ônibus e avançar até ela na próxima rodada.
            </div>
          `;

        case "Plaza":
          return `
            <div>
              <strong>🛍️ Você caiu no Plaza Shopping!</strong><br>
              Você saiu gastando — <strong>-R$100</strong> da sua conta. Aproveite as comprinhas!
            </div>
          `;

        case "Início":
          return `
            <div>
              <strong>🎁 Você passou pela casa inicial!</strong><br>
              Receba <strong>R$200</strong> como incentivo para continuar seu caminho rumo à vitória!
            </div>
          `;

        default:
          return `
            <div>
              <strong>ℹ️ Evento desconhecido</strong><br>
              Não foi possível encontrar informações para este espaço.
            </div>
          `;
      }
    }

    async funcaoEspecial(_escolhaBairros, _casas, _jogador) {

      switch (this.nome) {

        case "MAC":
          // Filtra propriedades do jogador
          _escolhaBairros.bairros = _casas
            .filter(casa => casa.proprietarioCor === _jogador.cor)
            .map(casa => casa.nome);

          // Só mostra modal se tiver propriedades
          if (_escolhaBairros.bairros.length > 0) {
            _escolhaBairros.mostra = true;
            _escolhaBairros.mensagem = "Escolha um bairro para a exposição de arte";
          } else {
            _escolhaBairros.mostra = false;
            _escolhaBairros.mensagem = "Você não tem nenhuma propriedade para fazer exposição de arte";
          }

          break;

        case "Terminal":
          _escolhaBairros.mostra = true;

          _escolhaBairros.bairros = _casas
            .filter(casa => casa.tipo === 'propriedade')
            .map(casa => casa.nome);

          _escolhaBairros.mensagem = "Escolha um bairro viajar na próxima rodada";

          break;

        case "UFF":
          // Marca que ainda não pagou a fiança
          _jogador.pagouFiancaUFF = false;
          break;

        case "Plaza":
         _jogador.dinheiro -= 100;
          break;

        case "Início":
          _jogador.dinheiro += 200;
          break;

        default:
          // nenhum efeito especial
          break;
      }

}


}
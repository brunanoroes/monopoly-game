const cartasSorte = [
  // Cartas de Sorte (ganhar dinheiro)
  {
    mensagem: 'Parabéns! Você ganhou uma bolsa de Iniciação Científica!',
    funcao: 'sorte',
    valor: 400
  },
  {
    mensagem: 'Você foi selecionado como monitor da disciplina!',
    funcao: 'sorte',
    valor: 300
  },
  {
    mensagem: 'Seu auxílio estudantil foi aprovado!',
    funcao: 'sorte',
    valor: 250
  },
  {
    mensagem: 'Ganhou vale refeição extra do bandejão!',
    funcao: 'sorte',
    valor: 100
  },
  {
    mensagem: 'Conseguiu uma vaga no intercâmbio com bolsa!',
    funcao: 'sorte',
    valor: 500
  },

  // Cartas de Azar (perder dinheiro)
  {
    mensagem: 'Precisou recarregar o RioCard!',
    funcao: 'azar',
    valor: 150
  },
  {
    mensagem: 'Perdeu o cartão do bandejão e teve que fazer outro!',
    funcao: 'azar',
    valor: 100
  },
  {
    mensagem: 'Reprovou em cálculo... Vai ter que pagar novamente!',
    funcao: 'azar',
    valor: 300
  },
  {
    mensagem: 'O notebook quebrou bem na semana da entrega do TCC!',
    funcao: 'azar',
    valor: 400
  },
  {
    mensagem: 'Gastou uma fortuna na xerox esse mês!',
    funcao: 'azar',
    valor: 200
  },

  // Cartas Especiais (movimento)
  {
    mensagem: 'Hora do bandejão! Vá direto para o Gragoatá.',
    funcao: 'mover',
    destino: 'Gragoatá'
  },
  {
    mensagem: 'Palestra especial no campus do Valonguinho! Vá para Vital Brasil.',
    funcao: 'mover',
    destino: 'Vital Brasil'
  },
  {
    mensagem: 'Exposição de arte! Vá visitar o MAC.',
    funcao: 'mover',
    destino: 'MAC'
  },
  {
    mensagem: 'Fim de semana chegou! Vá curtir em Icaraí.',
    funcao: 'mover',
    destino: 'Icarai'
  },
  {
    mensagem: 'Volta às aulas! Vá direto para a UFF.',
    funcao: 'mover',
    destino: 'UFF'
  }
];


export default cartasSorte;

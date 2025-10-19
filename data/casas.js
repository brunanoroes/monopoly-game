const casasJson = [
  // Lado inferior (da direita p/ esquerda)
  { id: 0, nome: "Início", x: 45, y: 80, funcao: "saida", value: 200, listaJogadores: [] },
  { id: 1, nome: "Gragoatá", x: 45, y: 75, cor: "brown", funcao: "propriedade", prices: [200, 350, 550, 700], fee: [20, 30, 40, 60], casaConstruida: 0, proprietarioCor: "", listaJogadores: [] },
  { id: 2, nome: "Santa Rosa", x: 40, y: 70, cor: "brown", funcao: "propriedade", prices: [220, 370, 560, 720], fee: [25, 35, 45, 65], casaConstruida: 0, proprietarioCor: "", listaJogadores: [] },
  { id: 3, nome: "Ingá", x: 34, y: 68, cor: "brown", funcao: "propriedade", prices: [240, 400, 580, 750], fee: [30, 40, 50, 70], casaConstruida: 0, proprietarioCor: "", listaJogadores: [] },
  { id: 4, nome: "Boa Viagem", x: 31, y: 62, cor: "gray", funcao: "propriedade", listaJogadores: [] },
  { id: 5, nome: "Charitas", x: 26, y: 57, cor: "black", funcao: "propriedade", prices: [260, 420, 600, 800], fee: [35, 45, 55, 75], casaConstruida: 0, proprietarioCor: "", listaJogadores: [] },
  { id: 6, nome: "São Domingos", x: 22, y: 53, cor: "black", funcao: "propriedade", prices: [280, 450, 620, 850], fee: [40, 50, 60, 80], casaConstruida: 0, proprietarioCor: "", listaJogadores: [] },
  { id: 7, nome: "Piratininga", x: 17, y: 48, cor: "black", funcao: "propriedade", prices: [280, 450, 620, 850], fee: [40, 50, 60, 80], casaConstruida: 0, proprietarioCor: "", listaJogadores: [] },
{ id: 8, nome: "MAC", x: 10, y: 45, funcao: "companhia", proprietarioCor: "", listaJogadores: [] },

  // Lado esquerdo (subindo)
    { id: 9, nome: "Pé Pequeno", x: 13, y: 35, cor: "white", funcao: "propriedade", prices: [300, 470, 650, 880], fee: [45, 55, 65, 85], casaConstruida: 0, proprietarioCor: "", listaJogadores: [] },
  { id: 10, nome: "Jardim Icaraí", x: 18, y: 31, cor: "white", funcao: "propriedade", rodadasJogador: { jogadorCor: "", rodadas: 0 }, listaJogadores: [] },
  { id: 11, nome: "Engenho do Mato", x: 20, y: 26, cor: "white", funcao: "propriedade", prices: [320, 480, 660, 900], fee: [50, 60, 70, 90], casaConstruida: 0, proprietarioCor: "", listaJogadores: [] },
   { id: 12, nome: "Sorte", x: 25, y: 25, funcao: "sorte", listaJogadores: [] },
  { id: 13, nome: "Cubango", x: 32, y: 18, cor: "pink", funcao: "propriedade", prices: [340, 500, 680, 920], fee: [55, 65, 75, 95], casaConstruida: 0, proprietarioCor: "", listaJogadores: [] },
  { id: 14, nome: "Itaipu", x: 34, y: 15, cor: "pink", funcao: "propriedade", prices: [360, 520, 700, 940], fee: [60, 70, 80, 100], casaConstruida: 0, proprietarioCor: "", listaJogadores: [] },
  { id: 15, nome: "Santiago", x: 40, y: 9, cor: "pink", funcao: "propriedade", prices: [380, 540, 720, 960], fee: [65, 75, 85, 105], casaConstruida: 0, proprietarioCor: "", listaJogadores: [] },
  { id: 16, nome: "UFF", x: 45, y: 5, funcao: "companhia", proprietarioCor: "", listaJogadores: [] },

// Lado esquerdo (descendo)
  { id: 17, nome: "Vital Brasil", x: 55, y: 8, cor: "orange", funcao: "propriedade", listaJogadores: [] },
  { id: 18, nome: "Camboinhas", x: 60, y: 13, cor: "orange", funcao: "propriedade", prices: [400, 560, 740, 980], fee: [70, 80, 90, 110], casaConstruida: 0, proprietarioCor: "", listaJogadores: [] },
  { id: 19, nome: "Fonseca", x: 65, y: 18, cor: "orange", funcao: "propriedade", prices: [420, 580, 760, 1000], fee: [75, 85, 95, 115], casaConstruida: 0, proprietarioCor: "", listaJogadores: [] },
  { id: 20, nome: "Sorte", x: 68, y: 24, funcao: "sorte", listaJogadores: [] },
  { id: 21, nome: "Barreto", x: 74, y: 27, cor: "red", funcao: "propriedade", prices: [440, 600, 780, 1020], fee: [80, 90, 100, 120], casaConstruida: 0, proprietarioCor: "", listaJogadores: [] },
  { id: 22, nome: "Engenhoca", x: 79, y:  32, cor: "red", funcao: "propriedade", prices: [460, 620, 800, 1040], fee: [85, 95, 105, 125], casaConstruida: 0, proprietarioCor: "", listaJogadores: [] },
  { id: 23, nome: "Santa Bárbara", x: 83, y: 36, cor: "red", funcao: "propriedade", prices: [480, 640, 820, 1060], fee: [90, 100, 110, 130], casaConstruida: 0, proprietarioCor: "", listaJogadores: [] },
{ id: 24, nome: "Terminal", x: 88, y: 40, funcao: "companhia", proprietarioCor: "", listaJogadores: [] },

  { id: 25, nome: "Itacoatiara", x: 80, y: 47, cor: "gray", funcao: "propriedade", prices: [500, 660, 840, 1080], fee: [95, 105, 115, 135], casaConstruida: 0, proprietarioCor: "", listaJogadores: [] },
  { id: 26, nome: "São Lourenço", x: 75, y: 52, cor: "yellow", funcao: "propriedade", prices: [520, 680, 860, 1100], fee: [100, 110, 120, 140], casaConstruida: 0, proprietarioCor: "", listaJogadores: [] },
  { id: 27, nome: "Viradouro", x: 70, y: 57, cor: "yellow", funcao: "propriedade", prices: [540, 700, 880, 1120], fee: [105, 115, 125, 145], casaConstruida: 0, proprietarioCor: "", listaJogadores: [] },
  { id: 28, nome: "Sorte", x: 64, y: 64, funcao: "sorte", listaJogadores: [] },
  { id: 29, nome: "Santana", x: 61, y: 66, cor: "yellow", funcao: "propriedade", prices: [560, 720, 900, 1140], fee: [110, 120, 130, 150], casaConstruida: 0, proprietarioCor: "", listaJogadores: [] },
  { id: 30, nome: "Imposto", x: 57, y: 69, funcao: "imposto", listaJogadores: [] },
  { id: 31, nome: "Icarai", x: 50, y: 77, cor: "yellow", funcao: "propriedade", prices: [560, 720, 900, 1140], fee: [110, 120, 130, 150], casaConstruida: 0, proprietarioCor: "", listaJogadores: [] },
];

export default casasJson;

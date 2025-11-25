const casasJson = [
  // Lado inferior (da direita p/ esquerda)
  { id: 0, nome: "Início", x: 47, y: 83, tipo: "especial", listaJogadores: [] },
  { id: 1, nome: "Gragoatá", x: 43, y: 78, cor: "brown", tipo: "propriedade", prices: [200, 350, 550, 700, 900], fee: [20, 30, 40, 60, 80], casaConstruida: 0, proprietarioCor: "", listaJogadores: [], lateral: 1 },
  { id: 2, nome: "Santa Rosa", x: 38, y: 73, cor: "brown", tipo: "propriedade", prices: [220, 370, 560, 720, 920], fee: [25, 35, 45, 65, 85], casaConstruida: 0, proprietarioCor: "", listaJogadores: [], lateral: 1 },
  { id: 3, nome: "Ingá", x: 34, y: 68, cor: "brown", tipo: "propriedade", prices: [240, 400, 580, 750, 950], fee: [30, 40, 50, 70, 90], casaConstruida: 0, proprietarioCor: "", listaJogadores: [], lateral: 1 },
  { id: 4, nome: "Boa Viagem", x: 30, y: 64, tipo: "praia", listaJogadores: [],  price: 200, fee: 60, lateral: 1, casaConstruida: 0, proprietarioCor: "" },
  { id: 5, nome: "Charitas", x: 26, y: 60, cor: "black", tipo: "propriedade", prices: [260, 420, 600, 800, 1000], fee: [35, 45, 55, 75, 95], casaConstruida: 0, proprietarioCor: "", listaJogadores: [], lateral: 1 },
  { id: 6, nome: "São Domingos", x: 22, y: 55, cor: "black", tipo: "propriedade", prices: [280, 450, 620, 850, 1050], fee: [40, 50, 60, 80, 100], casaConstruida: 0, proprietarioCor: "", listaJogadores: [], lateral: 1 },
  { id: 7, nome: "Piratininga", x: 17, y: 51, cor: "black", tipo: "propriedade", prices: [280, 450, 620, 850, 1050], fee: [40, 50, 60, 80, 100], casaConstruida: 0, proprietarioCor: "", listaJogadores: [], lateral: 1 },
{ id: 8, nome: "MAC", x: 10, y: 45, tipo: "especial", proprietarioCor: "", listaJogadores: [] },

  // Lado esquerdo (subindo)
    { id: 9, nome: "Pé Pequeno", x: 13, y: 38, cor: "white", tipo: "propriedade", prices: [300, 470, 650, 880, 1080], fee: [45, 55, 65, 85, 105], casaConstruida: 0, proprietarioCor: "", listaJogadores: [], lateral: 2 },
  { id: 10, nome: "Jardim Icaraí", x: 18, y: 33, cor: "white", tipo: "propriedade", prices: [320, 480, 660, 900, 1100], fee: [50, 60, 70, 90, 110], rodadasJogador: { jogadorCor: "", rodadas: 0 }, listaJogadores: [], lateral: 2 },
  { id: 11, nome: "Engenho do Mato", x: 22, y: 28, cor: "white", tipo: "propriedade", prices: [320, 480, 660, 900, 1100], fee: [50, 60, 70, 90, 110], casaConstruida: 0, proprietarioCor: "", listaJogadores: [], lateral: 2 },
   { id: 12, nome: "Sorte", x: 27, y: 23, tipo: "sorte", listaJogadores: [], lateral: 2 },
  { id: 13, nome: "Cubango", x: 31, y: 20, cor: "pink", tipo: "propriedade", prices: [340, 500, 680, 920, 1120], fee: [55, 65, 75, 95, 115], casaConstruida: 0, proprietarioCor: "", listaJogadores: [], lateral: 2 },
  { id: 14, nome: "Itaipu", x: 35, y: 15, tipo: "praia", price: 200, fee: 60, proprietarioCor: "", listaJogadores: [], lateral: 2 , casaConstruida: 0},
  { id: 15, nome: "Santiago", x: 40, y: 10, cor: "pink", tipo: "propriedade", prices: [380, 540, 720, 960, 1160], fee: [65, 75, 85, 105, 125], casaConstruida: 0, proprietarioCor: "", listaJogadores: [], lateral: 2 },
  { id: 16, nome: "UFF", x: 45, y: 5, tipo: "especial", proprietarioCor: "", listaJogadores: []},

// Lado esquerdo (descendo)
  { id: 17, nome: "Vital Brasil", x: 55, y: 10, cor: "orange", tipo: "propriedade", prices: [380, 540, 720, 960, 1160], fee: [65, 75, 85, 105, 125], casaConstruida: 0, proprietarioCor: "", listaJogadores: [], lateral: 3 },
  { id: 18, nome: "Camboinhas", x: 60, y: 15, tipo: "praia", price: 200, fee: 60, casaConstruida: 0, proprietarioCor: "", listaJogadores: [], lateral: 3 },
  { id: 19, nome: "Fonseca", x: 65, y: 20, cor: "orange", tipo: "propriedade", prices: [420, 580, 760, 1000, 1200], fee: [75, 85, 95, 115, 135], casaConstruida: 0, proprietarioCor: "", listaJogadores: [], lateral: 3 },
  { id: 20, nome: "Sorte", x: 68, y: 25, tipo: "sorte", listaJogadores: [], lateral: 3 },
  { id: 21, nome: "Barreto", x: 74, y: 30, cor: "red", tipo: "propriedade", prices: [440, 600, 780, 1020, 1220], fee: [80, 90, 100, 120, 140], casaConstruida: 0, proprietarioCor: "", listaJogadores: [], lateral: 3 },
  { id: 22, nome: "Engenhoca", x: 79, y:  34, cor: "red", tipo: "propriedade", prices: [460, 620, 800, 1040, 1240], fee: [85, 95, 105, 125, 145], casaConstruida: 0, proprietarioCor: "", listaJogadores: [], lateral: 3 },
  { id: 23, nome: "Santa Bárbara", x: 83, y: 38, cor: "red", tipo: "propriedade", prices: [480, 640, 820, 1060, 1260], fee: [90, 100, 110, 130, 150], casaConstruida: 0, proprietarioCor: "", listaJogadores: [], lateral: 3 },
{ id: 24, nome: "Terminal", x: 85, y: 45, tipo: "especial", proprietarioCor: "", listaJogadores: [] },

  { id: 25, nome: "Itacoatiara", x: 80, y: 50, tipo: "praia", price: 200, fee: 60, casaConstruida: 0, proprietarioCor: "", listaJogadores: [], lateral: 4 },
  { id: 26, nome: "São Lourenço", x: 76, y: 53, cor: "yellow", tipo: "propriedade", prices: [520, 680, 860, 1100, 1300], fee: [100, 110, 120, 140, 160], casaConstruida: 0, proprietarioCor: "", listaJogadores: [], lateral: 4 },
  { id: 27, nome: "Viradouro", x: 71, y: 58, cor: "yellow", tipo: "propriedade", prices: [540, 700, 880, 1120, 1320], fee: [105, 115, 125, 145, 165], casaConstruida: 0, proprietarioCor: "", listaJogadores: [], lateral: 4 },
  { id: 28, nome: "Sorte", x: 67, y: 65, tipo: "sorte", listaJogadores: [], lateral: 4 },
  { id: 29, nome: "Santana", x: 62, y: 68, cor: "yellow", tipo: "propriedade", prices: [560, 720, 900, 1140, 1340], fee: [110, 120, 130, 150, 170], casaConstruida: 0, proprietarioCor: "", listaJogadores: [], lateral: 4 },
  { id: 30, nome: "Plaza", x: 59, y: 72, tipo: "especial", listaJogadores: [], lateral: 4 },
  { id: 31, nome: "Icarai", x: 53, y: 77, cor: "yellow", tipo: "propriedade", prices: [560, 720, 900, 1140, 1340], fee: [110, 120, 130, 150, 170], casaConstruida: 0, proprietarioCor: "", listaJogadores: [], lateral: 4 },
];

export default casasJson;

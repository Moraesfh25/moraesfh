import { Match } from "../types";

// Initial set of highly realistic football matches across major leagues
const MOCK_MATCHES: Match[] = [
  {
    id: "m1",
    homeTeam: "Arsenal",
    awayTeam: "Liverpool",
    league: "Premier League",
    country: "Inglaterra",
    time: "16:00",
    date: "Hoje",
    isVIP: false,
    isLive: false,
    iaConfidence: 94,
    iaStars: 5,
    odds: { home: 1.55, draw: 4.20, away: 5.10 },
    probabilities: { home: 58, draw: 24, away: 18 },
    iaMarketSuggestion: "Over 2.5 Gols",
    iaAnalysis: "Arsenal exhibits highly cohesive attacking transitions at home, scoring 2.4 goals per match on average. Liverpool's center-back pairing is vulnerable due to a key recent injury to Konaté, presenting a 78% probability of over 2.5 match goals.",
    attackingStrength: { home: 92, away: 86 },
    defendingStrength: { home: 88, away: 82 },
    recentH2H: "Arsenal 3-1 Liverpool (Feb 2026), Liverpool 1-1 Arsenal (Dec 2025)",
    formGuide: { home: ["W", "W", "D", "W", "L"], away: ["W", "D", "W", "L", "W"] },
    expectedValue: 1.12,
    riskLevel: "Baixo",
    lineups: {
      home: ["Raya", "White", "Saliba", "Gabriel", "Timber", "Rice", "Odegaard", "Merino", "Saka", "Havertz", "Martinelli"],
      away: ["Alisson", "Bradley", "Quansah", "Van Dijk", "Robertson", "Gravenberch", "Mac Allister", "Szoboszlai", "Salah", "Nunez", "Diaz"]
    },
    injuries: {
      home: ["Tomiyasu (Joelho)", "Zinchenko (Panturrilha)"],
      away: ["Konaté (Coxa)", "Jota (Tornozelo)"]
    }
  },
  {
    id: "m2",
    homeTeam: "Flamengo",
    awayTeam: "River Plate",
    league: "Libertadores",
    country: "América do Sul",
    time: "21:30",
    date: "Hoje",
    isVIP: true,
    isLive: false,
    iaConfidence: 89,
    iaStars: 4,
    odds: { home: 1.85, draw: 3.40, away: 4.20 },
    probabilities: { home: 51, draw: 28, away: 21 },
    iaMarketSuggestion: "Vitória Flamengo (ML)",
    iaAnalysis: "O Maracanã lotado atua como catalisador tático para o Flamengo. Sob forte pressão na saída de bola, o River Plate demonstrou fragilidades defensivas em jogos recentes de altitude e fora de casa. Recomendamos entrada direta no mandante.",
    attackingStrength: { home: 88, away: 80 },
    defendingStrength: { home: 85, away: 79 },
    recentH2H: "Flamengo 2-1 River Plate (Nov 2019), Flamengo 2-2 River Plate (May 2018)",
    formGuide: { home: ["W", "D", "W", "W", "W"], away: ["D", "W", "L", "W", "D"] },
    expectedValue: 1.08,
    riskLevel: "Médio",
    lineups: {
      home: ["Rossi", "Varela", "Fabrício B.", "Léo Pereira", "Ayrton Lucas", "Pulgar", "De la Cruz", "Arrascaeta", "Gerson", "Luiz Araújo", "Pedro"],
      away: ["Armani", "Bustos", "Pezzella", "Paulo Díaz", "Acuña", "Kranevitter", "Simon", "Meza", "Echeverri", "Colidio", "Borja"]
    },
    injuries: {
      home: ["Everton Cebolinha (Tornozelo)", "Viña (Joelho)"],
      away: ["Aliendro (Ombro)"]
    }
  },
  {
    id: "m3",
    homeTeam: "Real Madrid",
    awayTeam: "Barcelona",
    league: "La Liga",
    country: "Espanha",
    time: "42'",
    date: "Hoje",
    isVIP: false,
    isLive: true,
    liveMinute: 42,
    liveScore: [1, 0],
    iaConfidence: 91,
    iaStars: 5,
    odds: { home: 1.45, draw: 4.80, away: 5.50 },
    probabilities: { home: 65, draw: 22, away: 13 },
    iaMarketSuggestion: "Over 1.5 Gols Real Madrid",
    iaAnalysis: "A velocidade de transição com Vinicius Jr e Mbappé contra a linha alta de impedimento do Barcelona continua gerando chances claras. Com o placar em 1-0 no primeiro tempo, o Barcelona será forçado a subir ainda mais as linhas.",
    attackingStrength: { home: 96, away: 94 },
    defendingStrength: { home: 90, away: 86 },
    recentH2H: "Real Madrid 3-2 Barcelona, Barcelona 1-2 Real Madrid, Real Madrid 4-1 Barcelona",
    formGuide: { home: ["W", "W", "W", "W", "W"], away: ["W", "W", "W", "L", "W"] },
    expectedValue: 1.15,
    riskLevel: "Baixo",
    stadium: "Estádio Santiago Bernabéu (Madri)",
    referee: "Alejandro Hernández",
    stats: {
      possession: [52, 48],
      corners: [4, 3],
      yellowCards: [1, 2],
      redCards: [0, 0],
      shotsOnTarget: [6, 4],
      shotsOffTarget: [5, 3],
      xg: [1.45, 0.98]
    },
    lineups: {
      home: ["Courtois", "Carvajal", "Militao", "Rudiger", "Mendy", "Valverde", "Tchouameni", "Bellingham", "Rodrygo", "Mbappé", "Vinicius Jr"],
      away: ["Ter Stegen", "Koundé", "Cubarsí", "Inigo Martínez", "Balde", "Casadó", "Pedri", "Yamal", "Olmo", "Raphinha", "Lewandowski"]
    },
    injuries: {
      home: ["Alaba (Joelho)", "Camavinga (Dúvida)"],
      away: ["Gavi (Transição)", "Araujo (Coxa)", "Frenkie de Jong (Tornozelo)"]
    }
  },
  {
    id: "m4",
    homeTeam: "Manchester City",
    awayTeam: "Chelsea",
    league: "Premier League",
    country: "Inglaterra",
    time: "18:30",
    date: "Amanhã",
    isVIP: true,
    isLive: false,
    iaConfidence: 85,
    iaStars: 4,
    odds: { home: 1.48, draw: 4.60, away: 5.80 },
    probabilities: { home: 62, draw: 22, away: 16 },
    iaMarketSuggestion: "Ambas Marcam (Sim)",
    iaAnalysis: "O Chelsea sob o comando de Maresca adotou um estilo extremamente agressivo de pressão alta e contra-ataques velozes. O City domina a posse em casa, mas tem sofrido gols recorrentes de transições rápidas nesta temporada.",
    attackingStrength: { home: 95, away: 89 },
    defendingStrength: { home: 84, away: 80 },
    recentH2H: "Chelsea 1-1 Man City, Man City 1-0 Chelsea, Chelsea 4-4 Man City",
    formGuide: { home: ["W", "D", "W", "W", "D"], away: ["W", "W", "D", "W", "L"] },
    expectedValue: 1.05,
    riskLevel: "Médio",
    lineups: {
      home: ["Ederson", "Akanji", "Dias", "Gvardiol", "Lewis", "Rodri", "Kovacic", "De Bruyne", "Bernardo", "Foden", "Haaland"],
      away: ["Sanchez", "Gusto", "Fofana", "Colwill", "Cucurella", "Caicedo", "Lavia", "Madueke", "Palmer", "Neto", "Jackson"]
    },
    injuries: {
      home: ["Bob (Pé)"],
      away: ["James (Isquiotibiais)"]
    }
  },
  {
    id: "m5",
    homeTeam: "Bayern de Munique",
    awayTeam: "Borussia Dortmund",
    league: "Bundesliga",
    country: "Alemanha",
    time: "15:30",
    date: "Amanhã",
    isVIP: false,
    isLive: false,
    iaConfidence: 93,
    iaStars: 5,
    odds: { home: 1.38, draw: 5.20, away: 6.50 },
    probabilities: { home: 69, draw: 19, away: 12 },
    iaMarketSuggestion: "Bayern Vence & Over 2.5",
    iaAnalysis: "O 'Der Klassiker' na Allianz Arena costuma ser de amplo domínio bávaro. O Bayern registra média de 3.2 gols marcados em casa. O Dortmund tem dificuldades táticas marcando blocos baixos, facilitando infiltrações de Musiala e Kane.",
    attackingStrength: { home: 94, away: 85 },
    defendingStrength: { home: 87, away: 78 },
    recentH2H: "Bayern 0-2 Dortmund, Dortmund 0-4 Bayern, Bayern 4-2 Dortmund",
    formGuide: { home: ["W", "W", "D", "W", "W"], away: ["L", "W", "W", "D", "W"] },
    expectedValue: 1.14,
    riskLevel: "Baixo",
    lineups: {
      home: ["Neuer", "Kimmich", "Upamecano", "Kim", "Davies", "Palhinha", "Pavlovic", "Olise", "Musiala", "Gnabry", "Kane"],
      away: ["Kobel", "Ryerson", "Anton", "Schlotterbeck", "Bensebaini", "Can", "Sabitzer", "Adeyemi", "Brandt", "Gittens", "Guirassy"]
    },
    injuries: {
      home: ["Stanisic (Joelho)", "Ito (Pé)"],
      away: ["Süle (Transição)", "Reyna (Coxa)"]
    }
  },
  {
    id: "m6",
    homeTeam: "Palmeiras",
    awayTeam: "São Paulo",
    league: "Brasileirão Série A",
    country: "Brasil",
    time: "15'",
    date: "Hoje",
    isVIP: false,
    isLive: true,
    liveMinute: 15,
    liveScore: [0, 0],
    iaConfidence: 87,
    iaStars: 4,
    odds: { home: 1.95, draw: 3.20, away: 3.90 },
    probabilities: { home: 48, draw: 31, away: 21 },
    iaMarketSuggestion: "Under 2.5 Gols",
    iaAnalysis: "O Choque-Rei é historicamente um confronto tenso, de muita marcação no meio-campo e raras chances claras de gol. Ambos os técnicos costumam fechar as linhas de passe em clássicos, justificando uma entrada no mercado under.",
    attackingStrength: { home: 86, away: 81 },
    defendingStrength: { home: 89, away: 84 },
    recentH2H: "São Paulo 1-1 Palmeiras, Palmeiras 0-0 São Paulo, Palmeiras 5-0 São Paulo",
    formGuide: { home: ["W", "W", "D", "W", "D"], away: ["W", "D", "L", "W", "W"] },
    expectedValue: 1.04,
    riskLevel: "Baixo",
    stadium: "Allianz Parque (São Paulo)",
    referee: "Raphael Claus",
    stats: {
      possession: [45, 55],
      corners: [1, 2],
      yellowCards: [2, 1],
      redCards: [0, 0],
      shotsOnTarget: [1, 1],
      shotsOffTarget: [3, 2],
      xg: [0.18, 0.22]
    },
    lineups: {
      home: ["Weverton", "Rocha", "Gómez", "Murilo", "Caio Paulista", "Aníbal Moreno", "Richard Ríos", "Veiga", "Estêvão", "Felipe Anderson", "Flaco López"],
      away: ["Rafael", "Rafinha", "Arboleda", "Alan Franco", "Welington", "Luiz Gustavo", "Bobadilla", "Lucas Moura", "Luciano", "Wellington Rato", "Calleri"]
    },
    injuries: {
      home: ["Mayke (Transição)", "Piquerez (Joelho)"],
      away: ["Alisson (Tornozelo)", "Ferreirinha (Coxa)"]
    }
  },
  {
    id: "m7",
    homeTeam: "Internazionale",
    awayTeam: "Juventus",
    league: "Serie A",
    country: "Itália",
    time: "19:45",
    date: "Hoje",
    isVIP: true,
    isLive: false,
    iaConfidence: 91,
    iaStars: 5,
    odds: { home: 1.75, draw: 3.50, away: 4.80 },
    probabilities: { home: 54, draw: 28, away: 18 },
    iaMarketSuggestion: "Menos de 3.5 Cartões",
    iaAnalysis: "Embora seja um 'Derby d'Italia', as táticas sob o comando de Simone Inzaghi e Thiago Motta favorecem o controle de jogo em zones seguras sem necessidade de faltas táticas de alta agressividade. Histórico recente de arbitragem tranquila.",
    attackingStrength: { home: 90, away: 84 },
    defendingStrength: { home: 91, away: 92 },
    recentH2H: "Inter 1-0 Juventus, Juventus 1-1 Inter, Inter 1-0 Juventus",
    formGuide: { home: ["W", "W", "L", "W", "W"], away: ["W", "D", "W", "D", "W"] },
    expectedValue: 1.10,
    riskLevel: "Baixo",
    lineups: {
      home: ["Sommer", "Pavard", "Acerbi", "Bastoni", "Darmian", "Barella", "Calhanoglu", "Mkhitaryan", "Dimarco", "Thuram", "Lautaro Martínez"],
      away: ["Di Gregorio", "Savona", "Gatti", "Kalulu", "Cambiaso", "Locatelli", "Fagioli", "Conceição", "Yildiz", "Mbangula", "Vlahovic"]
    },
    injuries: {
      home: ["Buchanan (Perna)"],
      away: ["Bremer (Joelho - Fora da temporada)", "Nico González (Músculo)"]
    }
  },
  {
    id: "m8",
    homeTeam: "Sport Recife",
    awayTeam: "Santos",
    league: "Brasileirão Série B",
    country: "Brasil",
    time: "19:00",
    date: "Amanhã",
    isVIP: false,
    isLive: false,
    iaConfidence: 86,
    iaStars: 4,
    odds: { home: 2.10, draw: 3.10, away: 3.50 },
    probabilities: { home: 44, draw: 31, away: 25 },
    iaMarketSuggestion: "Menos de 2.5 Gols",
    iaAnalysis: "Um embate decisivo no Brasileirão Série B. O Sport é sólido na Ilha do Retiro, mas o Santos joga fechado fora de casa sob pressão do seu setor defensivo consolidado.",
    attackingStrength: { home: 78, away: 82 },
    defendingStrength: { home: 82, away: 85 },
    recentH2H: "Santos 1-1 Sport, Sport 0-0 Santos",
    formGuide: { home: ["W", "D", "W", "L", "W"], away: ["W", "W", "D", "W", "D"] },
    expectedValue: 1.02,
    riskLevel: "Médio",
    lineups: {
      home: ["Caíque", "Igor", "Chico", "Castan", "Felipinho", "Felipe", "Lucas", "Ortiz", "Barletta", "Coutinho", "Gustavo"],
      away: ["Brazão", "Chermont", "Gil", "Jair", "Escobar", "Schmidt", "Diego Pituca", "Giuliano", "Otero", "Guilherme", "Furch"]
    },
    injuries: {
      home: ["Dalbert (Coxa)"],
      away: ["Kevyson (Joelho)"]
    }
  },
  {
    id: "m9",
    homeTeam: "Paris Saint-Germain",
    awayTeam: "Bayern de Munique",
    league: "Champions League",
    country: "Europa",
    time: "32'",
    date: "Hoje",
    isVIP: true,
    isLive: true,
    liveMinute: 32,
    liveScore: [2, 1],
    iaConfidence: 95,
    iaStars: 5,
    odds: { home: 2.40, draw: 3.60, away: 2.60 },
    probabilities: { home: 45, draw: 20, away: 35 },
    iaMarketSuggestion: "Over 3.5 Gols",
    iaAnalysis: "A rivalidade europeia se reflete em um espetáculo extremamente ofensivo. Com 3 gols marcados antes do minuto 30, o cenário tático de contra-ataques velozes de Dembélé e infiltrações de Musiala favorece a projeção de nova chuva de gols.",
    attackingStrength: { home: 94, away: 95 },
    defendingStrength: { home: 80, away: 82 },
    recentH2H: "PSG 0-1 Bayern, Bayern 2-0 PSG, PSG 2-3 Bayern",
    formGuide: { home: ["W", "W", "W", "D", "W"], away: ["W", "W", "D", "W", "W"] },
    expectedValue: 1.18,
    riskLevel: "Baixo",
    stadium: "Parc des Princes (Paris)",
    referee: "Szymon Marciniak",
    stats: {
      possession: [48, 52],
      corners: [3, 5],
      yellowCards: [1, 1],
      redCards: [0, 0],
      shotsOnTarget: [5, 6],
      shotsOffTarget: [4, 4],
      xg: [1.62, 1.78]
    },
    lineups: {
      home: ["Donnarumma", "Hakimi", "Marquinhos", "Pacho", "Mendes", "Zaïre-Emery", "Vitinha", "Neves", "Dembélé", "Asensio", "Barcola"],
      away: ["Neuer", "Kimmich", "Upamecano", "Kim", "Davies", "Palhinha", "Pavlovic", "Olise", "Musiala", "Coman", "Kane"]
    },
    injuries: {
      home: ["Lucas Hernández (Joelho)", "Ramos (Tornozelo)"],
      away: ["Boey (Menisco)"]
    }
  },
  {
    id: "m10",
    homeTeam: "Olympique de Marselha",
    awayTeam: "Mônaco",
    league: "Ligue 1",
    country: "França",
    time: "17:00",
    date: "Próximos dias",
    isVIP: false,
    isLive: false,
    iaConfidence: 84,
    iaStars: 4,
    odds: { home: 2.25, draw: 3.40, away: 2.95 },
    probabilities: { home: 41, draw: 28, away: 31 },
    iaMarketSuggestion: "Ambas Marcam (Sim)",
    iaAnalysis: "O Marselha joga de forma extremamente agressiva em casa sob o comando de De Zerbi. O Mônaco possui transições verticais letais, o que indica alto valor para que ambas as equipes marquem no Vélodrome.",
    attackingStrength: { home: 87, away: 86 },
    defendingStrength: { home: 78, away: 80 },
    recentH2H: "Marselha 2-2 Mônaco, Mônaco 3-2 Marselha",
    formGuide: { home: ["W", "L", "W", "W", "D"], away: ["W", "W", "D", "L", "W"] },
    expectedValue: 1.03,
    riskLevel: "Médio",
    lineups: {
      home: ["Rulli", "Murillo", "Balerdi", "Cornelius", "Merlin", "Højbjerg", "Kondogbia", "Greenwood", "Harit", "Henrique", "Wahi"],
      away: ["Köhn", "Vanderson", "Kehrer", "Salisu", "Caio Henrique", "Zakaria", "Camara", "Akliouche", "Minamino", "Golovin", "Embolo"]
    },
    injuries: {
      home: ["Carboni (Joelho)"],
      away: ["Balogun (Ombro)"]
    }
  },
  {
    id: "m11",
    homeTeam: "Inter Miami",
    awayTeam: "LA Galaxy",
    league: "MLS",
    country: "EUA",
    time: "20:30",
    date: "Amanhã",
    isVIP: false,
    isLive: false,
    iaConfidence: 90,
    iaStars: 5,
    odds: { home: 1.65, draw: 4.10, away: 4.40 },
    probabilities: { home: 57, draw: 22, away: 21 },
    iaMarketSuggestion: "Vitória Inter Miami & Over 1.5",
    iaAnalysis: "Lionel Messi e Luis Suárez continuam em grande sinergia na MLS. Jogando na Flórida, o Inter Miami impõe um volume de jogo muito superior, enfrentando a frágil defesa do Galaxy fora de casa.",
    attackingStrength: { home: 92, away: 83 },
    defendingStrength: { home: 79, away: 75 },
    recentH2H: "LA Galaxy 1-1 Inter Miami",
    formGuide: { home: ["W", "W", "D", "W", "W"], away: ["W", "L", "W", "W", "D"] },
    expectedValue: 1.09,
    riskLevel: "Baixo",
    lineups: {
      home: ["Callender", "Weigandt", "Avilés", "Kryvtsov", "Alba", "Busquets", "Redondo", "Gomez", "Messi", "Suárez", "Taylor"],
      away: ["McCarthy", "Yamane", "Garces", "Caceres", "Nelson", "Delgado", "Brugman", "Puig", "Pec", "Joveljic", "Painstil"]
    },
    injuries: {
      home: ["Farias (Joelho)"],
      away: ["Caceres (Dúvida)"]
    }
  },
  {
    id: "m12",
    homeTeam: "Club América",
    awayTeam: "Chivas Guadalajara",
    league: "Liga MX",
    country: "México",
    time: "21:00",
    date: "Próximos dias",
    isVIP: false,
    isLive: false,
    iaConfidence: 88,
    iaStars: 4,
    odds: { home: 1.80, draw: 3.50, away: 4.30 },
    probabilities: { home: 52, draw: 27, away: 21 },
    iaMarketSuggestion: "Vitória Club América (ML)",
    iaAnalysis: "O 'Clásico de Clásicos' no Estádio Azteca vê o América em excelente fase técnica. A solidez de seu plantel titular sobressai ao Chivas, que tem tido problemas criativos.",
    attackingStrength: { home: 86, away: 79 },
    defendingStrength: { home: 84, away: 81 },
    recentH2H: "América 0-0 Chivas, Chivas 0-1 América, América 1-1 Chivas",
    formGuide: { home: ["W", "D", "W", "W", "L"], away: ["D", "W", "L", "W", "D"] },
    expectedValue: 1.06,
    riskLevel: "Médio",
    lineups: {
      home: ["Malagón", "Reyes", "Cáceres", "Araujo", "Calderón", "Fidalgo", "Dos Santos", "Zendejas", "Valdés", "Rodriguez", "Henry Martín"],
      away: ["Rangel", "Mozo", "Sepúlveda", "Briseño", "Chiquete", "González", "Beltrán", "Gutiérrez", "Alvarado", "Cowell", "Hernández"]
    },
    injuries: {
      home: ["Dilrosun (Músculo)"],
      away: ["Chicharito (Perna)"]
    }
  },
  {
    id: "m13",
    homeTeam: "Benfica",
    awayTeam: "Porto",
    league: "Primeira Liga",
    country: "Portugal",
    time: "20:00",
    date: "Próximos dias",
    isVIP: true,
    isLive: false,
    iaConfidence: 90,
    iaStars: 5,
    odds: { home: 2.05, draw: 3.30, away: 3.40 },
    probabilities: { home: 47, draw: 29, away: 24 },
    iaMarketSuggestion: "Ambas Marcam (Sim)",
    iaAnalysis: "O 'Clássico' português na Luz promete ser eletrizante. O Benfica ostenta força ofensiva brilhante com Di María, enquanto o Porto joga sob transições rápidas comandadas por Galeno. A probabilidade de ambas balançarem as redes é muito alta.",
    attackingStrength: { home: 90, away: 88 },
    defendingStrength: { home: 83, away: 84 },
    recentH2H: "Porto 5-0 Benfica, Benfica 1-0 Porto, Benfica 2-0 Porto",
    formGuide: { home: ["W", "W", "W", "D", "W"], away: ["W", "W", "W", "L", "W"] },
    expectedValue: 1.08,
    riskLevel: "Baixo",
    lineups: {
      home: ["Trubin", "Bah", "Silva", "Otamendi", "Carreras", "Florentino", "Aursnes", "Di María", "Kokçu", "Aktürkoglu", "Pavlidis"],
      away: ["Costa", "Mario", "Perez", "Ze Pedro", "Moura", "Varela", "Eustaquio", "Pepe", "Nico", "Galeno", "Omorodion"]
    },
    injuries: {
      home: ["Sanches (Transição)"],
      away: ["Marcano (Joelho)"]
    }
  },
  {
    id: "m14",
    homeTeam: "Boca Juniors",
    awayTeam: "River Plate",
    league: "Primera División",
    country: "Argentina",
    time: "17:00",
    date: "Próximos dias",
    isVIP: false,
    isLive: false,
    iaConfidence: 85,
    iaStars: 4,
    odds: { home: 2.45, draw: 3.00, away: 3.10 },
    probabilities: { home: 38, draw: 34, away: 28 },
    iaMarketSuggestion: "Menos de 2.5 Gols",
    iaAnalysis: "O Superclássico argentino na Bombonera é sinônimo de extrema paixão, combate físico pesado e poucas concessões táticas. O jogo deve ser truncado, com alto índice de cartões e raros espaços para finalizações limpas.",
    attackingStrength: { home: 80, away: 82 },
    defendingStrength: { home: 85, away: 86 },
    recentH2H: "River 1-1 Boca, Boca 0-2 River, River 1-0 Boca",
    formGuide: { home: ["D", "W", "D", "W", "L"], away: ["W", "D", "W", "D", "W"] },
    expectedValue: 1.02,
    riskLevel: "Médio",
    lineups: {
      home: ["Romero", "Advíncula", "Lema", "Rojo", "Blanco", "Medina", "Pol Fernández", "Zenón", "Martegani", "Merentiel", "Cavani"],
      away: ["Armani", "Bustos", "Pezzella", "Díaz", "Acuña", "Kranevitter", "Fernández", "Simon", "Echeverri", "Colidio", "Borja"]
    },
    injuries: {
      home: ["Saracchi (Músculo)"],
      away: ["Aliendro (Ombro)"]
    }
  },
  {
    id: "m15",
    homeTeam: "Ajax",
    awayTeam: "PSV Eindhoven",
    league: "Eredivisie",
    country: "Holanda",
    time: "16:45",
    date: "Próximos dias",
    isVIP: false,
    isLive: false,
    iaConfidence: 89,
    iaStars: 4,
    odds: { home: 2.70, draw: 3.50, away: 2.30 },
    probabilities: { home: 35, draw: 26, away: 39 },
    iaMarketSuggestion: "Over 2.5 Gols",
    iaAnalysis: "Confronto tradicional na Eredivisie de alto poder dinâmico. O PSV é o time a ser batido na Holanda com média espetacular de gols, enquanto o Ajax vem se reestruturando com forte jogo ofensivo em Amsterdã.",
    attackingStrength: { home: 85, away: 92 },
    defendingStrength: { home: 78, away: 82 },
    recentH2H: "PSV 1-1 Ajax, PSV 5-2 Ajax",
    formGuide: { home: ["W", "W", "D", "W", "D"], away: ["W", "W", "W", "W", "L"] },
    expectedValue: 1.05,
    riskLevel: "Médio",
    lineups: {
      home: ["Pasveer", "Rensch", "Sutalo", "Baas", "Hato", "Fitz-Jim", "Henderson", "Taylor", "Traoré", "Brobbey", "Godts"],
      away: ["Benítez", "Junior", "Flamingo", "Boscagli", "Dams", "Schouten", "Veerman", "Bakayoko", "Til", "Lozano", "De Jong"]
    },
    injuries: {
      home: ["Berghuis (Perna)"],
      away: ["Dest (Joelho)"]
    }
  },
  {
    id: "m16",
    homeTeam: "Yokohama F. Marinos",
    awayTeam: "Kawasaki Frontale",
    league: "J1 League",
    country: "Japão",
    time: "14:00",
    date: "Próximos dias",
    isVIP: false,
    isLive: false,
    iaConfidence: 87,
    iaStars: 4,
    odds: { home: 1.95, draw: 3.60, away: 3.30 },
    probabilities: { home: 48, draw: 26, away: 26 },
    iaMarketSuggestion: "Over 2.5 Gols",
    iaAnalysis: "A J1 League japonesa é conhecida pelas partidas extremamente dinâmicas e transições ofensivas rápidas. Yokohama e Kawasaki mantêm médias elevadas de chutes por jogo e vulnerabilidade a contra-ataques.",
    attackingStrength: { home: 84, away: 80 },
    defendingStrength: { home: 75, away: 76 },
    recentH2H: "Kawasaki 1-3 Yokohama, Yokohama 0-1 Kawasaki",
    formGuide: { home: ["W", "D", "L", "W", "W"], away: ["D", "W", "W", "L", "D"] },
    expectedValue: 1.04,
    riskLevel: "Médio",
    lineups: {
      home: ["Iikura", "Matsubara", "Kamijima", "Eduardo", "Nagato", "Watanabe", "Kida", "Nam", "Yan", "Lopes", "Elber"],
      away: ["Jung", "Saihi", "Jesiel", "Takai", "Miura", "Tachibanada", "Oshima", "Ienaga", "Wakizaka", "Marcinho", "Erison"]
    },
    injuries: {
      home: ["Miyauchi (Coxa)"],
      away: ["Jesiel (Dúvida)"]
    }
  },
  {
    id: "m17",
    homeTeam: "Jeonbuk Motors",
    awayTeam: "Ulsan Hyundai",
    league: "K League",
    country: "Coreia",
    time: "15:00",
    date: "Próximos dias",
    isVIP: false,
    isLive: false,
    iaConfidence: 88,
    iaStars: 4,
    odds: { home: 2.50, draw: 3.20, away: 2.65 },
    probabilities: { home: 38, draw: 30, away: 32 },
    iaMarketSuggestion: "Menos de 2.5 Gols",
    iaAnalysis: "O 'Hyundai Derby' na K-League é um confronto de imensa rivalidade e táticas rígidas de contenção defensiva. Esperamos um embate muito estudado e poucos espaços no terço final.",
    attackingStrength: { home: 80, away: 82 },
    defendingStrength: { home: 83, away: 84 },
    recentH2H: "Jeonbuk 2-0 Ulsan, Ulsan 1-0 Jeonbuk",
    formGuide: { home: ["W", "D", "W", "D", "L"], away: ["W", "W", "D", "W", "W"] },
    expectedValue: 1.03,
    riskLevel: "Médio",
    lineups: {
      home: ["Kim", "Ahn", "Jeong", "Park", "Kim J", "Lee", "Boateng", "Han", "Song", "Hernandez", "Orobo"],
      away: ["Jo", "Seol", "Hwang", "Kim", "Lee M", "Koshimoto", "Jung", "Kang", "Ludvigson", "Um", "Joo"]
    },
    injuries: {
      home: ["Silva (Músculo)"],
      away: ["Lee (Transição)"]
    }
  }
];

export class SportsService {
  private static STORAGE_KEY = "betvision_pro_matches";

  // Lazy initialize cache to avoid breaking environment constraints on load
  static getMatches(): Match[] {
    try {
      const cached = localStorage.getItem(this.STORAGE_KEY);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch (e) {
      console.warn("Storage access failed or is in SSR", e);
    }
    
    // Default mock matches if no cache
    this.saveMatches(MOCK_MATCHES);
    return MOCK_MATCHES;
  }

  static saveMatches(matches: Match[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(matches));
    } catch (e) {
      console.warn("Could not save matches to cache", e);
    }
  }

  // Filter and search matches
  static queryMatches(params: {
    league: string;
    filterType: string;
    searchQuery: string;
    isVIP: boolean;
  }): Match[] {
    const all = this.getMatches();
    return all.filter((match) => {
      // League filtering
      if (params.league !== "all" && match.league !== params.league) {
        return false;
      }

      // Search query filtering
      if (params.searchQuery) {
        const query = params.searchQuery.toLowerCase();
        const matchesSearch =
          match.homeTeam.toLowerCase().includes(query) ||
          match.awayTeam.toLowerCase().includes(query) ||
          match.league.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }

      // IA Filters
      if (params.filterType === "high_confidence" && match.iaConfidence < 90) {
        return false;
      }
      if (params.filterType === "favorites" && match.iaStars < 5) {
        return false;
      }
      if (params.filterType === "over_gols" && !match.iaMarketSuggestion.toLowerCase().includes("gols") && !match.iaMarketSuggestion.toLowerCase().includes("over")) {
        return false;
      }
      if (params.filterType === "btts" && !match.iaMarketSuggestion.toLowerCase().includes("ambas") && !match.iaMarketSuggestion.toLowerCase().includes("btts")) {
        return false;
      }
      if (params.filterType === "vip" && !match.isVIP) {
        return false;
      }

      return true;
    });
  }

  // Simulates incremental real-time live events, minutes, and scoring
  static tickLiveGames(): Match[] {
    const matches = this.getMatches();
    const updated = matches.map((match) => {
      if (match.isLive) {
        const currentMinute = match.liveMinute || 1;
        const nextMinute = currentMinute + 1;
        let score = match.liveScore || [0, 0];
        let hasGoalScored = false;

        // End game at 90 minutes, convert back to static or keep at 90
        if (nextMinute > 90) {
          return {
            ...match,
            time: "Fim",
            liveMinute: 90,
            isLive: false
          };
        }

        // Random chance to score a goal based on team attacking power (about 2.5% chance per minute)
        const isGoalScored = Math.random() < 0.025;
        if (isGoalScored) {
          const isHomeScoring = Math.random() * (match.attackingStrength.home) > Math.random() * (match.attackingStrength.away);
          if (isHomeScoring) {
            score = [score[0] + 1, score[1]];
          } else {
            score = [score[0], score[1] + 1];
          }
          hasGoalScored = true;
        }

        // Realistic live stats simulation
        const currentStats = match.stats || {
          possession: [50, 50],
          corners: [Math.floor(currentMinute / 12), Math.floor(currentMinute / 15)],
          yellowCards: [0, 0],
          redCards: [0, 0],
          shotsOnTarget: [Math.floor(currentMinute / 15), Math.floor(currentMinute / 18)],
          shotsOffTarget: [Math.floor(currentMinute / 10), Math.floor(currentMinute / 12)],
          xg: [parseFloat((currentMinute * 0.02).toFixed(2)), parseFloat((currentMinute * 0.015).toFixed(2))]
        };

        // 1. Possession fluctuations (+/- 2% max per tick)
        const possDiff = Math.random() > 0.5 ? 1 : -1;
        let homePoss = Math.max(30, Math.min(70, currentStats.possession[0] + possDiff));
        let awayPoss = 100 - homePoss;

        // 2. Shots and xG progression
        let hShotsOn = currentStats.shotsOnTarget[0];
        let aShotsOn = currentStats.shotsOnTarget[1];
        let hShotsOff = currentStats.shotsOffTarget[0];
        let aShotsOff = currentStats.shotsOffTarget[1];
        let hXg = currentStats.xg[0];
        let aXg = currentStats.xg[1];

        if (hasGoalScored) {
          // A goal always triggers a shot on target and xG jump
          if (isGoalScored) {
            const isHomeScoring = Math.random() * (match.attackingStrength.home) > Math.random() * (match.attackingStrength.away);
            if (isHomeScoring) {
              hShotsOn += 1;
              hXg = parseFloat((hXg + 0.75).toFixed(2));
            } else {
              aShotsOn += 1;
              aXg = parseFloat((aXg + 0.75).toFixed(2));
            }
          }
        } else {
          // Small chances for normal shots
          if (Math.random() < 0.15) {
            if (Math.random() * match.attackingStrength.home > Math.random() * match.attackingStrength.away) {
              if (Math.random() > 0.5) {
                hShotsOn += 1;
                hXg = parseFloat((hXg + parseFloat((Math.random() * 0.25).toFixed(2))).toFixed(2));
              } else {
                hShotsOff += 1;
                hXg = parseFloat((hXg + parseFloat((Math.random() * 0.10).toFixed(2))).toFixed(2));
              }
            } else {
              if (Math.random() > 0.5) {
                aShotsOn += 1;
                aXg = parseFloat((aXg + parseFloat((Math.random() * 0.25).toFixed(2))).toFixed(2));
              } else {
                aShotsOff += 1;
                aXg = parseFloat((aXg + parseFloat((Math.random() * 0.10).toFixed(2))).toFixed(2));
              }
            }
          }
        }

        // 3. Corners progression (8% chance per minute)
        let hCorners = currentStats.corners[0];
        let aCorners = currentStats.corners[1];
        if (Math.random() < 0.08) {
          if (Math.random() * match.attackingStrength.home > Math.random() * match.attackingStrength.away) {
            hCorners += 1;
          } else {
            aCorners += 1;
          }
        }

        // 4. Yellow Cards (4% chance)
        let hYellow = currentStats.yellowCards[0];
        let aYellow = currentStats.yellowCards[1];
        if (Math.random() < 0.04) {
          if (Math.random() > 0.5) {
            hYellow += 1;
          } else {
            aYellow += 1;
          }
        }

        // 5. Red Cards (0.5% chance)
        let hRed = currentStats.redCards[0];
        let aRed = currentStats.redCards[1];
        if (Math.random() < 0.005) {
          if (Math.random() > 0.5) {
            hRed += 1;
          } else {
            aRed += 1;
          }
        }

        const nextStats = {
          possession: [homePoss, awayPoss] as [number, number],
          corners: [hCorners, aCorners] as [number, number],
          yellowCards: [hYellow, aYellow] as [number, number],
          redCards: [hRed, aRed] as [number, number],
          shotsOnTarget: [hShotsOn, aShotsOn] as [number, number],
          shotsOffTarget: [hShotsOff, aShotsOff] as [number, number],
          xg: [hXg, aXg] as [number, number]
        };

        // Calculate dynamic live probabilities based on current score and minute
        const [homeScore, awayScore] = score;
        const scoreDiff = homeScore - awayScore;

        // Base pre-match probabilities or default mid values
        const preMatchProb = match.probabilities || { home: 45, draw: 30, away: 25 };
        let homeW = preMatchProb.home;
        let awayW = preMatchProb.away;
        let drawW = preMatchProb.draw;

        if (scoreDiff > 0) {
          // Home team leading
          const timeFactor = nextMinute / 90;
          homeW = preMatchProb.home + (100 - preMatchProb.home) * timeFactor * (0.4 + scoreDiff * 0.4);
          awayW = preMatchProb.away * (1 - timeFactor) / (scoreDiff + 1);
          drawW = 100 - homeW - awayW;
        } else if (scoreDiff < 0) {
          // Away team leading
          const timeFactor = nextMinute / 90;
          const absDiff = Math.abs(scoreDiff);
          awayW = preMatchProb.away + (100 - preMatchProb.away) * timeFactor * (0.4 + absDiff * 0.4);
          homeW = preMatchProb.home * (1 - timeFactor) / (absDiff + 1);
          drawW = 100 - homeW - awayW;
        } else {
          // Tied game
          const timeFactor = nextMinute / 90;
          drawW = preMatchProb.draw + (100 - preMatchProb.draw) * timeFactor * 0.65;
          const rem = 100 - drawW;
          const sumPre = (preMatchProb.home + preMatchProb.away) || 1;
          homeW = rem * (preMatchProb.home / sumPre);
          awayW = rem * (preMatchProb.away / sumPre);
        }

        // Normalize
        homeW = Math.round(Math.max(1, Math.min(98, homeW)));
        awayW = Math.round(Math.max(1, Math.min(98, awayW)));
        drawW = 100 - homeW - awayW;

        if (drawW < 1) {
          drawW = 1;
          homeW = 100 - drawW - awayW;
        }

        const nextProbabilities = { home: homeW, draw: drawW, away: awayW };

        // Calculate new live odds based on the probabilities
        const liveOdds = {
          home: parseFloat(Math.max(1.01, Math.min(50, 95 / nextProbabilities.home)).toFixed(2)),
          draw: parseFloat(Math.max(1.01, Math.min(50, 95 / nextProbabilities.draw)).toFixed(2)),
          away: parseFloat(Math.max(1.01, Math.min(50, 95 / nextProbabilities.away)).toFixed(2))
        };

        return {
          ...match,
          liveMinute: nextMinute,
          time: `${nextMinute}'`,
          liveScore: score,
          probabilities: nextProbabilities,
          odds: liveOdds,
          stats: nextStats
        };
      }
      return match;
    });

    this.saveMatches(updated);
    return updated;
  }

  // Standings classifications
  static getStandings(league: string) {
    // Highly-detailed local classification standing records
    const defaultStandings: Record<string, Array<{ pos: number; team: string; j: number; v: number; e: number; d: number; gp: number; gc: number; pts: number }>> = {
      "Premier League": [
        { pos: 1, team: "Arsenal", j: 28, v: 21, e: 4, d: 3, gp: 65, gc: 21, pts: 67 },
        { pos: 2, team: "Manchester City", j: 28, v: 20, e: 5, d: 3, gp: 70, gc: 28, pts: 65 },
        { pos: 3, team: "Liverpool", j: 28, v: 19, e: 6, d: 3, gp: 62, gc: 25, pts: 63 },
        { pos: 4, team: "Chelsea", j: 28, v: 15, e: 7, d: 6, gp: 51, gc: 38, pts: 52 },
        { pos: 5, team: "Aston Villa", j: 28, v: 14, e: 6, d: 8, gp: 48, gc: 42, pts: 48 }
      ],
      "Libertadores": [
        { pos: 1, team: "Flamengo", j: 5, v: 4, e: 1, d: 0, gp: 12, gc: 3, pts: 13 },
        { pos: 2, team: "River Plate", j: 5, v: 3, e: 1, d: 1, gp: 9, gc: 5, pts: 10 },
        { pos: 3, team: "Bolivar", j: 5, v: 1, e: 2, d: 2, gp: 5, gc: 8, pts: 5 },
        { pos: 4, team: "Tachira", j: 5, v: 0, e: 2, d: 3, gp: 2, gc: 12, pts: 2 }
      ],
      "La Liga": [
        { pos: 1, team: "Real Madrid", j: 27, v: 22, e: 4, d: 1, gp: 68, gc: 18, pts: 70 },
        { pos: 2, team: "Barcelona", j: 27, v: 19, e: 5, d: 3, gp: 61, gc: 29, pts: 62 },
        { pos: 3, team: "Atlético de Madrid", j: 27, v: 17, e: 4, d: 6, gp: 52, gc: 28, pts: 55 },
        { pos: 4, team: "Girona", j: 27, v: 16, e: 5, d: 6, gp: 54, gc: 32, pts: 53 }
      ],
      "Brasileirão": [
        { pos: 1, team: "Botafogo", j: 31, v: 20, e: 6, d: 5, gp: 58, gc: 29, pts: 66 },
        { pos: 2, team: "Palmeiras", j: 31, v: 19, e: 7, d: 5, gp: 54, gc: 25, pts: 64 },
        { pos: 3, team: "Fortaleza", j: 31, v: 18, e: 8, d: 5, gp: 47, gc: 31, pts: 62 },
        { pos: 4, team: "Flamengo", j: 31, v: 17, e: 8, d: 6, gp: 51, gc: 33, pts: 59 },
        { pos: 5, team: "São Paulo", j: 31, v: 16, e: 6, d: 9, gp: 45, gc: 32, pts: 54 }
      ],
      "Serie A": [
        { pos: 1, team: "Internazionale", j: 28, v: 21, e: 5, d: 2, gp: 64, gc: 19, pts: 68 },
        { pos: 2, team: "Juventus", j: 28, v: 17, e: 9, d: 2, gp: 44, gc: 15, pts: 60 },
        { pos: 3, team: "Milan", j: 28, v: 17, e: 5, d: 6, gp: 50, gc: 30, pts: 56 },
        { pos: 4, team: "Atalanta", j: 28, v: 15, e: 5, d: 8, gp: 49, gc: 31, pts: 50 }
      ]
    };

    return defaultStandings[league] || defaultStandings["Premier League"];
  }
}

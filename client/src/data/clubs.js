const clubs = [
    {
        name: "AC Milan",
        name2: "AcMilan",
        Leagues: 19,
        SerieA : 19,
        ChampionsLeagues : 7,
        DomesticCups: 13,
        InternationalCups: 18,
        Total: 50
    },
    {
        name: "Ajax Amsterdam",
        name2: "Ajax",
        Leagues: 36,
        ChampionsLeagues: 4,
        DomesticCups: 29,
        InternationalCups: 11,
        Total: 76
    },
    {
        name: "Anderlecht Bruxelles",
        name2: "Anderlecht",
        Leagues: 34,
        DomesticCups: 25,
        InternationalCups: 5,
        Total: 64
    },
    {
        name: "Arsenal",
        name2: "Arsenal",
        PLs: 13,
        Leagues: 13,
        DomesticCups: 33,
        InternationalCups: 2,
        Total: 48
    },
    {
        name: "Aston Villa",
        name2: "AstonVilla",
        PLs: 7,
        Leagues: 7,
        ChampionsLeagues: 1,
        DomesticCups: 13,
        InternationalCups: 3,
        Total: 24
    },
    {
        name: "Atalanta Bergamasca",
        name2: "Atalanta",
        DomesticCups: 1,
        InternationalCups: 1,
        Total: 2
    },
    {
        name: "Atletic Bilbao",
        name2: "AtleticBilbao",
        Leagues: 8,
        Laliga: 8,
        DomesticCups: 27,
        Total: 35
    },
    {
        name: "Atlético de Madrid",
        name2: "AtleticoMadrid",
        Leagues: 11,
        Laliga: 11,
        DomesticCups: 14,
        InternationalCups: 8,
        Total: 33
    },
    {
        name: "FC Barcelona",
        name2: "Barça",
        Leagues: 28,
        Laliga: 28,
        DomesticCups: 49,
        ChampionsLeagues: 5,
        InternationalCups: 11,
        Total: 97
    },
    {
        name: "Bayern Munich",
        name2: "Bayern",
        Leagues: 34,
        Bundesliga: 34,
        DomesticCups: 36,
        ChampionsLeagues: 6,
        InternationalCups: 14,
        Total: 84
    },
    {
        name: "Juventus FC",
        name2: "Juventus",
        Leagues: 36,
        SerieA: 36,
        DomesticCups: 24,
        ChampionsLeagues: 2,
        InternationalCups: 11,
        Total: 71
    },
    {
        name: "Benfica Lisbonne",
        name2: "Benfica",
        Leagues: 38,
        DomesticCups: 26,
        ChampionsLeagues: 2,
        InternationalCups: 2,
        Total: 70
    },
    {
        name: "Celtic Glasgow",
        name2: "Celtic",
        Leagues: 55,
        ChampionsLeagues: 1,
        DomesticCups: 64,
        InternationalCups: 1,
        Total: 120
    },
    {
        name: "Chelsea",
        name2: "Chelsea",
        PLs: 6,
        Leagues: 6,
        DomesticCups: 17,
        ChampionsLeagues: 2,
        InternationalCups: 10,
        Total: 33
    },
    {
        name: "Club Brugge",
        name2: "ClubBrugge",
        Leagues: 19,
        DomesticCups: 28,
        Total: 47
    },
    {
        name: "Borussia Dortmund",
        name2: "Dortmund",
        Bundesliga : 8,
        Leagues : 8,
        DomesticCups : 11,
        ChampionsLeagues : 1,
        InternationalCups : 3,
        Total : 22
    },
    {
      name : "Everton FC",
      name2 : "Everton",
      PLs : 9,
      Leagues : 9,
      DomesticCups : 14,
      InternationalCups : 1,
      Total : 24
    },
    {
        name: "Feyenoord Rotterdam",
        name2: "Feyenoord",
        Leagues: 16,
        DomesticCups: 19,
        ChampionsLeagues: 1,
        InternationalCups: 4,
        Total: 39
    },
    {
        name: "Galatassaray",
        name2: "Galatassaray",
        Leagues: 24,
        DomesticCups: 35,
        InternationalCups: 2,
        Total: 61
    },
    {
        name: "Inter Milan",
        name2: "InterMilan",
        Leagues: 20,
        SerieA: 20,
        ChampionsLeagues: 3,
        DomesticCups: 17,
        InternationalCups: 9,
        Total: 46
    },
    {
        name: "Lazios Rome",
        name2: "Lazio",
        Leagues: 2,
        SerieA: 2,
        DomesticCups: 12,
        InternationalCups: 2,
        Total: 16
    },
    {
        name: "Liverpool FC",
        name2: "Liverpool",
        PLs: 20,
        Leagues: 20,
        DomesticCups: 34,
        ChampionsLeagues: 6,
        InternationalCups: 14,
        Total: 68
    },
    {
        name: "Manchester City",
        name2: "mancity",
        PLs: 10,
        Leagues: 10,
        DomesticCups: 22,
        ChampionsLeagues: 1,
        InternationalCups: 4,
        Total: 36
    },
    {
        name: "Manchester United",
        name2: "manunited",
        PLs: 20,
        Leagues: 20,
        DomesticCups: 40,
        ChampionsLeagues: 3,
        InternationalCups: 8,
        Total: 68
    },
    {
      name : "Olympique de Marseille",
      name2 : "Marseille",
      Ligue1 : 9,
      Leagues : 9,
      DomesticCups : 16,
      ChampionsLeagues : 1,
      InternationalCups : 2,
      Total : 27
    },
    {
        name: "AS Monaco",
        name2: "Monaco",
        Ligue1: 8,
        Leagues: 8,
        DomesticCups: 10,
        Total: 18
    },
    {
        name: "Napoli",
        name2: "Napoli",
        SerieA: 4,
        Leagues: 4,
        DomesticCups: 8,
        InternationalCups: 1,
        Total: 13
    },
    {
        name: "FC Porto",
        name2: "Porto",
        Leagues: 30,
        DomesticCups: 45,
        ChampionsLeagues: 2,
        InternationalCups: 7,
        Total: 82
    },
    {
      name : "Paris Saint-Germain",
      name2 : "PSG",
      Ligue1 : 13,
      Leagues : 13,
      DomesticCups : 38,
      InternationalCups : 3, // A confirmer
      Total : 54 // A confirmer
    },
    {
        name: "Rangers FC",
        name2: "Rangers",
        Leagues: 55,
        DomesticCups: 62,
        InternationalCups: 1,
        Total: 118
    },
    {
        name: "Real Madrid CF",
        name2: "RealMadrid",
        Laliga: 36, 
        Leagues: 36, 
        DomesticCups: 34,
        ChampionsLeagues: 15,
        InternationalCups: 38,
        Total: 108 // A confirmer
    },
    {
        name: "Roma",
        name2: "Roma",
        SerieA: 3,
        Leagues: 3,
        DomesticCups: 11,
        InternationalCups: 2,
        Total: 16
    },
    {
        name: "Sevilla FC",
        name2: "Sevilla",
        Leagues: 1,
        Laliga: 1,
        DomesticCups: 6,
        InternationalCups: 8,
        Total: 15
    },
    {
        name: "Sporting Lisbonne",
        name2: "Sporting",  
        Leagues: 20,
        DomesticCups: 34,
        InternationalCups: 1,
        Total: 55
    },
    {
        name: "Stuttgart",
        name2: "Stuttgart",
        Bundesliga: 5,
        Leagues: 5,
        DomesticCups: 4,
        InternationalCups: 2,
        Total: 11
    }
]
export {clubs};

const database = {
  general: {
    easy: [ { q: "¿En qué ciudad nació Jesús?", o: ["Jerusalén", "Belén", "Nazaret", "Jericó"], a: 1, c: "MATEO 2:1", vt: "Cuando Jesús nació en Belén de Judea..." } ],
    medium: [ { q: "¿Cómo se llamaba el suegro de Moisés?", o: ["Jetro", "Aarón", "Caleb", "Josué"], a: 0, c: "ÉXODO 3:1", vt: "Y apacentando Moisés las ovejas de Jetro su suegro..." } ],
    hard: [ { q: "¿Quién fue el rey de Babilonia que vio la escritura en la pared?", o: ["Nabucodonosor", "Belsasar", "Darío", "Ciro"], a: 1, c: "DANIEL 5:1", vt: "El rey Belsasar hizo un gran banquete..." } ]
  },
  books: {
    easy: [ { q: "«En el principio creó Dios los cielos y la tierra.»", o: ["GÉNESIS", "ÉXODO", "SALMOS", "MATEO"], a: 0, c: "GÉNESIS 1:1", vt: "En el principio creó Dios los cielos y la tierra." } ],
    medium: [ { q: "«Jehová es mi pastor; nada me faltará.»", o: ["PROVERBIOS", "SALMOS", "ISAÍAS", "MATEO"], a: 1, c: "SALMOS 23:1", vt: "Jehová es mi pastor; nada me faltará." } ],
    hard: [ { q: "«Todo lo puedo en Cristo que me fortalece.»", o: ["FILIPENSES", "EFESIOS", "GÁLATAS", "COLOSENSES"], a: 0, c: "FILIPENSES 4:13", vt: "Todo lo puedo en Cristo que me fortalece." } ]
  },
  characters: {
    easy: [
      { 
        name: "MOISÉS", 
        options: ["MOISÉS", "AARÓN", "JOSUÉ", "GEDEÓN"], 
        clues: [
          "Rescatado de las aguas del río", 
          "Crio su infancia en el palacio real de Egipto", 
          "Llamado por Dios a través de una zarza ardiente"
        ], 
        ref: "ÉXODO" 
      }
    ],
    medium: [
      { 
        name: "DAVID", 
        options: ["DAVID", "SAÚL", "SALOMÓN", "SAMSÓN"], 
        clues: [
          "Era el menor de todos los hijos de Isaí", 
          "Trabajaba como humilde pastor de ovejas en Belén", 
          "Derrotó a un gigante filisteo con una honda"
        ], 
        ref: "1 SAMUEL" 
      }
    ],
    hard: [
      { 
        name: "ESTER", 
        options: ["ESTER", "RUT", "NOEMÍ", "VÁSQUEZ"], 
        clues: [
          "Quedó huérfana de padres en su juventud", 
          "Su nombre hebreo original era Hadasa", 
          "Pronunció la valiente frase: 'Si perezco, que perezca'"
        ], 
        ref: "LIBRO DE ESTER" 
      }
    ]
  },
  completeVerses: {
    easy: [ { display: "Jehová es mi __1__; nada me __2__...", correct: ["pastor", "faltará"], distractors: ["amigo", "sobrará"], ref: "SALMOS 23:1" } ],
    medium: [ { display: "Lámpara es a mis __1__ tu palabra, Y lumbrera a mi __2__.", correct: ["pies", "camino"], distractors: ["manos", "vida"], ref: "SALMOS 119:105" } ],
    hard: [ { display: "Fíate de Jehová de todo tu __1__, y no te apuches en tu propia __2__.", correct: ["corazón", "prudencia"], distractors: ["mente", "fuerza"], ref: "PROVERBIOS 3:5" } ]
  }
};

function adminProcessBulk() {
  const trivia = document.getElementById('bulk-trivia-type').value;
  const diff = document.getElementById('bulk-difficulty').value;
  const rawText = document.getElementById('bulk-json-input').value.trim();

  if (!rawText) {
    alert("Por favor pega un bloque de datos JSON válido.");
    return;
  }

  try {
    const parsedData = JSON.parse(rawText);
    if (!Array.isArray(parsedData)) throw new Error("El contenido debe ser un arreglo [ ... ]");

    let addedCount = 0;
    let skippedCount = 0;

    // Asegurar estructura
    if (!database[trivia]) database[trivia] = {};
    if (!database[trivia][diff]) database[trivia][diff] = [];

    const targetArray = database[trivia][diff];

    parsedData.forEach(item => {
      let isDuplicate = false;

      if (trivia === 'general' || trivia === 'books') {
        isDuplicate = targetArray.some(existing => existing.q.trim().toLowerCase() === item.q.trim().toLowerCase());
      } else if (trivia === 'characters') {
        isDuplicate = targetArray.some(existing => existing.name.trim().toUpperCase() === item.name.trim().toUpperCase());
      } else if (trivia === 'complete') {
        isDuplicate = targetArray.some(existing => existing.display.trim().toLowerCase() === item.display.trim().toLowerCase());
      }

      if (!isDuplicate) {
        targetArray.push(item);
        addedCount++;
      } else {
        skippedCount++;
      }
    });

    alert(`¡Proceso completado!\n\n- Elementos agregados: ${addedCount}\n- Omitidos por duplicado: ${skippedCount}`);
    document.getElementById('bulk-json-input').value = "";

  } catch (error) {
    alert("Error al procesar el JSON: " + error.message);
  }
}

function adminExportDatabaseFile() {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const fileName = `BASE_${day}${month}.js`;

  const fileContent = `// Base de datos exportada el ${day}/${month}\nconst database = ` + JSON.stringify(database, null, 2) + `;`;
  
  // Usar codificación URI data-string en lugar de Blob para evitar bloqueos en GitHub Pages
  const encodedUri = 'data:text/javascript;charset=utf-8,' + encodeURIComponent(fileContent);
  const a = document.createElement('a');
  a.setAttribute('href', encodedUri);
  a.setAttribute('download', fileName);
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  alert(`¡Archivo "${fileName}" generado exitosamente! Reemplaza o renombra este archivo como database.js en tu repositorio.`);
}

function downloadTemplateFile() {
  const trivia = document.getElementById('bulk-trivia-type').value;
  let sampleData = [];

  if (trivia === 'general' || trivia === 'books') {
    sampleData = [
      {
        "q": "¿En qué ciudad nació Jesús?",
        "o": ["Jerusalén", "Belén", "Nazaret", "Jericó"],
        "a": 1,
        "c": "MATEO 2:1",
        "vt": "Cuando Jesús nació en Belén de Judea en días del rey Herodes..."
      }
    ];
  } else if (trivia === 'characters') {
    sampleData = [
      {
        "name": "MOISÉS",
        "options": ["MOISÉS", "AARÓN", "JOSUÉ", "GEDEÓN"],
        "clues": [
          "Rescatado de las aguas del río",
          "Crio su infancia en el palacio real de Egipto",
          "Llamado por Dios a través de una zarza ardiente"
        ],
        "ref": "ÉXODO / DEUTERONOMIO"
      }
    ];
  } else if (trivia === 'complete') {
    sampleData = [
      {
        "display": "Jehová es mi __1__; nada me __2__; En lugares de delicados __3__ me hará descansar.",
        "correct": ["pastor", "faltará", "pastos"],
        "distractors": ["amigo", "sobrará", "montes"],
        "ref": "SALMOS 23:1-2"
      }
    ];
  }

  const jsonString = JSON.stringify(sampleData, null, 2);
  const encodedUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(jsonString);
  const a = document.createElement('a');
  a.setAttribute('href', encodedUri);
  a.setAttribute('download', `PLANTILLA_${trivia.toUpperCase()}.json`);
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

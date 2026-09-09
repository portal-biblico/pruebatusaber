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

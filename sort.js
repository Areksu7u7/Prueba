// Referencias a los elementos del DOM
const bubblesDiv = document.getElementById('bubbles');
const numInput = document.getElementById('numValues');
const minInput = document.getElementById('minValue');
const maxInput = document.getElementById('maxValue');
const randomBtn = document.getElementById('randomBtn');
const customBtn = document.getElementById('customBtn');
const clearBtn = document.getElementById('clearBtn');
const bubbleBtn = document.getElementById('bubbleBtn');
const insertionBtn = document.getElementById('insertionBtn');
const shellBtn = document.getElementById('shellBtn');
const mergeBtn = document.getElementById('mergeBtn');
const selectionBtn = document.getElementById('selectionBtn');
const algoName = document.getElementById('algoName');
const helpBtn = document.getElementById('helpBtn');
const helpModal = document.getElementById('helpModal');
const customModal = document.getElementById('customModal');
const closeModal = document.querySelector('.close');
const closeCustom = document.getElementById('closeCustom');
const customNumbers = document.getElementById('customNumbers');
const confirmCustom = document.getElementById('confirmCustom');
const cancelCustom = document.getElementById('cancelCustom');
const ascOrder = document.getElementById('ascOrder');
const descOrder = document.getElementById('descOrder');
const exportBtn = document.getElementById('exportBtn');
const importBtn = document.getElementById('importBtn');
const exportModal = document.getElementById('exportModal');
const closeExport = document.getElementById('closeExport');
const cancelExport = document.getElementById('cancelExport');
const confirmExport = document.getElementById('confirmExport');
const exportFileName = document.getElementById('exportFileName');
const importFile = document.createElement('input');
const statusMessage = document.getElementById('statusMessage');

let values = [];
let sorting = false;
let animationSpeed = 50;
let bubbles = [];
let operationsCount = 0;

// Configurar input file para importar
importFile.type = 'file';
importFile.accept = '.json';
importFile.id = 'importFile';
importFile.style.display = 'none';
document.body.appendChild(importFile);

// Función para mostrar mensajes en pantalla
function showMessage(message, type = 'info', duration = 4000) {
    statusMessage.textContent = message;
    statusMessage.className = `status-message ${type}`;
    statusMessage.style.display = 'block';
    
    setTimeout(() => {
        statusMessage.style.display = 'none';
    }, duration);
}

// Obtener dirección de ordenamiento
function getSortOrder() {
    return descOrder.checked ? 'desc' : 'asc';
}

// Función de comparación según el orden seleccionado
function compare(a, b, order = 'asc') {
    if (order === 'desc') {
        return a < b; // Para orden descendente
    }
    return a > b; // Para orden ascendente
}

// Limpiar todos los valores
function clearAll() {
    if (sorting) return;
    values = [];
    operationsCount = 0;
    render();
    showMessage('🗑️ Todos los valores han sido eliminados', 'info', 3000);
    algoName.textContent = 'Lista vacía - Agrega valores para ordenar';
}

// Generar valores únicos aleatorios dentro del rango especificado
function randomValues(n, min = 0, max = 100) {
    if (n === 0) {
        clearAll();
        return;
    }
    
    // Verificar que el rango sea válido
    const range = max - min + 1;
    if (range < n) {
        const newMax = min + n - 1;
        showMessage(`⚠️ Rango insuficiente! Se ajustó máximo a ${newMax} para generar ${n} valores únicos`, 'warning', 5000);
        maxInput.value = newMax;
        max = newMax;
    }
    
    // Crear un array con todos los números posibles en el rango
    const allPossibleNumbers = Array.from({ length: max - min + 1 }, (_, i) => i + min);
    
    // Mezclar usando Fisher-Yates
    for (let i = allPossibleNumbers.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [allPossibleNumbers[i], allPossibleNumbers[j]] = [allPossibleNumbers[j], allPossibleNumbers[i]];
    }
    
    // Tomar los primeros n números únicos
    values = allPossibleNumbers.slice(0, n);
    operationsCount = 0;
    render();
    showMessage(`🎲 Generadas ${n} bolas con valores únicos en el rango ${min}-${max}`, 'success', 3000);
    algoName.textContent = '';
}

// Función para ingresar números personalizados
function setCustomValues() {
    customModal.style.display = 'block';
    customNumbers.focus();
}

// Procesar números personalizados
function processCustomNumbers() {
    const input = customNumbers.value.trim();
    if (!input) {
        showMessage('❌ Por favor ingresa algunos números', 'error', 3000);
        return;
    }
    
    try {
        // Limpiar y procesar los números
        const numberArray = input.split(',')
            .map(num => num.trim())
            .filter(num => num !== '')
            .map(num => {
                const parsed = parseInt(num);
                if (isNaN(parsed)) {
                    throw new Error(`"${num}" no es un número válido`);
                }
                return parsed;
            });
        
        if (numberArray.length === 0) {
            clearAll();
            customModal.style.display = 'none';
            return;
        }
        
        if (numberArray.length > 1000) {
            showMessage('❌ Máximo 1000 números permitidos', 'error', 4000);
            return;
        }
        
        // Actualizar la interfaz
        values = numberArray;
        numInput.value = values.length;
        const minVal = Math.min(...values);
        const maxVal = Math.max(...values);
        minInput.value = minVal;
        maxInput.value = maxVal;
        operationsCount = 0;
        
        render();
        showMessage(`✅ ${values.length} números personalizados cargados (rango: ${minVal}-${maxVal})`, 'success', 4000);
        algoName.textContent = '';
        customModal.style.display = 'none';
        customNumbers.value = '';
        
    } catch (error) {
        showMessage(`❌ Error: ${error.message}`, 'error', 5000);
    }
}

// Calcular tamaño proporcional al valor (BURBUJAS MÁS GRANDES)
function calculateBubbleSize(value, n) {
    if (n === 0) return 0;
    
    const minVal = Math.min(...values);
    const maxVal = Math.max(...values);
    const range = maxVal - minVal || 1;
    const normalized = (value - minVal) / range;
    
    // Tamaños más grandes según cantidad de elementos
    let minSize, maxSize;
    if (n <= 30) {
        minSize = 70;
        maxSize = 140;
    } else if (n <= 60) {
        minSize = 60;
        maxSize = 110;
    } else if (n <= 100) {
        minSize = 50;
        maxSize = 90;
    } else if (n <= 200) {
        minSize = 45;
        maxSize = 75;
    } else {
        minSize = 40;
        maxSize = 65;
    }
    
    return minSize + (normalized * (maxSize - minSize));
}

// Tamaño de fuente proporcional
function calculateFontSize(bubbleSize) {
    return Math.max(10, Math.floor(bubbleSize * 0.28));
}

// Render optimizado
function render() {
    bubblesDiv.innerHTML = '';
    const n = values.length;
    
    if (n === 0) {
        const emptyMessage = document.createElement('div');
        emptyMessage.className = 'empty-message';
        emptyMessage.textContent = '🎈 No hay burbujas para mostrar. Usa "Generar" o "Personalizar" para agregar valores.';
        bubblesDiv.appendChild(emptyMessage);
        return;
    }

    bubbles = [];
    const fragment = document.createDocumentFragment();
    
    for (let i = 0; i < n; i++) {
        const value = values[i];
        const bubbleSize = calculateBubbleSize(value, n);
        const fontSize = calculateFontSize(bubbleSize);

        const bubble = document.createElement('div');
        bubble.className = 'bubble';
        bubble.style.width = `${bubbleSize}px`;
        bubble.style.height = `${bubbleSize}px`;
        bubble.style.fontSize = `${fontSize}px`;
        bubble.textContent = value;

        fragment.appendChild(bubble);
        bubbles.push(bubble);
    }
    
    bubblesDiv.appendChild(fragment);
}

// Actualización ultra optimizada con batch rendering
function updateBubbles(active = [], sorted = [], comparing = []) {
    const activeSet = new Set(active);
    const sortedSet = new Set(sorted);
    const comparingSet = new Set(comparing);
    
    bubbles.forEach((bubble, index) => {
        const value = values[index];
        const currentValue = parseInt(bubble.textContent);
        
        // Solo actualizar si cambió el valor
        if (currentValue !== value) {
            bubble.textContent = value;
            
            // Recalcular tamaño solo si cambió el valor
            const newSize = calculateBubbleSize(value, values.length);
            const newFontSize = calculateFontSize(newSize);
            bubble.style.width = `${newSize}px`;
            bubble.style.height = `${newSize}px`;
            bubble.style.fontSize = `${newFontSize}px`;
        }
        
        // Actualizar clases eficientemente
        const isActive = activeSet.has(index);
        const isSorted = sortedSet.has(index);
        const isComparing = comparingSet.has(index);
        
        bubble.classList.toggle('active', isActive);
        bubble.classList.toggle('sorted', isSorted);
        bubble.classList.toggle('comparing', isComparing);
    });
}

// Deshabilitar botones
function disableButtons(disabled) {
    const buttons = [bubbleBtn, insertionBtn, shellBtn, mergeBtn, selectionBtn, randomBtn, customBtn, clearBtn, exportBtn, importBtn];
    buttons.forEach(btn => (btn.disabled = disabled));
    numInput.disabled = disabled;
    minInput.disabled = disabled;
    maxInput.disabled = disabled;
    ascOrder.disabled = disabled;
    descOrder.disabled = disabled;
}

// Delay adaptativo
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Calcular velocidad según tamaño
function getAnimationSpeed(n) {
    if (n <= 20) return 50;
    if (n <= 50) return 30;
    if (n <= 100) return 15;
    if (n <= 200) return 8;
    return 3;
}

// Calcular valor Big O
function calculateBigO(algoName, n) {
    if (n === 0) return 0;
    
    let bigOValue;
    
    switch(algoName) {
        case 'Bubble Sort':
        case 'Selection Sort':
        case 'Insertion Sort':
            bigOValue = n * n;
            break;
        case 'Shell Sort':
        case 'Merge Sort':
            bigOValue = n * Math.log2(n);
            break;
        default:
            bigOValue = 0;
    }
    
    return Math.round(bigOValue);
}

// Mostrar información del algoritmo con Big O calculado
function updateAlgoInfo(name, n) {
    if (n === 0) {
        algoName.textContent = '❌ No hay valores para ordenar';
        return;
    }
    
    const order = getSortOrder();
    const orderSymbol = order === 'asc' ? '⬆️' : '⬇️';
    const bigOValue = calculateBigO(name, n);
    const operationsText = operationsCount > 0 ? ` | Operaciones: ${operationsCount.toLocaleString()}` : '';
    algoName.textContent = `${name} ${orderSymbol} - O(${getBigONotation(name)}) [n=${n}] ≈ ${bigOValue.toLocaleString()}${operationsText}`;
}

// Obtener notación Big O
function getBigONotation(algoName) {
    switch(algoName) {
        case 'Bubble Sort':
        case 'Selection Sort':
        case 'Insertion Sort':
            return 'n²';
        case 'Shell Sort':
        case 'Merge Sort':
            return 'n log n';
        default:
            return '?';
    }
}

// ALGORITMOS OPTIMIZADOS (sin cambios en la lógica de ordenamiento)
async function bubbleSort() {
    const n = values.length;
    if (n === 0) {
        updateAlgoInfo('Bubble Sort', n);
        showMessage('❌ No hay valores para ordenar', 'error', 3000);
        return;
    }
    
    animationSpeed = getAnimationSpeed(n);
    operationsCount = 0;
    const order = getSortOrder();
    
    disableButtons(true);
    sorting = true;
    showMessage(`🌀 Iniciando Bubble Sort (${order === 'asc' ? 'ascendente' : 'descendente'})...`, 'info');

    try {
        let swapped;
        for (let i = 0; i < n - 1; i++) {
            swapped = false;
            for (let j = 0; j < n - i - 1; j++) {
                if (!sorting) return;

                updateAlgoInfo('Bubble Sort', n);
                updateBubbles([j, j + 1], Array.from({ length: i }, (_, k) => n - 1 - k));
                await sleep(animationSpeed);

                if (compare(values[j], values[j + 1], order)) {
                    [values[j], values[j + 1]] = [values[j + 1], values[j]];
                    swapped = true;
                    operationsCount += 3; // Comparación + intercambio
                    updateBubbles([j, j + 1], Array.from({ length: i }, (_, k) => n - 1 - k));
                    await sleep(animationSpeed);
                }
                operationsCount++; // Comparación
            }
            if (!swapped) break;
        }
        updateBubbles([], Array.from({ length: n }, (_, i) => i));
        updateAlgoInfo('Bubble Sort', n);
        showMessage(`✅ Bubble Sort completado! ${operationsCount.toLocaleString()} operaciones realizadas`, 'success', 4000);
    } finally {
        sorting = false;
        disableButtons(false);
    }
}

async function insertionSort() {
    const n = values.length;
    if (n === 0) {
        updateAlgoInfo('Insertion Sort', n);
        showMessage('❌ No hay valores para ordenar', 'error', 3000);
        return;
    }
    
    animationSpeed = getAnimationSpeed(n);
    operationsCount = 0;
    const order = getSortOrder();
    
    disableButtons(true);
    sorting = true;
    showMessage(`📥 Iniciando Insertion Sort (${order === 'asc' ? 'ascendente' : 'descendente'})...`, 'info');

    try {
        for (let i = 1; i < n; i++) {
            let key = values[i];
            let j = i - 1;
            operationsCount++; // Asignación

            while (j >= 0 && compare(values[j], key, order)) {
                if (!sorting) return;
                values[j + 1] = values[j];
                operationsCount += 2; // Comparación + asignación
                updateAlgoInfo('Insertion Sort', n);
                updateBubbles([j, j + 1, i], [], [j, j + 1]);
                await sleep(animationSpeed);
                j--;
            }

            values[j + 1] = key;
            operationsCount++; // Asignación final
            updateAlgoInfo('Insertion Sort', n);
            updateBubbles([j + 1]);
            await sleep(animationSpeed);
        }
        updateBubbles([], values.map((_, i) => i));
        updateAlgoInfo('Insertion Sort', n);
        showMessage(`✅ Insertion Sort completado! ${operationsCount.toLocaleString()} operaciones realizadas`, 'success', 4000);
    } finally {
        sorting = false;
        disableButtons(false);
    }
}

async function shellSort() {
    const n = values.length;
    if (n === 0) {
        updateAlgoInfo('Shell Sort', n);
        showMessage('❌ No hay valores para ordenar', 'error', 3000);
        return;
    }
    
    animationSpeed = getAnimationSpeed(n);
    operationsCount = 0;
    const order = getSortOrder();
    
    disableButtons(true);
    sorting = true;
    showMessage(`🐚 Iniciando Shell Sort (${order === 'asc' ? 'ascendente' : 'descendente'})...`, 'info');

    try {
        let gaps = [701, 301, 132, 57, 23, 10, 4, 1].filter(gap => gap < n);
        if (gaps.length === 0) gaps = [1];
        
        for (let gap of gaps) {
            for (let i = gap; i < n; i++) {
                if (!sorting) return;
                
                let temp = values[i];
                let j = i;
                operationsCount++; // Asignación
                
                while (j >= gap && compare(values[j - gap], temp, order)) {
                    if (!sorting) return;
                    values[j] = values[j - gap];
                    operationsCount += 2; // Comparación + asignación
                    updateAlgoInfo('Shell Sort', n);
                    updateBubbles([j, j - gap], [], [j, j - gap]);
                    await sleep(animationSpeed);
                    j -= gap;
                }
                
                values[j] = temp;
                operationsCount++; // Asignación final
                updateAlgoInfo('Shell Sort', n);
                updateBubbles([j, i]);
                await sleep(animationSpeed);
            }
        }
        updateBubbles([], values.map((_, i) => i));
        updateAlgoInfo('Shell Sort', n);
        showMessage(`✅ Shell Sort completado! ${operationsCount.toLocaleString()} operaciones realizadas`, 'success', 4000);
    } finally {
        sorting = false;
        disableButtons(false);
    }
}

async function mergeSortMain() {
    const n = values.length;
    if (n === 0) {
        updateAlgoInfo('Merge Sort', n);
        showMessage('❌ No hay valores para ordenar', 'error', 3000);
        return;
    }
    
    animationSpeed = getAnimationSpeed(n);
    operationsCount = 0;
    const order = getSortOrder();
    
    disableButtons(true);
    sorting = true;
    showMessage(`🔄 Iniciando Merge Sort (${order === 'asc' ? 'ascendente' : 'descendente'})...`, 'info');

    try {
        await mergeSort(0, n - 1, order);
        if (sorting) {
            updateBubbles([], values.map((_, i) => i));
            updateAlgoInfo('Merge Sort', n);
            showMessage(`✅ Merge Sort completado! ${operationsCount.toLocaleString()} operaciones realizadas`, 'success', 4000);
        }
    } finally {
        sorting = false;
        disableButtons(false);
    }

    async function mergeSort(start, end, order) {
        if (start >= end) return;

        const mid = Math.floor((start + end) / 2);
        await mergeSort(start, mid, order);
        await mergeSort(mid + 1, end, order);
        await merge(start, mid, end, order);
    }

    async function merge(start, mid, end, order) {
        const left = values.slice(start, mid + 1);
        const right = values.slice(mid + 1, end + 1);
        operationsCount += (left.length + right.length); // Operaciones de slice

        let i = 0, j = 0, k = start;

        while (i < left.length && j < right.length) {
            if (!sorting) return;
            updateAlgoInfo('Merge Sort', n);
            updateBubbles([k], [], [start + i, mid + 1 + j]);
            await sleep(animationSpeed);

            const shouldSwap = order === 'asc' ? left[i] <= right[j] : left[i] >= right[j];
            
            if (shouldSwap) {
                values[k] = left[i];
                i++;
            } else {
                values[k] = right[j];
                j++;
            }
            operationsCount += 2; // Comparación + asignación
            k++;
        }

        while (i < left.length) {
            if (!sorting) return;
            values[k] = left[i];
            operationsCount++; // Asignación
            updateAlgoInfo('Merge Sort', n);
            updateBubbles([k]);
            await sleep(animationSpeed);
            i++;
            k++;
        }

        while (j < right.length) {
            if (!sorting) return;
            values[k] = right[j];
            operationsCount++; // Asignación
            updateAlgoInfo('Merge Sort', n);
            updateBubbles([k]);
            await sleep(animationSpeed);
            j++;
            k++;
        }
    }
}

async function selectionSort() {
    const n = values.length;
    if (n === 0) {
        updateAlgoInfo('Selection Sort', n);
        showMessage('❌ No hay valores para ordenar', 'error', 3000);
        return;
    }
    
    animationSpeed = getAnimationSpeed(n);
    operationsCount = 0;
    const order = getSortOrder();
    
    disableButtons(true);
    sorting = true;
    showMessage(`🎯 Iniciando Selection Sort (${order === 'asc' ? 'ascendente' : 'descendente'})...`, 'info');

    try {
        for (let i = 0; i < n - 1; i++) {
            let extremeIdx = i;

            for (let j = i + 1; j < n; j++) {
                if (!sorting) return;
                updateAlgoInfo('Selection Sort', n);
                updateBubbles([extremeIdx, j, i], [], [extremeIdx, j]);
                await sleep(animationSpeed);

                if (order === 'asc' ? values[j] < values[extremeIdx] : values[j] > values[extremeIdx]) {
                    extremeIdx = j;
                }
                operationsCount++; // Comparación
            }

            if (extremeIdx !== i) {
                [values[i], values[extremeIdx]] = [values[extremeIdx], values[i]];
                operationsCount += 3; // Comparación + intercambio
                updateAlgoInfo('Selection Sort', n);
                updateBubbles([i, extremeIdx]);
                await sleep(animationSpeed);
            }
        }
        updateBubbles([], values.map((_, i) => i));
        updateAlgoInfo('Selection Sort', n);
        showMessage(`✅ Selection Sort completado! ${operationsCount.toLocaleString()} operaciones realizadas`, 'success', 4000);
    } finally {
        sorting = false;
        disableButtons(false);
    }
}

// Función para exportar datos
function exportData() {
    if (values.length === 0) {
        showMessage('❌ No hay valores para exportar', 'error', 3000);
        return;
    }
    
    exportModal.style.display = 'block';
    exportFileName.value = `ordenamiento_${new Date().toISOString().slice(0, 10)}_${values.length}_elementos`;
    exportFileName.focus();
    exportFileName.select();
}

// Función para guardar el archivo
function saveFile(filename, data) {
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Función para procesar la exportación
function processExport() {
    const filename = exportFileName.value.trim();
    if (!filename) {
        showMessage('❌ Por favor ingresa un nombre para el archivo', 'error', 3000);
        return;
    }
    
    const exportData = {
        version: '1.0',
        exportDate: new Date().toISOString(),
        data: {
            values: values,
            count: values.length,
            minValue: Math.min(...values),
            maxValue: Math.max(...values),
            configuration: {
                algorithm: algoName.textContent || 'No aplicable',
                order: getSortOrder(),
                elements: values.length
            }
        }
    };
    
    const filenameWithExt = `${filename}.json`;
    saveFile(filenameWithExt, JSON.stringify(exportData, null, 2));
    exportModal.style.display = 'none';
    
    // Mostrar confirmación
    showMessage(`💾 Datos exportados exitosamente como: ${filenameWithExt}`, 'success', 5000);
    
    setTimeout(() => {
        if (values.length > 0) {
            updateAlgoInfo('Listo para ordenar', values.length);
        } else {
            algoName.textContent = 'Lista vacía - Agrega valores para ordenar';
        }
    }, 3000);
}

// Función para importar datos
function importData() {
    if (sorting) {
        showMessage('⏳ Espera a que termine el ordenamiento actual', 'warning', 3000);
        return;
    }
    
    importFile.click();
}

// Procesar archivo importado
importFile.addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const importedData = JSON.parse(e.target.result);
            
            // Validar estructura del archivo
            if (!importedData.data || !Array.isArray(importedData.data.values)) {
                throw new Error('Formato de archivo inválido');
            }
            
            const importedValues = importedData.data.values;
            
            // Validar los valores
            if (importedValues.length > 1000) {
                showMessage('❌ El archivo contiene más de 1000 elementos (máximo permitido)', 'error', 4000);
                return;
            }
            
            if (!importedValues.every(val => Number.isInteger(val))) {
                showMessage('❌ El archivo contiene valores no numéricos', 'error', 4000);
                return;
            }
            
            // Aplicar los valores importados
            values = importedValues;
            numInput.value = values.length;
            minInput.value = Math.min(...values);
            maxInput.value = Math.max(...values);
            operationsCount = 0;
            
            render();
            showMessage(`📂 Datos importados exitosamente: ${values.length} elementos cargados`, 'success', 4000);
            
            // Limpiar el input file
            importFile.value = '';
            
            setTimeout(() => {
                if (values.length > 0) {
                    updateAlgoInfo('Listo para ordenar', values.length);
                }
            }, 3000);
            
        } catch (error) {
            showMessage(`❌ Error al importar el archivo: ${error.message}`, 'error', 5000);
            importFile.value = '';
        }
    };
    
    reader.onerror = function() {
        showMessage('❌ Error al leer el archivo', 'error', 4000);
        importFile.value = '';
    };
    
    reader.readAsText(file);
});

// EVENTOS
numInput.addEventListener('change', () => {
    let n = parseInt(numInput.value);
    if (isNaN(n) || n < 0) n = 0;
    if (n > 1000) {
        n = 1000;
        showMessage('⚠️ Máximo 1000 bolas permitidas. Se ajustó automáticamente.', 'warning', 4000);
    }
    numInput.value = n;
    
    if (n === 0) {
        clearAll();
        return;
    }
    
    // Ajustar rango automáticamente si es necesario
    const min = parseInt(minInput.value);
    const max = parseInt(maxInput.value);
    const range = max - min + 1;
    if (range < n) {
        const newMax = min + n - 1;
        showMessage(`⚠️ Rango insuficiente! Se ajustó máximo a ${newMax} para generar ${n} valores únicos`, 'warning', 5000);
        maxInput.value = newMax;
    }
    
    if (!sorting) randomValues(n, min, max);
});

minInput.addEventListener('change', () => {
    let min = parseInt(minInput.value);
    if (isNaN(min) || min < 0) min = 0;
    if (min > 999) min = 999;
    minInput.value = min;
    
    const n = parseInt(numInput.value);
    const max = parseInt(maxInput.value);
    
    if (max <= min) {
        const newMax = min + 1;
        showMessage(`⚠️ El rango máximo debe ser mayor al mínimo. Se ajustó a ${newMax}`, 'warning', 4000);
        maxInput.value = newMax;
    }
    
    const range = max - min + 1;
    if (n > 0 && range < n) {
        const newMax = min + n - 1;
        showMessage(`⚠️ Rango insuficiente! Se ajustó máximo a ${newMax} para generar ${n} valores únicos`, 'warning', 5000);
        maxInput.value = newMax;
    }
    
    if (!sorting && n > 0) randomValues(n, min, max);
});

maxInput.addEventListener('change', () => {
    let max = parseInt(maxInput.value);
    if (isNaN(max) || max < 1) max = 1;
    if (max > 1000) max = 1000;
    maxInput.value = max;
    
    const n = parseInt(numInput.value);
    const min = parseInt(minInput.value);
    
    if (max <= min) {
        const newMin = max - 1;
        if (newMin < 0) {
            showMessage('❌ El rango máximo debe ser al menos 1 mayor que el mínimo', 'error', 4000);
            minInput.value = 0;
            maxInput.value = 1;
        } else {
            showMessage(`⚠️ El rango máximo debe ser mayor al mínimo. Se ajustó mínimo a ${newMin}`, 'warning', 4000);
            minInput.value = newMin;
        }
    }
    
    const range = max - min + 1;
    if (n > 0 && range < n) {
        const newMax = min + n - 1;
        showMessage(`⚠️ Rango insuficiente! Se ajustó máximo a ${newMax} para generar ${n} valores únicos`, 'warning', 5000);
        maxInput.value = newMax;
    }
    
    if (!sorting && n > 0) randomValues(n, min, max);
});

randomBtn.onclick = () => {
    if (sorting) return;
    let n = parseInt(numInput.value);
    let min = parseInt(minInput.value);
    let max = parseInt(maxInput.value);
    
    if (isNaN(n) || n < 0) n = 0;
    if (n > 1000) n = 1000;
    if (isNaN(min) || min < 0) min = 0;
    if (isNaN(max) || max < 1) max = 100;
    
    numInput.value = n;
    minInput.value = min;
    maxInput.value = max;
    
    if (n === 0) {
        clearAll();
    } else {
        randomValues(n, min, max);
    }
};

clearBtn.onclick = () => !sorting && clearAll();
customBtn.onclick = () => !sorting && setCustomValues();
bubbleBtn.onclick = () => !sorting && bubbleSort();
insertionBtn.onclick = () => !sorting && insertionSort();
shellBtn.onclick = () => !sorting && shellSort();
mergeBtn.onclick = () => !sorting && mergeSortMain();
selectionBtn.onclick = () => !sorting && selectionSort();
exportBtn.onclick = () => !sorting && exportData();
importBtn.onclick = () => !sorting && importData();

// Modales
helpBtn.onclick = () => {
    helpModal.style.display = 'block';
};

closeModal.onclick = () => {
    helpModal.style.display = 'none';
};

closeCustom.onclick = () => {
    customModal.style.display = 'none';
    customNumbers.value = '';
};

cancelCustom.onclick = () => {
    customModal.style.display = 'none';
    customNumbers.value = '';
};

confirmCustom.onclick = () => {
    processCustomNumbers();
};

customNumbers.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        processCustomNumbers();
    }
});

closeExport.onclick = () => {
    exportModal.style.display = 'none';
};

cancelExport.onclick = () => {
    exportModal.style.display = 'none';
};

confirmExport.onclick = () => {
    processExport();
};

exportFileName.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        processExport();
    }
});

window.onclick = (event) => {
    if (event.target === helpModal) {
        helpModal.style.display = 'none';
    }
    if (event.target === customModal) {
        customModal.style.display = 'none';
        customNumbers.value = '';
    }
    if (event.target === exportModal) {
        exportModal.style.display = 'none';
    }
};

window.addEventListener('resize', () => {
    if (!sorting) render();
});

window.addEventListener('load', () => {
    setTimeout(() => {
        const n = parseInt(numInput.value);
        if (n > 0) {
            randomValues(n, parseInt(minInput.value), parseInt(maxInput.value));
        } else {
            clearAll();
        }
    }, 100);
});
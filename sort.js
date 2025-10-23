// Referencias a los elementos del DOM
const bubblesDiv = document.getElementById('bubbles');
const numInput = document.getElementById('numValues');
const minInput = document.getElementById('minValue');
const maxInput = document.getElementById('maxValue');
const randomBtn = document.getElementById('randomBtn');
const customBtn = document.getElementById('customBtn');
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

let values = [];
let sorting = false;
let animationSpeed = 50;
let bubbles = [];
let operationsCount = 0;

// Generar valores únicos aleatorios con rango personalizado
function randomValues(n, min = 1, max = 100) {
    // Verificar que el rango sea válido
    if (max - min + 1 < n) {
        alert(`Error: El rango (${min}-${max}) debe ser al menos igual a la cantidad de burbujas (${n}).\nMáximo debe ser al menos ${min + n - 1}`);
        maxInput.value = min + n - 1;
        max = min + n - 1;
    }
    
    const allNumbers = Array.from({ length: max - min + 1 }, (_, i) => i + min);
    
    // Mezclar usando Fisher-Yates
    for (let i = allNumbers.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [allNumbers[i], allNumbers[j]] = [allNumbers[j], allNumbers[i]];
    }
    
    values = allNumbers.slice(0, n);
    operationsCount = 0;
    render();
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
        alert('Por favor ingresa algunos números');
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
        
        if (numberArray.length < 5) {
            alert('Debes ingresar al menos 5 números');
            return;
        }
        
        if (numberArray.length > 500) {
            alert('Máximo 500 números permitidos');
            return;
        }
        
        // Actualizar la interfaz
        values = numberArray;
        numInput.value = values.length;
        operationsCount = 0;
        render();
        algoName.textContent = '';
        customModal.style.display = 'none';
        customNumbers.value = '';
        
    } catch (error) {
        alert(`Error: ${error.message}`);
    }
}

// Calcular tamaño proporcional al valor (BURBUJAS MÁS GRANDES)
function calculateBubbleSize(value, n) {
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
    if (n === 0) return;

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
    const buttons = [bubbleBtn, insertionBtn, shellBtn, mergeBtn, selectionBtn, randomBtn, customBtn];
    buttons.forEach(btn => (btn.disabled = disabled));
    numInput.disabled = disabled;
    minInput.disabled = disabled;
    maxInput.disabled = disabled;
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
    const bigOValue = calculateBigO(name, n);
    const operationsText = operationsCount > 0 ? ` | Operaciones: ${operationsCount.toLocaleString()}` : '';
    algoName.textContent = `${name} - O(${getBigONotation(name)}) [n=${n}] ≈ ${bigOValue.toLocaleString()}${operationsText}`;
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

// ALGORITMOS OPTIMIZADOS
async function bubbleSort() {
    const n = values.length;
    animationSpeed = getAnimationSpeed(n);
    operationsCount = 0;
    
    disableButtons(true);
    sorting = true;

    try {
        let swapped;
        for (let i = 0; i < n - 1; i++) {
            swapped = false;
            for (let j = 0; j < n - i - 1; j++) {
                if (!sorting) return;

                updateAlgoInfo('Bubble Sort', n);
                updateBubbles([j, j + 1], Array.from({ length: i }, (_, k) => n - 1 - k));
                await sleep(animationSpeed);

                if (values[j] > values[j + 1]) {
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
    } finally {
        sorting = false;
        disableButtons(false);
    }
}

async function insertionSort() {
    const n = values.length;
    animationSpeed = getAnimationSpeed(n);
    operationsCount = 0;
    
    disableButtons(true);
    sorting = true;

    try {
        for (let i = 1; i < n; i++) {
            let key = values[i];
            let j = i - 1;
            operationsCount++; // Asignación

            while (j >= 0 && values[j] > key) {
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
    } finally {
        sorting = false;
        disableButtons(false);
    }
}

async function shellSort() {
    const n = values.length;
    animationSpeed = getAnimationSpeed(n);
    operationsCount = 0;
    
    disableButtons(true);
    sorting = true;

    try {
        let gaps = [701, 301, 132, 57, 23, 10, 4, 1].filter(gap => gap < n);
        if (gaps.length === 0) gaps = [1];
        
        for (let gap of gaps) {
            for (let i = gap; i < n; i++) {
                if (!sorting) return;
                
                let temp = values[i];
                let j = i;
                operationsCount++; // Asignación
                
                while (j >= gap && values[j - gap] > temp) {
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
    } finally {
        sorting = false;
        disableButtons(false);
    }
}

async function mergeSortMain() {
    const n = values.length;
    animationSpeed = getAnimationSpeed(n);
    operationsCount = 0;
    
    disableButtons(true);
    sorting = true;

    try {
        await mergeSort(0, n - 1);
        if (sorting) {
            updateBubbles([], values.map((_, i) => i));
            updateAlgoInfo('Merge Sort', n);
        }
    } finally {
        sorting = false;
        disableButtons(false);
    }

    async function mergeSort(start, end) {
        if (start >= end) return;

        const mid = Math.floor((start + end) / 2);
        await mergeSort(start, mid);
        await mergeSort(mid + 1, end);
        await merge(start, mid, end);
    }

    async function merge(start, mid, end) {
        const left = values.slice(start, mid + 1);
        const right = values.slice(mid + 1, end + 1);
        operationsCount += (left.length + right.length); // Operaciones de slice

        let i = 0, j = 0, k = start;

        while (i < left.length && j < right.length) {
            if (!sorting) return;
            updateAlgoInfo('Merge Sort', n);
            updateBubbles([k], [], [start + i, mid + 1 + j]);
            await sleep(animationSpeed);

            if (left[i] <= right[j]) {
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
    animationSpeed = getAnimationSpeed(n);
    operationsCount = 0;
    
    disableButtons(true);
    sorting = true;

    try {
        for (let i = 0; i < n - 1; i++) {
            let minIdx = i;

            for (let j = i + 1; j < n; j++) {
                if (!sorting) return;
                updateAlgoInfo('Selection Sort', n);
                updateBubbles([minIdx, j, i], [], [minIdx, j]);
                await sleep(animationSpeed);

                if (values[j] < values[minIdx]) {
                    minIdx = j;
                }
                operationsCount++; // Comparación
            }

            if (minIdx !== i) {
                [values[i], values[minIdx]] = [values[minIdx], values[i]];
                operationsCount += 3; // Comparación + intercambio
                updateAlgoInfo('Selection Sort', n);
                updateBubbles([i, minIdx]);
                await sleep(animationSpeed);
            }
        }
        updateBubbles([], values.map((_, i) => i));
        updateAlgoInfo('Selection Sort', n);
    } finally {
        sorting = false;
        disableButtons(false);
    }
}

// EVENTOS
numInput.addEventListener('change', () => {
    let n = parseInt(numInput.value);
    if (isNaN(n) || n < 5) n = 5;
    if (n > 500) n = 500;
    numInput.value = n;
    
    // Ajustar máximo automáticamente si es necesario
    const min = parseInt(minInput.value);
    const max = parseInt(maxInput.value);
    if (max - min + 1 < n) {
        maxInput.value = min + n - 1;
    }
    
    if (!sorting) randomValues(n, min, max);
});

minInput.addEventListener('change', () => {
    let min = parseInt(minInput.value);
    if (isNaN(min) || min < 1) min = 1;
    if (min > 999) min = 999;
    minInput.value = min;
    
    const n = parseInt(numInput.value);
    const max = parseInt(maxInput.value);
    
    if (max <= min) {
        maxInput.value = min + 1;
    }
    
    if (max - min + 1 < n) {
        maxInput.value = min + n - 1;
    }
    
    if (!sorting) randomValues(n, min, max);
});

maxInput.addEventListener('change', () => {
    let max = parseInt(maxInput.value);
    if (isNaN(max) || max < 10) max = 10;
    if (max > 1000) max = 1000;
    maxInput.value = max;
    
    const n = parseInt(numInput.value);
    const min = parseInt(minInput.value);
    
    if (max <= min) {
        minInput.value = max - 1;
        if (minInput.value < 1) minInput.value = 1;
    }
    
    if (max - min + 1 < n) {
        alert(`El rango debe ser al menos igual a la cantidad de burbujas (${n}). Máximo ajustado a ${min + n - 1}`);
        maxInput.value = min + n - 1;
    }
    
    if (!sorting) randomValues(n, min, max);
});

randomBtn.onclick = () => {
    if (sorting) return;
    let n = parseInt(numInput.value);
    let min = parseInt(minInput.value);
    let max = parseInt(maxInput.value);
    
    if (isNaN(n) || n < 5) n = 5;
    if (n > 500) n = 500;
    if (isNaN(min) || min < 1) min = 1;
    if (isNaN(max) || max < 10) max = 100;
    
    numInput.value = n;
    minInput.value = min;
    maxInput.value = max;
    
    randomValues(n, min, max);
};

customBtn.onclick = () => !sorting && setCustomValues();
bubbleBtn.onclick = () => !sorting && bubbleSort();
insertionBtn.onclick = () => !sorting && insertionSort();
shellBtn.onclick = () => !sorting && shellSort();
mergeBtn.onclick = () => !sorting && mergeSortMain();
selectionBtn.onclick = () => !sorting && selectionSort();

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

window.onclick = (event) => {
    if (event.target === helpModal) {
        helpModal.style.display = 'none';
    }
    if (event.target === customModal) {
        customModal.style.display = 'none';
        customNumbers.value = '';
    }
};

window.addEventListener('resize', () => {
    if (!sorting) render();
});

window.addEventListener('load', () => {
    setTimeout(() => randomValues(parseInt(numInput.value), parseInt(minInput.value), parseInt(maxInput.value)), 100);
});

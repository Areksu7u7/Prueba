const bubblesDiv = document.getElementById('bubbles');
const numInput = document.getElementById('numValues');
const randomBtn = document.getElementById('randomBtn');
const bubbleBtn = document.getElementById('bubbleBtn');
const insertionBtn = document.getElementById('insertionBtn');
const shellBtn = document.getElementById('shellBtn');
const mergeBtn = document.getElementById('mergeBtn');
const selectionBtn = document.getElementById('selectionBtn');
const algoName = document.getElementById('algoName');

let values = [];
let sorting = false;
let animationSpeed = 80;

function randomValues(n) {
    values = Array.from({length: n}, () => Math.floor(Math.random() * 90) + 10);
    render();
    algoName.textContent = '';
}

function calculateOptimalColumns(n, containerWidth) {
    const gap = 20;
    
    let maxColumns;
    if (n <= 10) {
        maxColumns = 3;
    } else if (n <= 20) {
        maxColumns = 4;
    } else if (n <= 40) {
        maxColumns = 6;
    } else if (n <= 70) {
        maxColumns = 8;
    } else {
        maxColumns = 10;
    }
    
    const minBubbleSize = 80;
    const possibleColumns = Math.floor(containerWidth / (minBubbleSize + gap));
    
    return Math.min(maxColumns, Math.max(2, possibleColumns));
}

function calculateBubbleSize(value, n) {
    const minVal = Math.min(...values);
    const maxVal = Math.max(...values);
    const range = maxVal - minVal || 1;
    const normalized = (value - minVal) / range;
    
    if (n <= 10) {
        const minSize = 120;
        const maxSize = 250;
        const exponential = Math.pow(normalized, 0.4);
        return Math.round(minSize + (exponential * (maxSize - minSize)));
        
    } else if (n <= 20) {
        const minSize = 100;
        const maxSize = 200;
        const exponential = Math.pow(normalized, 0.5);
        return Math.round(minSize + (exponential * (maxSize - minSize)));
        
    } else if (n <= 40) {
        const minSize = 80;
        const maxSize = 160;
        const exponential = Math.pow(normalized, 0.6);
        return Math.round(minSize + (exponential * (maxSize - minSize)));
        
    } else if (n <= 70) {
        const minSize = 70;
        const maxSize = 130;
        return Math.round(minSize + (normalized * (maxSize - minSize)));
        
    } else {
        const minSize = 65;
        const maxSize = 110;
        return Math.round(minSize + (normalized * (maxSize - minSize)));
    }
}

function calculateFontSize(bubbleSize) {
    const baseSize = Math.max(16, Math.floor(bubbleSize * 0.25));
    return baseSize;
}

function render(active = [], sorted = [], comparing = []) {
    bubblesDiv.innerHTML = '';
    const n = values.length;
    
    if (n === 0) return;
    
    // Usar el ancho completo del contenedor
    const containerWidth = bubblesDiv.clientWidth || window.innerWidth - 60;
    const columns = calculateOptimalColumns(n, containerWidth);
    const gap = 20;
    
    // Calcular número de filas necesarias
    const rows = Math.ceil(n / columns);
    
    // Configurar el contenedor principal para SCROLL
    bubblesDiv.style.overflowY = 'auto';
    bubblesDiv.style.overflowX = 'hidden';
    bubblesDiv.style.height = '70vh'; // Altura fija para forzar scroll
    bubblesDiv.style.maxHeight = '70vh';
    bubblesDiv.style.padding = '20px';
    bubblesDiv.style.width = '100%';
    bubblesDiv.style.boxSizing = 'border-box';
    
    // Calcular el tamaño máximo de globo
    const maxBubbleSize = Math.max(...values.map(val => calculateBubbleSize(val, n)));
    
    // Crear contenedor de grid con altura suficiente para SCROLL
    const gridContainer = document.createElement('div');
    gridContainer.style.display = 'grid';
    gridContainer.style.gridTemplateColumns = `repeat(${columns}, 1fr)`;
    gridContainer.style.gap = `${gap}px`;
    gridContainer.style.width = '100%';
    gridContainer.style.justifyItems = 'center';
    gridContainer.style.alignItems = 'center';
    
    // Altura mínima del grid container para que haya scroll
    const rowHeight = maxBubbleSize + gap;
    const totalGridHeight = rows * rowHeight + 100; // Altura total del contenido
    gridContainer.style.minHeight = `${totalGridHeight}px`;
    gridContainer.style.padding = '10px';
    
    console.log(`Renderizando ${n} elementos en ${columns} columnas y ${rows} filas. Altura total: ${totalGridHeight}px`);
    
    // Crear TODOS los elementos
    for (let i = 0; i < n; i++) {
        const value = values[i];
        const bubbleSize = calculateBubbleSize(value, n);
        const fontSize = calculateFontSize(bubbleSize);
        
        // Contenedor de celda
        const cell = document.createElement('div');
        cell.style.display = 'flex';
        cell.style.justifyContent = 'center';
        cell.style.alignItems = 'center';
        cell.style.width = '100%';
        cell.style.height = `${rowHeight}px`; // Altura fija para cada fila
        cell.style.minHeight = `${rowHeight}px`;
        
        // GLOBO PERFECTAMENTE REDONDO
        const bubble = document.createElement('div');
        bubble.className = 'bubble';
        
        // Dimensiones fijas e iguales
        bubble.style.width = `${bubbleSize}px`;
        bubble.style.height = `${bubbleSize}px`;
        bubble.style.minWidth = `${bubbleSize}px`;
        bubble.style.minHeight = `${bubbleSize}px`;
        bubble.style.borderRadius = '50%';
        bubble.style.flexShrink = '0';
        
        // Layout interno
        bubble.style.display = 'flex';
        bubble.style.alignItems = 'center';
        bubble.style.justifyContent = 'center';
        bubble.style.position = 'relative';
        
        // Aplicar estados
        if (active.includes(i)) bubble.classList.add('active');
        if (sorted.includes(i)) bubble.classList.add('sorted');
        if (comparing.includes(i)) bubble.classList.add('comparing');
        
        // Número centrado
        const span = document.createElement('span');
        span.textContent = value;
        span.style.fontSize = `${fontSize}px`;
        span.style.fontWeight = 'bold';
        span.style.color = '#000';
        span.style.textShadow = '1px 1px 3px rgba(255,255,255,0.9)';
        span.style.display = 'flex';
        span.style.alignItems = 'center';
        span.style.justifyContent = 'center';
        span.style.width = '100%';
        span.style.height = '100%';
        span.style.position = 'absolute';
        span.style.top = '0';
        span.style.left = '0';
        span.style.pointerEvents = 'none';
        
        bubble.appendChild(span);
        cell.appendChild(bubble);
        gridContainer.appendChild(cell);
    }
    
    bubblesDiv.appendChild(gridContainer);
    
    // Forzar update del scroll
    setTimeout(() => {
        bubblesDiv.scrollTop = 0;
        // Verificar que todos los elementos se renderizaron
        const renderedBubbles = bubblesDiv.querySelectorAll('.bubble');
        console.log(`Elementos renderizados: ${renderedBubbles.length} de ${n}`);
        
        if (renderedBubbles.length !== n) {
            console.warn('No se renderizaron todos los elementos!');
        }
    }, 100);
}

function disableButtons(disabled) {
    const buttons = [bubbleBtn, insertionBtn, shellBtn, mergeBtn, selectionBtn, randomBtn];
    buttons.forEach(btn => {
        btn.disabled = disabled;
    });
    numInput.disabled = disabled;
}

// Event listeners
numInput.addEventListener('change', () => {
    let n = parseInt(numInput.value);
    if (isNaN(n) || n < 5) n = 5;
    if (n > 150) n = 150;
    numInput.value = n;
    if (!sorting) randomValues(n);
});

randomBtn.onclick = () => {
    if (sorting) return;
    let n = parseInt(numInput.value);
    if (isNaN(n) || n < 5) n = 5;
    if (n > 150) n = 150;
    numInput.value = n;
    randomValues(n);
};

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Algoritmos de ordenamiento
async function bubbleSort() {
    algoName.textContent = 'Bubble Sort - O(n²)';
    const n = values.length;
    animationSpeed = Math.max(60, 3000 / n);
    
    for (let i = 0; i < n - 1; i++) {
        for (let j = 0; j < n - i - 1; j++) {
            if (!sorting) return;
            
            render([j, j + 1], Array.from({length: i}, (_, k) => n - 1 - k));
            await sleep(animationSpeed);
            
            if (values[j] > values[j + 1]) {
                [values[j], values[j + 1]] = [values[j + 1], values[j]];
                render([j, j + 1], Array.from({length: i}, (_, k) => n - 1 - k));
                await sleep(animationSpeed);
            }
        }
    }
    render([], Array.from({length: n}, (_, i) => i));
}

async function insertionSort() {
    algoName.textContent = 'Insertion Sort - O(n²)';
    animationSpeed = Math.max(70, 2500 / values.length);
    
    for (let i = 1; i < values.length; i++) {
        let key = values[i];
        let j = i - 1;
        
        while (j >= 0 && values[j] > key) {
            if (!sorting) return;
            
            values[j + 1] = values[j];
            render([j, j + 1, i], [], [j, j + 1]);
            await sleep(animationSpeed);
            j--;
        }
        
        values[j + 1] = key;
        render([j + 1]);
        await sleep(animationSpeed);
    }
    render([], values.map((_, i) => i));
}

async function shellSort() {
    algoName.textContent = 'Shell Sort - O(n log n)';
    animationSpeed = Math.max(80, 2000 / values.length);
    let n = values.length;
    let gap = Math.floor(n / 2);
    
    while (gap > 0) {
        for (let i = gap; i < n; i++) {
            if (!sorting) return;
            
            let temp = values[i];
            let j = i;
            
            while (j >= gap && values[j - gap] > temp) {
                if (!sorting) return;
                
                values[j] = values[j - gap];
                render([j, j - gap, i], [], [j, j - gap]);
                await sleep(animationSpeed);
                j -= gap;
            }
            
            values[j] = temp;
            render([j, i]);
            await sleep(animationSpeed);
        }
        gap = Math.floor(gap / 2);
    }
    render([], values.map((_, i) => i));
}

async function mergeSortMain() {
    algoName.textContent = 'Merge Sort - O(n log n)';
    animationSpeed = Math.max(90, 1800 / values.length);
    
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
        
        let i = 0, j = 0, k = start;
        
        while (i < left.length && j < right.length) {
            if (!sorting) return;
            
            render([start + i, mid + 1 + j, k], [], [start + i, mid + 1 + j]);
            await sleep(animationSpeed);
            
            if (left[i] <= right[j]) {
                values[k] = left[i];
                i++;
            } else {
                values[k] = right[j];
                j++;
            }
            k++;
        }
        
        while (i < left.length) {
            if (!sorting) return;
            values[k] = left[i];
            render([start + i, k]);
            await sleep(animationSpeed);
            i++;
            k++;
        }
        
        while (j < right.length) {
            if (!sorting) return;
            values[k] = right[j];
            render([mid + 1 + j, k]);
            await sleep(animationSpeed);
            j++;
            k++;
        }
    }
    
    await mergeSort(0, values.length - 1);
    if (sorting) {
        render([], values.map((_, i) => i));
    }
}

async function selectionSort() {
    algoName.textContent = 'Selection Sort - O(n²)';
    animationSpeed = Math.max(70, 2500 / values.length);
    
    for (let i = 0; i < values.length - 1; i++) {
        let minIdx = i;
        
        for (let j = i + 1; j < values.length; j++) {
            if (!sorting) return;
            
            render([minIdx, j, i], [], [minIdx, j]);
            await sleep(animationSpeed);
            
            if (values[j] < values[minIdx]) {
                minIdx = j;
                render([minIdx, j, i], [], [minIdx, j]);
                await sleep(animationSpeed);
            }
        }
        
        if (minIdx !== i) {
            [values[i], values[minIdx]] = [values[minIdx], values[i]];
            render([i, minIdx]);
            await sleep(animationSpeed);
        }
    }
    render([], values.map((_, i) => i));
}

// Event listeners para los botones de ordenamiento
bubbleBtn.onclick = async () => {
    if (sorting) return;
    sorting = true;
    disableButtons(true);
    await bubbleSort();
    sorting = false;
    disableButtons(false);
};

insertionBtn.onclick = async () => {
    if (sorting) return;
    sorting = true;
    disableButtons(true);
    await insertionSort();
    sorting = false;
    disableButtons(false);
};

shellBtn.onclick = async () => {
    if (sorting) return;
    sorting = true;
    disableButtons(true);
    await shellSort();
    sorting = false;
    disableButtons(false);
};

mergeBtn.onclick = async () => {
    if (sorting) return;
    sorting = true;
    disableButtons(true);
    await mergeSortMain();
    sorting = false;
    disableButtons(false);
};

selectionBtn.onclick = async () => {
    if (sorting) return;
    sorting = true;
    disableButtons(true);
    await selectionSort();
    sorting = false;
    disableButtons(false);
};

// Inicialización y manejo de redimensionamiento
window.addEventListener('resize', () => {
    if (!sorting) {
        render();
    }
});

window.addEventListener('load', () => {
    // Asegurar que el CSS esté cargado antes de renderizar
    setTimeout(() => {
        randomValues(parseInt(numInput.value));
    }, 100);
});

// Inicializar
randomValues(parseInt(numInput.value));
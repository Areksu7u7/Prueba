const bubblesDiv = document.getElementById('bubbles');
const numInput = document.getElementById('numValues');
const randomBtn = document.getElementById('randomBtn');
const bubbleBtn = document.getElementById('bubbleBtn');
const insertionBtn = document.getElementById('insertionBtn');
const shellBtn = document.getElementById('shellBtn');
const mergeBtn = document.getElementById('mergeBtn');
const selectionBtn = document.getElementById('selectionBtn');
const algoName = document.getElementById('algoName');

const MAX = {
    bubble: 150,
    insertion: 150,
    shell: 150,
    merge: 150,
    selection: 150
};

let values = [];
let sorting = false;

function randomValues(n) {
    values = Array.from({length: n}, () => Math.floor(Math.random() * 90) + 10);
    render();
    algoName.textContent = '';
}

function getBubbleSize(n) {
    if (n <= 30) return 80;
    if (n <= 60) return 60;
    if (n <= 100) return 40;
    return 28;
}

function render(active = [], sorted = []) {
    bubblesDiv.innerHTML = '';
    const n = values.length;

    // Calcula el área disponible
    const containerWidth = window.innerWidth - 32; // padding/margen
    const containerHeight = window.innerHeight * 0.6;

    // Calcula el número óptimo de columnas y filas
    let columns = Math.ceil(Math.sqrt(n * containerWidth / containerHeight));
    columns = Math.max(1, columns);
    let rows = Math.ceil(n / columns);

    const gap = 8;
    const sizeW = (containerWidth - (columns - 1) * gap) / columns;
    const sizeH = (containerHeight - (rows - 1) * gap) / rows;

    // Si hay pocos valores, tamaño proporcional al valor
    if (n <= 20) {
        // Menos columnas para que estén más juntas
        let columns = Math.max(4, Math.ceil(n / 2));
        let gap = 4; // Menor separación
        const minSize = 36; // tamaño mínimo visible
        const maxSize = 160; // tamaño máximo para el valor más grande
        const minVal = Math.min(...values);
        const maxVal = Math.max(...values);

        bubblesDiv.style.display = "grid";
        bubblesDiv.style.gridTemplateColumns = `repeat(${columns}, 1fr)`;
        bubblesDiv.style.gap = gap + "px";

        values.forEach((v, i) => {
            // Mucha diferencia de tamaño
            let size = minSize + ((v - minVal) / (maxVal - minVal || 1)) * (maxSize - minSize);
            size = Math.max(size, minSize);
            let fontSize = Math.max(16, size * 0.38);

            const div = document.createElement('div');
            div.className = 'bubble';
            div.style.width = size + 'px';
            div.style.height = size + 'px';
            div.style.borderRadius = '50%';
            if (active.includes(i)) div.classList.add('active');
            if (sorted.includes(i)) div.classList.add('sorted');
            const span = document.createElement('span');
            span.textContent = v;
            span.style.fontSize = fontSize + 'px';
            div.appendChild(span);
            bubblesDiv.appendChild(div);
        });
    } else if (n <= 60) {
        // Tamaño mínimo y máximo para globos bien diferenciados y redondos
        const minSize = 38; // tamaño mínimo visible
        const maxSize = 110; // tamaño máximo para el valor más grande
        const minVal = Math.min(...values);
        const maxVal = Math.max(...values);

        bubblesDiv.style.display = "grid";
        bubblesDiv.style.gridTemplateColumns = `repeat(${columns}, 1fr)`;
        bubblesDiv.style.gap = gap + "px";

        values.forEach((v, i) => {
            // Escala el tamaño según el valor, bien diferenciado
            let size = minSize + ((v - minVal) / (maxVal - minVal || 1)) * (maxSize - minSize);
            size = Math.max(size, minSize);
            let fontSize = Math.max(14, size * 0.38);

            const div = document.createElement('div');
            div.className = 'bubble';
            div.style.width = size + 'px';
            div.style.height = size + 'px';
            div.style.borderRadius = '50%'; // ¡Siempre redondo!
            if (active.includes(i)) div.classList.add('active');
            if (sorted.includes(i)) div.classList.add('sorted');
            const span = document.createElement('span');
            span.textContent = v;
            span.style.fontSize = fontSize + 'px';
            div.appendChild(span);
            bubblesDiv.appendChild(div);
        });
    } else {
        // Si hay muchos valores, todos del mismo tamaño
        const size = Math.max(32, Math.min(sizeW, sizeH, 48));
        let fontSize = Math.max(10, size * 0.38);

        bubblesDiv.style.display = "grid";
        bubblesDiv.style.gridTemplateColumns = `repeat(${columns}, 1fr)`;
        bubblesDiv.style.gap = gap + "px";

        values.forEach((v, i) => {
            const div = document.createElement('div');
            div.className = 'bubble';
            div.style.width = size + 'px';
            div.style.height = size + 'px';
            if (active.includes(i)) div.classList.add('active');
            if (sorted.includes(i)) div.classList.add('sorted');
            const span = document.createElement('span');
            span.textContent = v;
            span.style.fontSize = fontSize + 'px';
            div.appendChild(span);
            bubblesDiv.appendChild(div);
        });
    }
}

function disableButtons(disabled) {
    bubbleBtn.disabled = disabled;
    insertionBtn.disabled = disabled;
    shellBtn.disabled = disabled;
    mergeBtn.disabled = disabled;
    selectionBtn.disabled = disabled;
    randomBtn.disabled = disabled;
    numInput.disabled = disabled;
}

numInput.addEventListener('change', () => {
    let n = parseInt(numInput.value);
    if (isNaN(n) || n < 5) n = 5;
    if (n > 150) n = 150;
    numInput.value = n;
    randomValues(n);
});

randomBtn.onclick = () => {
    let n = parseInt(numInput.value);
    if (isNaN(n) || n < 5) n = 5;
    if (n > 150) n = 150;
    numInput.value = n;
    randomValues(n);
};

function sleep(ms) {
    return new Promise(res => setTimeout(res, ms));
}

async function bubbleSort() {
    algoName.textContent = 'Bubble Sort';
    for (let i = 0; i < values.length - 1; i++) {
        for (let j = 0; j < values.length - i - 1; j++) {
            render([j, j+1], Array.from({length: i}, (_, k) => values.length - 1 - k));
            await sleep(60);
            if (values[j] > values[j+1]) {
                [values[j], values[j+1]] = [values[j+1], values[j]];
                render([j, j+1], Array.from({length: i}, (_, k) => values.length - 1 - k));
                await sleep(60);
            }
        }
    }
    render([], values.map((_, i) => i));
}

async function insertionSort() {
    algoName.textContent = 'Insertion Sort';
    for (let i = 1; i < values.length; i++) {
        let key = values[i];
        let j = i - 1;
        while (j >= 0 && values[j] > key) {
            values[j + 1] = values[j];
            render([j, j+1]);
            await sleep(60);
            j--;
        }
        values[j + 1] = key;
        render([j+1]);
        await sleep(60);
    }
    render([], values.map((_, i) => i));
}

async function shellSort() {
    algoName.textContent = 'Shell Sort';
    let gap = Math.floor(values.length / 2);
    while (gap > 0) {
        for (let i = gap; i < values.length; i++) {
            let temp = values[i];
            let j = i;
            while (j >= gap && values[j - gap] > temp) {
                values[j] = values[j - gap];
                render([j, j-gap]);
                await sleep(60);
                j -= gap;
            }
            values[j] = temp;
            render([j]);
            await sleep(60);
        }
        gap = Math.floor(gap / 2);
    }
    render([], values.map((_, i) => i));
}

async function mergeSortMain() {
    algoName.textContent = 'Merge Sort';
    async function mergeSort(arr, l, r) {
        if (l >= r) return;
        let m = Math.floor((l + r) / 2);
        await mergeSort(arr, l, m);
        await mergeSort(arr, m + 1, r);
        await merge(arr, l, m, r);
    }
    async function merge(arr, l, m, r) {
        let left = arr.slice(l, m + 1);
        let right = arr.slice(m + 1, r + 1);
        let i = 0, j = 0, k = l;
        while (i < left.length && j < right.length) {
            render([k]);
            await sleep(60);
            if (left[i] <= right[j]) {
                arr[k++] = left[i++];
            } else {
                arr[k++] = right[j++];
            }
        }
        while (i < left.length) {
            render([k]);
            await sleep(60);
            arr[k++] = left[i++];
        }
        while (j < right.length) {
            render([k]);
            await sleep(60);
            arr[k++] = right[j++];
        }
    }
    await mergeSort(values, 0, values.length - 1);
    render([], values.map((_, i) => i));
}

async function selectionSort() {
    algoName.textContent = 'Selection Sort';
    for (let i = 0; i < values.length - 1; i++) {
        let minIdx = i;
        for (let j = i + 1; j < values.length; j++) {
            render([minIdx, j]);
            await sleep(60);
            if (values[j] < values[minIdx]) {
                minIdx = j;
                render([minIdx, j]);
                await sleep(60);
            }
        }
        if (minIdx !== i) {
            [values[i], values[minIdx]] = [values[minIdx], values[i]];
            render([i, minIdx]);
            await sleep(60);
        }
    }
    render([], values.map((_, i) => i));
}

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

// Inicializar
randomValues(parseInt(numInput.value));
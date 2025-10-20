// Referencias a los elementos del DOM
        const bubblesDiv = document.getElementById('bubbles');
        const numInput = document.getElementById('numValues');
        const randomBtn = document.getElementById('randomBtn');
        const bubbleBtn = document.getElementById('bubbleBtn');
        const insertionBtn = document.getElementById('insertionBtn');
        const shellBtn = document.getElementById('shellBtn');
        const mergeBtn = document.getElementById('mergeBtn');
        const selectionBtn = document.getElementById('selectionBtn');
        const algoName = document.getElementById('algoName');
        const helpBtn = document.getElementById('helpBtn');
        const helpModal = document.getElementById('helpModal');
        const closeModal = document.querySelector('.close');

        let values = [];
        let sorting = false;
        let animationSpeed = 50;
        let bubbles = [];

        // Generar valores únicos aleatorios (SIN REPETICIONES)
        function randomValues(n) {
            const maxValue = Math.max(100, n * 2);
            const allNumbers = Array.from({ length: maxValue }, (_, i) => i + 1);
            
            // Mezclar usando Fisher-Yates
            for (let i = allNumbers.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [allNumbers[i], allNumbers[j]] = [allNumbers[j], allNumbers[i]];
            }
            
            values = allNumbers.slice(0, n);
            render();
            algoName.textContent = '';
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
            const buttons = [bubbleBtn, insertionBtn, shellBtn, mergeBtn, selectionBtn, randomBtn];
            buttons.forEach(btn => (btn.disabled = disabled));
            numInput.disabled = disabled;
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

        // ALGORITMOS OPTIMIZADOS
        async function bubbleSort() {
            algoName.textContent = 'Bubble Sort - O(n²)';
            const n = values.length;
            animationSpeed = getAnimationSpeed(n);
            
            disableButtons(true);
            sorting = true;

            try {
                let swapped;
                for (let i = 0; i < n - 1; i++) {
                    swapped = false;
                    for (let j = 0; j < n - i - 1; j++) {
                        if (!sorting) return;

                        updateBubbles([j, j + 1], Array.from({ length: i }, (_, k) => n - 1 - k));
                        await sleep(animationSpeed);

                        if (values[j] > values[j + 1]) {
                            [values[j], values[j + 1]] = [values[j + 1], values[j]];
                            swapped = true;
                            updateBubbles([j, j + 1], Array.from({ length: i }, (_, k) => n - 1 - k));
                            await sleep(animationSpeed);
                        }
                    }
                    if (!swapped) break; // Optimización: si no hubo intercambios, ya está ordenado
                }
                updateBubbles([], Array.from({ length: n }, (_, i) => i));
            } finally {
                sorting = false;
                disableButtons(false);
            }
        }

        async function insertionSort() {
            algoName.textContent = 'Insertion Sort - O(n²)';
            const n = values.length;
            animationSpeed = getAnimationSpeed(n);
            
            disableButtons(true);
            sorting = true;

            try {
                for (let i = 1; i < n; i++) {
                    let key = values[i];
                    let j = i - 1;

                    while (j >= 0 && values[j] > key) {
                        if (!sorting) return;
                        values[j + 1] = values[j];
                        updateBubbles([j, j + 1, i], [], [j, j + 1]);
                        await sleep(animationSpeed);
                        j--;
                    }

                    values[j + 1] = key;
                    updateBubbles([j + 1]);
                    await sleep(animationSpeed);
                }
                updateBubbles([], values.map((_, i) => i));
            } finally {
                sorting = false;
                disableButtons(false);
            }
        }

        async function shellSort() {
            const n = values.length;
            algoName.textContent = 'Shell Sort - O(n log n)';
            animationSpeed = getAnimationSpeed(n);
            
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
                        
                        while (j >= gap && values[j - gap] > temp) {
                            if (!sorting) return;
                            values[j] = values[j - gap];
                            updateBubbles([j, j - gap], [], [j, j - gap]);
                            await sleep(animationSpeed);
                            j -= gap;
                        }
                        
                        values[j] = temp;
                        updateBubbles([j, i]);
                        await sleep(animationSpeed);
                    }
                }
                updateBubbles([], values.map((_, i) => i));
            } finally {
                sorting = false;
                disableButtons(false);
            }
        }

        async function mergeSortMain() {
            algoName.textContent = 'Merge Sort - O(n log n)';
            const n = values.length;
            animationSpeed = getAnimationSpeed(n);
            
            disableButtons(true);
            sorting = true;

            try {
                await mergeSort(0, n - 1);
                if (sorting) updateBubbles([], values.map((_, i) => i));
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

                let i = 0, j = 0, k = start;

                while (i < left.length && j < right.length) {
                    if (!sorting) return;
                    updateBubbles([k], [], [start + i, mid + 1 + j]);
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
                    updateBubbles([k]);
                    await sleep(animationSpeed);
                    i++;
                    k++;
                }

                while (j < right.length) {
                    if (!sorting) return;
                    values[k] = right[j];
                    updateBubbles([k]);
                    await sleep(animationSpeed);
                    j++;
                    k++;
                }
            }
        }

        async function selectionSort() {
            algoName.textContent = 'Selection Sort - O(n²)';
            const n = values.length;
            animationSpeed = getAnimationSpeed(n);
            
            disableButtons(true);
            sorting = true;

            try {
                for (let i = 0; i < n - 1; i++) {
                    let minIdx = i;

                    for (let j = i + 1; j < n; j++) {
                        if (!sorting) return;
                        updateBubbles([minIdx, j, i], [], [minIdx, j]);
                        await sleep(animationSpeed);

                        if (values[j] < values[minIdx]) {
                            minIdx = j;
                        }
                    }

                    if (minIdx !== i) {
                        [values[i], values[minIdx]] = [values[minIdx], values[i]];
                        updateBubbles([i, minIdx]);
                        await sleep(animationSpeed);
                    }
                }
                updateBubbles([], values.map((_, i) => i));
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
            if (!sorting) randomValues(n);
        });

        randomBtn.onclick = () => {
            if (sorting) return;
            let n = parseInt(numInput.value);
            if (isNaN(n) || n < 5) n = 5;
            if (n > 500) n = 500;
            numInput.value = n;
            randomValues(n);
        };

        bubbleBtn.onclick = () => !sorting && bubbleSort();
        insertionBtn.onclick = () => !sorting && insertionSort();
        shellBtn.onclick = () => !sorting && shellSort();
        mergeBtn.onclick = () => !sorting && mergeSortMain();
        selectionBtn.onclick = () => !sorting && selectionSort();

        // Modal de ayuda
        helpBtn.onclick = () => {
            helpModal.style.display = 'block';
        };

        closeModal.onclick = () => {
            helpModal.style.display = 'none';
        };

        window.onclick = (event) => {
            if (event.target === helpModal) {
                helpModal.style.display = 'none';
            }
        };

        window.addEventListener('resize', () => {
            if (!sorting) render();
        });

        window.addEventListener('load', () => {
            setTimeout(() => randomValues(parseInt(numInput.value)), 100);
        });
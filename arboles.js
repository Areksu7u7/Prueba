// CLASE TREE NODE
class TreeNode {
    constructor(value) {
        this.value = value;
        this.left = null;
        this.right = null;
        this.x = 0;
        this.y = 0;
        this.level = 0;
        this.traversalState = 'normal'; // 'normal', 'active', 'visited'
        this.traversalOrder = null;
    }
}

// CLASE TREE VISUALIZER
class TreeVisualizer {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.root = null;
        this.nodeRadius = 30;
        this.levelHeight = 100;
        this.treeType = "Ninguno";
        this.nodePositions = new Map();
        this.animationNodes = [];
        this.animationIndex = 0;
        this.animationInterval = null;
        this.animationSpeed = 800;
        this.isAnimating = false;
        this.currentTraversalType = null;
        this.activeConnections = new Set();
        this.visitedConnections = new Set();
        
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
    }

    resizeCanvas() {
        this.canvas.width = this.canvas.offsetWidth;
        this.canvas.height = this.canvas.offsetHeight;
        this.drawTree();
    }

    // MÉTODO PARA CREAR BST DESDE ARRAY
    buildBSTFromArray(array, isNumbers = true) {
        if (!array || array.length === 0) return null;

        const rootVal = array[0];
        const rootNode = new TreeNode(rootVal);

        for (let i = 1; i < array.length; i++) {
            const val = array[i];
            const newNode = new TreeNode(val);
            this._insertIntoRoot(rootNode, newNode);
        }

        return rootNode;
    }

    _insertIntoRoot(root, newNode) {
        if (newNode.value < root.value) {
            if (root.left === null) {
                root.left = newNode;
            } else {
                this._insertIntoRoot(root.left, newNode);
            }
        } else {
            if (root.right === null) {
                root.right = newNode;
            } else {
                this._insertIntoRoot(root.right, newNode);
            }
        }
    }

    // MÉTODOS PARA RECONSTRUCCIÓN DESDE RECORRIDOS
    buildFromPreorderInorder(preorder, inorder) {
        if (preorder.length === 0 || inorder.length === 0) return null;
        if (preorder.length !== inorder.length) {
            throw new Error("Los recorridos deben tener la misma longitud");
        }

        const rootVal = preorder[0];
        const root = new TreeNode(rootVal);
        const rootIndex = inorder.indexOf(rootVal);

        if (rootIndex === -1) {
            throw new Error(`Elemento ${rootVal} no encontrado en inorden`);
        }

        const leftInorder = inorder.slice(0, rootIndex);
        const rightInorder = inorder.slice(rootIndex + 1);
        const leftPreorder = preorder.slice(1, 1 + leftInorder.length);
        const rightPreorder = preorder.slice(1 + leftInorder.length);

        root.left = this.buildFromPreorderInorder(leftPreorder, leftInorder);
        root.right = this.buildFromPreorderInorder(rightPreorder, rightInorder);

        return root;
    }

    buildFromInorderPostorder(inorder, postorder) {
        if (inorder.length === 0 || postorder.length === 0) return null;
        if (inorder.length !== postorder.length) {
            throw new Error("Los recorridos deben tener la misma longitud");
        }

        const rootVal = postorder[postorder.length - 1];
        const root = new TreeNode(rootVal);
        const rootIndex = inorder.indexOf(rootVal);

        if (rootIndex === -1) {
            throw new Error(`Elemento ${rootVal} no encontrado en inorden`);
        }

        const leftInorder = inorder.slice(0, rootIndex);
        const rightInorder = inorder.slice(rootIndex + 1);
        const leftPostorder = postorder.slice(0, leftInorder.length);
        const rightPostorder = postorder.slice(leftInorder.length, postorder.length - 1);

        root.left = this.buildFromInorderPostorder(leftInorder, leftPostorder);
        root.right = this.buildFromInorderPostorder(rightInorder, rightPostorder);

        return root;
    }

    // NUEVO: Método para reconstrucción desde Preorden + Postorden
    buildFromPreorderPostorder(preorder, postorder) {
        if (preorder.length === 0 || postorder.length === 0) return null;
        if (preorder.length !== postorder.length) {
            throw new Error("Los recorridos deben tener la misma longitud");
        }

        return this._buildFromPrePost(preorder, postorder);
    }

    _buildFromPrePost(preorder, postorder) {
        if (preorder.length === 0) return null;
        
        const rootVal = preorder[0];
        const root = new TreeNode(rootVal);
        
        if (preorder.length === 1) return root;
        
        const leftRootVal = preorder[1];
        const leftRootIndexInPost = postorder.indexOf(leftRootVal);
        
        if (leftRootIndexInPost === -1) {
            throw new Error("No se pudo determinar la estructura del árbol");
        }
        
        const leftPreorder = preorder.slice(1, leftRootIndexInPost + 2);
        const leftPostorder = postorder.slice(0, leftRootIndexInPost + 1);
        
        const rightPreorder = preorder.slice(leftRootIndexInPost + 2);
        const rightPostorder = postorder.slice(leftRootIndexInPost + 1, -1);
        
        root.left = this._buildFromPrePost(leftPreorder, leftPostorder);
        root.right = this._buildFromPrePost(rightPreorder, rightPostorder);
        
        return root;
    }

    // NUEVO: Método alternativo más robusto para Preorden+Postorden
    buildFromPreorderPostorderRobust(preorder, postorder) {
        if (preorder.length === 0 || postorder.length === 0) return null;
        if (preorder.length !== postorder.length) {
            throw new Error("Los recorridos deben tener la misma longitud");
        }

        const rootVal = preorder[0];
        const root = new TreeNode(rootVal);
        
        if (preorder.length === 1) return root;
        
        const nextVal = preorder[1];
        const nextValIndexInPost = postorder.indexOf(nextVal);
        
        if (nextValIndexInPost === -1) {
            throw new Error("No se pudo determinar la estructura del árbol");
        }
        
        const leftPostorder = postorder.slice(0, nextValIndexInPost + 1);
        const rightPostorder = postorder.slice(nextValIndexInPost + 1, -1);
        
        const leftPreorder = preorder.slice(1, 1 + leftPostorder.length);
        const rightPreorder = preorder.slice(1 + leftPostorder.length);
        
        root.left = this.buildFromPreorderPostorderRobust(leftPreorder, leftPostorder);
        root.right = this.buildFromPreorderPostorderRobust(rightPreorder, rightPostorder);
        
        return root;
    }

    // OPERACIONES DE NODOS
    insert(value) {
        const newNode = new TreeNode(value);
        
        if (this.root === null) {
            this.root = newNode;
        } else {
            this.insertNode(this.root, newNode);
        }
        
        this.drawTree();
    }

    insertNode(node, newNode) {
        if (newNode.value < node.value) {
            if (node.left === null) {
                node.left = newNode;
            } else {
                this.insertNode(node.left, newNode);
            }
        } else {
            if (node.right === null) {
                node.right = newNode;
            } else {
                this.insertNode(node.right, newNode);
            }
        }
    }

    delete(value) {
        this.root = this.deleteNode(this.root, value);
        this.drawTree();
    }

    deleteNode(node, value) {
        if (node === null) return null;
        
        if (value < node.value) {
            node.left = this.deleteNode(node.left, value);
            return node;
        } else if (value > node.value) {
            node.right = this.deleteNode(node.right, value);
            return node;
        } else {
            if (node.left === null && node.right === null) {
                return null;
            }
            
            if (node.left === null) {
                return node.right;
            } else if (node.right === null) {
                return node.left;
            }
            
            const minNode = this.findMinNode(node.right);
            node.value = minNode.value;
            node.right = this.deleteNode(node.right, minNode.value);
            return node;
        }
    }

    findMinNode(node) {
        if (node.left === null) return node;
        return this.findMinNode(node.left);
    }

    search(value) {
        return this.searchNode(this.root, value);
    }

    searchNode(node, value) {
        if (node === null) return null;
        
        if (value < node.value) {
            return this.searchNode(node.left, value);
        } else if (value > node.value) {
            return this.searchNode(node.right, value);
        } else {
            return node;
        }
    }

    highlightNode(value) {
        this.clearHighlights();
        const node = this.search(value);
        if (node) {
            this.nodePositions.set(node, { ...this.nodePositions.get(node), highlighted: true });
            this.drawTree();
            return true;
        }
        return false;
    }

    clearHighlights() {
        this.nodePositions.forEach((position, node) => {
            this.nodePositions.set(node, { ...position, highlighted: false });
        });
    }

    generateRandomTree(count = 10, min = 1, max = 100) {
        const numbers = [];
        for (let i = 0; i < count; i++) {
            numbers.push(Math.floor(Math.random() * (max - min + 1)) + min);
        }
        
        const uniqueNumbers = [...new Set(numbers)];
        
        this.root = this.buildBSTFromArray(uniqueNumbers, true);
        this.treeType = "Árbol Aleatorio";
        this.drawTree();
        
        return uniqueNumbers;
    }

    // MEJORADO: ANIMACIÓN DE RECORRIDOS CON EFECTO TUBERÍA
    animateTraversal(traversalType) {
        if (this.isAnimating) {
            this.stopAnimation();
            return;
        }
        
        this.stopAnimation();
        
        let nodes = [];
        switch (traversalType) {
            case 'preorder':
                nodes = this.preorderTraversal(this.root);
                break;
            case 'inorder':
                nodes = this.inorderTraversal(this.root);
                break;
            case 'postorder':
                nodes = this.postorderTraversal(this.root);
                break;
            default:
                return;
        }
        
        if (nodes.length === 0) return;
        
        this.animationNodes = nodes;
        this.animationIndex = 0;
        this.currentTraversalType = traversalType;
        this.isAnimating = true;
        this.activeConnections.clear();
        this.visitedConnections.clear();
        
        this.resetTraversalStates();
        this.showTraversalInfo(traversalType, nodes);
        
        this.animationInterval = setInterval(() => {
            if (this.animationIndex < this.animationNodes.length) {
                this.highlightTraversalStep(this.animationNodes[this.animationIndex], this.animationIndex + 1);
                this.animationIndex++;
            } else {
                this.stopAnimation();
                showSuccess(`Recorrido ${traversalType} completado`);
            }
        }, this.animationSpeed);
    }

    // MEJORADO: Resaltar paso de recorrido con efecto tubería
    highlightTraversalStep(value, stepNumber) {
        this.nodePositions.forEach((position, node) => {
            if (node.traversalState !== 'visited') {
                node.traversalState = 'normal';
                node.traversalOrder = null;
            }
        });
        
        const node = this.findNodeByValue(this.root, value);
        if (node) {
            node.traversalState = 'active';
            node.traversalOrder = stepNumber;
            
            this.markActivePath(node, stepNumber);
            this.createLightEffect(node);
            this.createParticles(node);
            
            this.drawTree();
            this.updateTraversalProgress(stepNumber, this.animationNodes.length, value);
        }
    }

    // NUEVO: Marcar camino activo con efecto tubería
    markActivePath(node, stepNumber) {
        const path = this.findPathToNode(this.root, node.value);
        
        for (let i = 0; i < path.length - 1; i++) {
            const currentNode = this.findNodeByValue(this.root, path[i]);
            const nextNode = this.findNodeByValue(this.root, path[i + 1]);
            
            if (currentNode && nextNode) {
                const connectionKey = `${currentNode.value}-${nextNode.value}`;
                this.activeConnections.add(connectionKey);
                
                if (i < path.length - 2) {
                    currentNode.traversalState = 'visited';
                }
            }
        }
        
        node.traversalState = 'active';
    }

    // NUEVO: Crear efecto de luz en conexiones
    createLightEffect(node) {
        const nodePos = this.nodePositions.get(node);
        if (!nodePos) return;

        const connections = this.findConnectionsToNode(node);
        connections.forEach(connection => {
            this.animateLightFlow(connection.from, connection.to);
        });
    }

    // NUEVO: Encontrar conexiones hacia un nodo
    findConnectionsToNode(targetNode) {
        const connections = [];
        
        const findConnections = (node) => {
            if (!node) return;
            
            if (node.left && this.findNodeByValue(node.left, targetNode.value)) {
                connections.push({ from: node, to: node.left });
                findConnections(node.left);
            } else if (node.right && this.findNodeByValue(node.right, targetNode.value)) {
                connections.push({ from: node, to: node.right });
                findConnections(node.right);
            }
        };
        
        findConnections(this.root);
        return connections;
    }

    // NUEVO: Animación de flujo de luz entre nodos
    animateLightFlow(fromNode, toNode) {
        const fromPos = this.nodePositions.get(fromNode);
        const toPos = this.nodePositions.get(toNode);
        
        if (!fromPos || !toPos) return;
        
        const dx = toPos.x - fromPos.x;
        const dy = toPos.y - fromPos.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx);
        
        const light = document.createElement('div');
        light.className = 'light-flow';
        light.style.width = `${distance}px`;
        light.style.transform = `rotate(${angle}rad)`;
        light.style.left = `${fromPos.x}px`;
        light.style.top = `${fromPos.y}px`;
        light.style.transformOrigin = '0 0';
        
        this.canvas.parentElement.appendChild(light);
        
        setTimeout(() => {
            if (light.parentElement) {
                light.parentElement.removeChild(light);
            }
        }, 1000);
    }

    // NUEVO: Crear partículas alrededor del nodo activo
    createParticles(node) {
        const nodePos = this.nodePositions.get(node);
        if (!nodePos) return;

        const particleCount = 12;
        const container = this.canvas.parentElement;
        
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            
            const angle = (i / particleCount) * Math.PI * 2;
            const distance = this.nodeRadius + 10;
            const tx = Math.cos(angle) * distance;
            const ty = Math.sin(angle) * distance;
            
            particle.style.setProperty('--tx', `${tx}px`);
            particle.style.setProperty('--ty', `${ty}px`);
            particle.style.left = `${nodePos.x}px`;
            particle.style.top = `${nodePos.y}px`;
            
            container.appendChild(particle);
            
            setTimeout(() => {
                if (particle.parentElement) {
                    particle.parentElement.removeChild(particle);
                }
            }, 1000);
        }
    }

    findNodeByValue(node, value) {
        if (!node) return null;
        if (node.value === value) return node;
        
        const leftResult = this.findNodeByValue(node.left, value);
        if (leftResult) return leftResult;
        
        return this.findNodeByValue(node.right, value);
    }

    findPathToNode(node, value, path = []) {
        if (!node) return null;
        
        path.push(node.value);
        
        if (node.value === value) return path;
        
        if (value < node.value) {
            return this.findPathToNode(node.left, value, path);
        } else {
            return this.findPathToNode(node.right, value, path);
        }
    }

    resetTraversalStates() {
        const resetNodeStates = (node) => {
            if (!node) return;
            node.traversalState = 'normal';
            node.traversalOrder = null;
            resetNodeStates(node.left);
            resetNodeStates(node.right);
        };
        resetNodeStates(this.root);
        this.activeConnections.clear();
        this.visitedConnections.clear();
    }

    showTraversalInfo(traversalType, nodes) {
        const typeNames = {
            'preorder': 'Preorden',
            'inorder': 'Inorden',
            'postorder': 'Postorden'
        };
        
        const resultsContainer = document.getElementById('resultsContainer');
        resultsContainer.innerHTML = `
            <div class="alert alert-warning fade-in">
                <span>🎬</span>
                <div>
                    <strong>Animando Recorrido ${typeNames[traversalType]}</strong><br>
                    <small>Progreso: <span id="traversalProgress">0/${nodes.length}</span></small><br>
                    <small>Nodo actual: <span id="currentNode">-</span></small>
                </div>
            </div>
        `;
    }

    updateTraversalProgress(current, total, currentNode) {
        const progressElement = document.getElementById('traversalProgress');
        const currentNodeElement = document.getElementById('currentNode');
        
        if (progressElement) {
            progressElement.textContent = `${current}/${total}`;
        }
        
        if (currentNodeElement) {
            currentNodeElement.textContent = currentNode;
        }
    }

    stopAnimation() {
        if (this.animationInterval) {
            clearInterval(this.animationInterval);
            this.animationInterval = null;
        }
        this.isAnimating = false;
        this.resetTraversalStates();
        this.drawTree();
        
        const progressElement = document.getElementById('traversalProgress');
        const currentNodeElement = document.getElementById('currentNode');
        if (progressElement) progressElement.textContent = '';
        if (currentNodeElement) currentNodeElement.textContent = '';
        
        document.querySelectorAll('.light-flow, .particle').forEach(el => {
            if (el.parentElement) {
                el.parentElement.removeChild(el);
            }
        });
    }

    calculateTreeInfo(node) {
        if (!node) return { height: 0, nodeCount: 0, balanced: true };
        
        const leftInfo = this.calculateTreeInfo(node.left);
        const rightInfo = this.calculateTreeInfo(node.right);
        
        const height = Math.max(leftInfo.height, rightInfo.height) + 1;
        const nodeCount = leftInfo.nodeCount + rightInfo.nodeCount + 1;
        const balanced = leftInfo.balanced && rightInfo.balanced && 
                        Math.abs(leftInfo.height - rightInfo.height) <= 1;
        
        return { height, nodeCount, balanced };
    }

    calculatePositions(node, level, minPos, maxPos) {
        if (!node) return;
        
        node.level = level;
        node.y = level * this.levelHeight + 80;
        node.x = (minPos + maxPos) / 2;

        this.nodePositions.set(node, { 
            x: node.x, 
            y: node.y, 
            highlighted: false,
            traversalState: node.traversalState || 'normal',
            traversalOrder: node.traversalOrder
        });

        if (node.left) {
            this.calculatePositions(node.left, level + 1, minPos, node.x - 60);
        }
        if (node.right) {
            this.calculatePositions(node.right, level + 1, node.x + 60, maxPos);
        }
    }

    drawTree() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        if (!this.root) {
            document.getElementById('emptyState').style.display = 'block';
            return;
        }
        
        document.getElementById('emptyState').style.display = 'none';

        this.nodePositions.clear();
        this.calculatePositions(this.root, 0, 60, this.canvas.width - 60);
        this.drawConnections(this.root);
        this.drawNode(this.root);
        
        this.updateTreeInfo();
    }

    drawConnections(node) {
        if (!node) return;

        const nodePos = this.nodePositions.get(node);

        if (node.left) {
            const leftPos = this.nodePositions.get(node.left);
            this.drawConnection(nodePos, leftPos, node, node.left);
            this.drawConnections(node.left);
        }

        if (node.right) {
            const rightPos = this.nodePositions.get(node.right);
            this.drawConnection(nodePos, rightPos, node, node.right);
            this.drawConnections(node.right);
        }
    }

    drawConnection(fromPos, toPos, fromNode, toNode) {
        const connectionKey = `${fromNode.value}-${toNode.value}`;
        const reverseKey = `${toNode.value}-${fromNode.value}`;
        
        let strokeStyle, lineWidth, shadowColor;
        
        if (this.activeConnections.has(connectionKey) || this.activeConnections.has(reverseKey)) {
            strokeStyle = '#ffaa00';
            lineWidth = 6;
            shadowColor = '#ffaa00';
        } else if (this.visitedConnections.has(connectionKey) || this.visitedConnections.has(reverseKey)) {
            strokeStyle = '#00ff88';
            lineWidth = 5;
            shadowColor = '#00ff88';
        } else if (fromPos.highlighted || toPos.highlighted) {
            strokeStyle = '#00ff88';
            lineWidth = 4;
            shadowColor = '#00ff88';
        } else {
            strokeStyle = '#00f7ff';
            lineWidth = 3;
            shadowColor = '#00f7ff';
        }

        this.ctx.strokeStyle = strokeStyle;
        this.ctx.lineWidth = lineWidth;
        this.ctx.shadowBlur = 15;
        this.ctx.shadowColor = shadowColor;

        this.ctx.beginPath();
        this.ctx.moveTo(fromPos.x, fromPos.y);
        this.ctx.lineTo(toPos.x, toPos.y);
        this.ctx.stroke();

        this.ctx.shadowBlur = 0;
    }

    drawNode(node) {
        if (!node) return;

        const nodePos = this.nodePositions.get(node);

        const gradient = this.ctx.createRadialGradient(
            nodePos.x, nodePos.y, 0, nodePos.x, nodePos.y, this.nodeRadius
        );
        
        if (nodePos.traversalState === 'active') {
            gradient.addColorStop(0, '#ffaa00');
            gradient.addColorStop(0.7, '#d97706');
            gradient.addColorStop(1, '#b45309');
        } else if (nodePos.traversalState === 'visited') {
            gradient.addColorStop(0, '#00ff88');
            gradient.addColorStop(0.7, '#00c466');
            gradient.addColorStop(1, '#0d8b5c');
        } else if (nodePos.highlighted) {
            gradient.addColorStop(0, '#00ff88');
            gradient.addColorStop(1, '#00c466');
        } else {
            gradient.addColorStop(0, '#00f7ff');
            gradient.addColorStop(1, '#00aacc');
        }

        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.arc(nodePos.x, nodePos.y, this.nodeRadius, 0, 2 * Math.PI);
        this.ctx.fill();

        let borderColor;
        if (nodePos.traversalState === 'active') {
            borderColor = '#ffaa00';
        } else if (nodePos.traversalState === 'visited') {
            borderColor = '#00ff88';
        } else if (nodePos.highlighted) {
            borderColor = '#00ff88';
        } else {
            borderColor = '#00c4cc';
        }

        this.ctx.strokeStyle = borderColor;
        this.ctx.lineWidth = 2;
        this.ctx.stroke();

        let shadowColor;
        if (nodePos.traversalState === 'active') {
            shadowColor = '#ffaa00';
            this.ctx.shadowBlur = 25;
        } else if (nodePos.traversalState === 'visited') {
            shadowColor = '#00ff88';
            this.ctx.shadowBlur = 20;
        } else if (nodePos.highlighted) {
            shadowColor = '#00ff88';
            this.ctx.shadowBlur = 20;
        } else {
            shadowColor = '#00f7ff';
            this.ctx.shadowBlur = 15;
        }

        this.ctx.shadowColor = shadowColor;

        this.ctx.fillStyle = '#0a0a0f';
        this.ctx.font = 'bold 16px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(node.value, nodePos.x, nodePos.y);

        if (nodePos.traversalOrder) {
            this.ctx.fillStyle = '#0a0a0f';
            this.ctx.font = 'bold 12px Arial';
            this.ctx.fillText(nodePos.traversalOrder.toString(), nodePos.x, nodePos.y - 25);
        }

        this.ctx.shadowBlur = 0;

        this.drawNode(node.left);
        this.drawNode(node.right);
    }

    updateTreeInfo() {
        if (!this.root) {
            document.getElementById('nodeCount').textContent = '0';
            document.getElementById('treeHeight').textContent = '0';
            document.getElementById('treeLevels').textContent = '0';
            document.getElementById('treeBalanced').textContent = 'NO';
            return;
        }

        const info = this.calculateTreeInfo(this.root);
        document.getElementById('nodeCount').textContent = info.nodeCount;
        document.getElementById('treeHeight').textContent = info.height;
        document.getElementById('treeLevels').textContent = info.height;
        document.getElementById('treeBalanced').textContent = info.balanced ? 'SÍ' : 'NO';
    }

    // Métodos de recorrido
    preorderTraversal(node, result = []) {
        if (!node) return result;
        result.push(node.value);
        this.preorderTraversal(node.left, result);
        this.preorderTraversal(node.right, result);
        return result;
    }

    inorderTraversal(node, result = []) {
        if (!node) return result;
        this.inorderTraversal(node.left, result);
        result.push(node.value);
        this.inorderTraversal(node.right, result);
        return result;
    }

    postorderTraversal(node, result = []) {
        if (!node) return result;
        this.postorderTraversal(node.left, result);
        this.postorderTraversal(node.right, result);
        result.push(node.value);
        return result;
    }

    // Exportar árbol a JSON
    exportToJSON() {
        if (!this.root) {
            throw new Error("No hay árbol para exportar");
        }

        const treeData = {
            preorder: this.preorderTraversal(this.root),
            inorder: this.inorderTraversal(this.root),
            postorder: this.postorderTraversal(this.root),
            nodeCount: this.calculateTreeInfo(this.root).nodeCount,
            treeType: this.treeType,
            exportDate: new Date().toISOString()
        };

        return JSON.stringify(treeData, null, 2);
    }

    // Importar árbol desde JSON
    importFromJSON(jsonData) {
        try {
            const data = JSON.parse(jsonData);
            
            if (data.preorder && data.inorder) {
                this.root = this.buildFromPreorderInorder(data.preorder, data.inorder);
                this.treeType = data.treeType || "Desde Recorridos";
                this.drawTree();
                return true;
            } else if (data.inorder && data.postorder) {
                this.root = this.buildFromInorderPostorder(data.inorder, data.postorder);
                this.treeType = data.treeType || "Desde Recorridos";
                this.drawTree();
                return true;
            } else {
                throw new Error("Formato JSON inválido: faltan recorridos necesarios");
            }
        } catch (error) {
            throw new Error(`Error al importar: ${error.message}`);
        }
    }

    clear() {
        this.root = null;
        this.treeType = "Ninguno";
        this.nodePositions.clear();
        this.stopAnimation();
        this.drawTree();
    }
}

// INICIALIZACIÓN MEJORADA
document.addEventListener('DOMContentLoaded', function() {
    const treeVisualizer = new TreeVisualizer('treeCanvas');
    
    // Tabs functionality
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', function() {
            document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            
            this.classList.add('active');
            const tabId = this.getAttribute('data-tab') + 'Tab';
            document.getElementById(tabId).classList.add('active');
        });
    });

    // Modal functionality
    const helpModal = document.getElementById('helpModal');
    const helpBtn = document.getElementById('helpBtn');
    const closeModal = document.getElementById('closeModal');

    helpBtn.addEventListener('click', () => {
        helpModal.classList.add('active');
    });

    closeModal.addEventListener('click', () => {
        helpModal.classList.remove('active');
    });

    helpModal.addEventListener('click', (e) => {
        if (e.target === helpModal) {
            helpModal.classList.remove('active');
        }
    });

    // Selector de método de reconstrucción ACTUALIZADO
    document.querySelectorAll('.method-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.method-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            const method = this.getAttribute('data-method');
            
            document.querySelectorAll('.traversal-inputs').forEach(input => {
                input.classList.remove('active');
            });
            
            if (method === 'preorder-inorder') {
                document.getElementById('preorderInorderInputs').classList.add('active');
                document.getElementById('traversalExplanation').innerHTML = `
                    <h4>📋 Preorden + Inorden</h4>
                    <p>Proporciona los recorridos <strong>Preorden</strong> y <strong>Inorden</strong> para reconstruir el árbol único.</p>
                    <p><strong>Preorden:</strong> Raíz → Izquierda → Derecha</p>
                    <p><strong>Inorden:</strong> Izquierda → Raíz → Derecha</p>
                    <p><em>✅ Esta combinación siempre produce un árbol único</em></p>
                `;
            } else if (method === 'inorder-postorder') {
                document.getElementById('inorderPostorderInputs').classList.add('active');
                document.getElementById('traversalExplanation').innerHTML = `
                    <h4>📊 Inorden + Postorden</h4>
                    <p>Proporciona los recorridos <strong>Inorden</strong> y <strong>Postorden</strong> para reconstruir el árbol único.</p>
                    <p><strong>Inorden:</strong> Izquierda → Raíz → Derecha</p>
                    <p><strong>Postorden:</strong> Izquierda → Derecha → Raíz</p>
                    <p><em>✅ Esta combinación siempre produce un árbol único</em></p>
                `;
            } else if (method === 'preorder-postorder') {
                document.getElementById('preorderPostorderInputs').classList.add('active');
                document.getElementById('traversalExplanation').innerHTML = `
                    <h4>🔄 Preorden + Postorden</h4>
                    <p>Proporciona los recorridos <strong>Preorden</strong> y <strong>Postorden</strong> para reconstruir el árbol.</p>
                    <p><strong>Preorden:</strong> Raíz → Izquierda → Derecha</p>
                    <p><strong>Postorden:</strong> Izquierda → Derecha → Raíz</p>
                    <p><em>⚠️ Esta combinación <strong>NO siempre</strong> produce un árbol único</em></p>
                    <p><em>🔍 Solo funciona para árboles <strong>completos</strong> (cada nodo tiene 0 o 2 hijos)</em></p>
                `;
            }
        });
    });

    // Construir desde Array
    document.getElementById('buildFromArrayBtn').addEventListener('click', () => {
        const arrayInput = document.getElementById('arrayInput').value;
        const arrayType = document.getElementById('arrayType').value;
        
        try {
            let array;
            if (arrayType === 'numbers') {
                array = arrayInput.split(',').map(item => {
                    const num = parseFloat(item.trim());
                    if (isNaN(num)) throw new Error(`"${item}" no es un número válido`);
                    return num;
                });
            } else {
                array = arrayInput.split(',').map(item => item.trim().toUpperCase());
                if (array.some(item => item.length !== 1 || !item.match(/[A-Z]/))) {
                    throw new Error("Solo se permiten letras individuales de A-Z");
                }
            }

            if (array.length === 0) {
                throw new Error("El array no puede estar vacío");
            }

            const uniqueArray = [...new Set(array)];
            if (uniqueArray.length !== array.length) {
                showWarning(`Se eliminaron ${array.length - uniqueArray.length} elementos duplicados`);
            }

            treeVisualizer.root = treeVisualizer.buildBSTFromArray(uniqueArray, arrayType === 'numbers');
            treeVisualizer.treeType = `BST desde Array (${arrayType === 'numbers' ? 'Números' : 'Letras'})`;
            treeVisualizer.drawTree();
            showSuccess(`Árbol BST creado desde array con ${uniqueArray.length} elementos únicos`);
            updateTraversalResults(treeVisualizer);
        } catch (error) {
            showError(`${error.message}`);
        }
    });

    // Añadir un solo valor directamente al árbol
    document.getElementById('addSingleValueBtn').addEventListener('click', () => {
        const raw = document.getElementById('addSingleValueInput').value.trim();
        const arrayType = document.getElementById('arrayType').value;

        if (!raw) {
            showError('Ingrese un valor para añadir');
            return;
        }

        try {
            let value;
            if (arrayType === 'numbers') {
                value = parseFloat(raw);
                if (isNaN(value)) {
                    showError('Ingrese un número válido');
                    return;
                }
            } else {
                const v = raw.toUpperCase();
                if (v.length !== 1 || !v.match(/^[A-Z]$/)) {
                    showError('Ingrese una sola letra A-Z');
                    return;
                }
                value = v;
            }

            treeVisualizer.insert(value);
            treeVisualizer.treeType = `BST (${arrayType === 'numbers' ? 'Números' : 'Letras'})`;
            showSuccess(`Valor ${value} insertado en el árbol`);
            updateTraversalResults(treeVisualizer);
            document.getElementById('addSingleValueInput').value = '';
        } catch (err) {
            showError(`Error al insertar: ${err.message}`);
        }
    });

    // Reconstruir desde Preorden + Inorden
    document.getElementById('reconstructFromPreInBtn').addEventListener('click', () => {
        const preorder = document.getElementById('preorderInput').value.split(',').map(s => s.trim()).filter(s => s);
        const inorder = document.getElementById('inorderInput').value.split(',').map(s => s.trim()).filter(s => s);
        
        try {
            validateTraversalInputs(preorder, inorder, []);
            treeVisualizer.root = treeVisualizer.buildFromPreorderInorder(preorder, inorder);
            treeVisualizer.treeType = "Desde Preorden+Inorden";
            treeVisualizer.drawTree();
            showSuccess('Árbol reconstruido exitosamente desde Preorden + Inorden');
            updateTraversalResults(treeVisualizer);
        } catch (error) {
            showError(`${error.message}`);
        }
    });

    // Reconstruir desde Inorden + Postorden
    document.getElementById('reconstructFromInPostBtn').addEventListener('click', () => {
        const inorder = document.getElementById('inorderInput2').value.split(',').map(s => s.trim()).filter(s => s);
        const postorder = document.getElementById('postorderInput').value.split(',').map(s => s.trim()).filter(s => s);
        
        try {
            validateTraversalInputs([], inorder, postorder);
            treeVisualizer.root = treeVisualizer.buildFromInorderPostorder(inorder, postorder);
            treeVisualizer.treeType = "Desde Inorden+Postorden";
            treeVisualizer.drawTree();
            showSuccess('Árbol reconstruido exitosamente desde Inorden + Postorden');
            updateTraversalResults(treeVisualizer);
        } catch (error) {
            showError(`${error.message}`);
        }
    });

    // NUEVO: Reconstruir desde Preorden + Postorden
    document.getElementById('reconstructFromPrePostBtn').addEventListener('click', () => {
        const preorder = document.getElementById('preorderInput3').value.split(',').map(s => s.trim()).filter(s => s);
        const postorder = document.getElementById('postorderInput2').value.split(',').map(s => s.trim()).filter(s => s);
        
        try {
            validatePrePostInputs(preorder, postorder);
            
            if (!confirm('⚠️ ADVERTENCIA: La reconstrucción desde Preorden+Postorden no siempre produce un árbol único.\n\nSolo funciona correctamente para árboles completos (cada nodo tiene 0 o 2 hijos).\n\n¿Continuar?')) {
                return;
            }
            
            treeVisualizer.root = treeVisualizer.buildFromPreorderPostorderRobust(preorder, postorder);
            treeVisualizer.treeType = "Desde Preorden+Postorden";
            treeVisualizer.drawTree();
            showSuccess('Árbol reconstruido desde Preorden + Postorden (puede no ser único)');
            updateTraversalResults(treeVisualizer);
        } catch (error) {
            showError(`${error.message}`);
        }
    });

    // Operaciones de nodos
    document.getElementById('insertNodeBtn').addEventListener('click', () => {
        const value = document.getElementById('insertNodeInput').value.trim();
        
        if (!value) {
            showError('Por favor ingresa un valor para insertar');
            return;
        }
        
        try {
            let nodeValue;
            if (treeVisualizer.root && typeof treeVisualizer.root.value === 'number') {
                nodeValue = parseFloat(value);
                if (isNaN(nodeValue)) throw new Error('El valor debe ser un número');
            } else {
                nodeValue = value.toUpperCase();
                if (nodeValue.length !== 1 || !nodeValue.match(/[A-Z]/)) {
                    throw new Error('El valor debe ser una letra de A-Z');
                }
            }
            
            if (treeVisualizer.search(nodeValue)) {
                throw new Error(`El nodo ${nodeValue} ya existe en el árbol`);
            }
            
            treeVisualizer.insert(nodeValue);
            treeVisualizer.treeType = "Árbol con inserción individual";
            showSuccess(`Nodo ${nodeValue} insertado exitosamente`);
            updateTraversalResults(treeVisualizer);
            document.getElementById('insertNodeInput').value = '';
        } catch (error) {
            showError(`${error.message}`);
        }
    });

    document.getElementById('deleteNodeBtn').addEventListener('click', () => {
        const value = document.getElementById('deleteNodeInput').value.trim();
        
        if (!value) {
            showError('Por favor ingresa un valor para eliminar');
            return;
        }
        
        try {
            let nodeValue;
            if (treeVisualizer.root && typeof treeVisualizer.root.value === 'number') {
                nodeValue = parseFloat(value);
                if (isNaN(nodeValue)) throw new Error('El valor debe ser un número');
            } else {
                nodeValue = value.toUpperCase();
                if (nodeValue.length !== 1 || !nodeValue.match(/[A-Z]/)) {
                    throw new Error('El valor debe ser una letra de A-Z');
                }
            }
            
            if (!treeVisualizer.search(nodeValue)) {
                throw new Error(`El nodo ${nodeValue} no existe en el árbol`);
            }
            
            treeVisualizer.delete(nodeValue);
            treeVisualizer.treeType = "Árbol con eliminación";
            showSuccess(`Nodo ${nodeValue} eliminado exitosamente`);
            updateTraversalResults(treeVisualizer);
            document.getElementById('deleteNodeInput').value = '';
        } catch (error) {
            showError(`${error.message}`);
        }
    });

    document.getElementById('searchNodeBtn').addEventListener('click', () => {
        const value = document.getElementById('searchNodeInput').value.trim();
        
        if (!value) {
            showError('Por favor ingresa un valor para buscar');
            return;
        }
        
        try {
            let nodeValue;
            if (treeVisualizer.root && typeof treeVisualizer.root.value === 'number') {
                nodeValue = parseFloat(value);
                if (isNaN(nodeValue)) throw new Error('El valor debe ser un número');
            } else {
                nodeValue = value.toUpperCase();
                if (nodeValue.length !== 1 || !nodeValue.match(/[A-Z]/)) {
                    throw new Error('El valor debe ser una letra de A-Z');
                }
            }
            
            const found = treeVisualizer.highlightNode(nodeValue);
            if (found) {
                showSuccess(`Nodo ${nodeValue} encontrado en el árbol`);
            } else {
                showError(`Nodo ${nodeValue} no encontrado en el árbol`);
            }
            document.getElementById('searchNodeInput').value = '';
        } catch (error) {
            showError(`${error.message}`);
        }
    });

    document.getElementById('generateRandomTreeBtn').addEventListener('click', () => {
        const numbers = treeVisualizer.generateRandomTree(10, 1, 100);
        showSuccess(`Árbol aleatorio generado con valores: ${numbers.join(', ')}`);
        updateTraversalResults(treeVisualizer);
    });

    // MEJORADO: Botones de recorridos con animación automática
    document.getElementById('showPreorderBtn').addEventListener('click', () => {
        if (!treeVisualizer.root) {
            showError('No hay árbol para recorrer');
            return;
        }
        const result = treeVisualizer.preorderTraversal(treeVisualizer.root);
        document.getElementById('preorderText').textContent = result.join(' → ');
        document.getElementById('preorderResult').style.display = 'block';
        
        // Animación automática
        treeVisualizer.animateTraversal('preorder');
    });

    document.getElementById('showInorderBtn').addEventListener('click', () => {
        if (!treeVisualizer.root) {
            showError('No hay árbol para recorrer');
            return;
        }
        const result = treeVisualizer.inorderTraversal(treeVisualizer.root);
        document.getElementById('inorderText').textContent = result.join(' → ');
        document.getElementById('inorderResult').style.display = 'block';
        
        // Animación automática
        treeVisualizer.animateTraversal('inorder');
    });

    document.getElementById('showPostorderBtn').addEventListener('click', () => {
        if (!treeVisualizer.root) {
            showError('No hay árbol para recorrer');
            return;
        }
        const result = treeVisualizer.postorderTraversal(treeVisualizer.root);
        document.getElementById('postorderText').textContent = result.join(' → ');
        document.getElementById('postorderResult').style.display = 'block';
        
        // Animación automática
        treeVisualizer.animateTraversal('postorder');
    });

    // Animación de recorridos
    document.getElementById('animateTraversalBtn').addEventListener('click', () => {
        try {
            if (!treeVisualizer.root) {
                showError('No hay árbol para animar');
                return;
            }

            if (treeVisualizer.isAnimating) {
                if (confirm('¿Deseas detener la animación actual?')) {
                    treeVisualizer.stopAnimation();
                    showWarning('Animación detenida');
                }
                return;
            }

            const traversalType = prompt('Selecciona el tipo de recorrido:\n1. Preorden\n2. Inorden\n3. Postorden', '1');

            if (traversalType === null) {
                showWarning('Animación cancelada');
                return;
            }

            let type;
            switch (traversalType) {
                case '1':
                    type = 'preorder';
                    break;
                case '2':
                    type = 'inorder';
                    break;
                case '3':
                    type = 'postorder';
                    break;
                default:
                    showError('Tipo de recorrido no válido');
                    return;
            }

            treeVisualizer.animateTraversal(type);
            showSuccess(`Animando recorrido ${type}`);
        } catch (err) {
            showError(`Error al animar recorrido: ${err.message}`);
        }
    });

    // Exportar árbol
    document.getElementById('exportTreeBtn').addEventListener('click', () => {
        try {
            const jsonData = treeVisualizer.exportToJSON();
            const fileName = prompt("Ingresa el nombre del archivo (sin extensión):", `arbol_binario_${new Date().getTime()}`);
            
            if (!fileName) return;
            
            const blob = new Blob([jsonData], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${fileName}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            showSuccess(`Árbol exportado exitosamente como ${fileName}.json`);
        } catch (error) {
            showError(`${error.message}`);
        }
    });

    // Importar árbol
    document.getElementById('importTreeFile').addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                treeVisualizer.importFromJSON(e.target.result);
                showSuccess('Árbol importado exitosamente');
                updateTraversalResults(treeVisualizer);
            } catch (error) {
                showError(`${error.message}`);
            }
        };
        reader.readAsText(file);
        e.target.value = '';
    });

    // Limpiar árbol
    document.getElementById('clearTreeBtn').addEventListener('click', () => {
        if (treeVisualizer.isAnimating) {
            treeVisualizer.stopAnimation();
        }
        treeVisualizer.clear();
        showSuccess('Árbol limpiado');
        hideTraversalResults();
        hideResults();
    });

    // Ejemplos ACTUALIZADO
    document.getElementById('exampleArrayNumbersBtn').addEventListener('click', () => {
        document.getElementById('arrayInput').value = '5,3,7,1,9,2,8,4,6';
        document.getElementById('arrayType').value = 'numbers';
        showSuccess('Ejemplo de números cargado. Creando árbol...');
        document.getElementById('buildFromArrayBtn').click();
    });

    document.getElementById('exampleArrayLettersBtn').addEventListener('click', () => {
        document.getElementById('arrayInput').value = 'D,B,F,A,C,E,G';
        document.getElementById('arrayType').value = 'letters';
        showSuccess('Ejemplo de letras cargado. Creando árbol...');
        document.getElementById('buildFromArrayBtn').click();
    });

    document.getElementById('exampleTraversalsBtn').addEventListener('click', () => {
        try {
            const activeBtn = document.querySelector('.method-btn.active');
            const activeMethod = activeBtn ? activeBtn.getAttribute('data-method') : 'preorder-inorder';

            if (activeMethod === 'preorder-inorder') {
                document.getElementById('preorderInput').value = 'A,B,D,E,C,F';
                document.getElementById('inorderInput').value = 'D,B,E,A,F,C';
                showSuccess('Ejemplo de Preorden+Inorden cargado. Reconstruyendo...');
                document.getElementById('reconstructFromPreInBtn').click();
            } else if (activeMethod === 'inorder-postorder') {
                document.getElementById('inorderInput2').value = 'D,B,E,A,F,C';
                document.getElementById('postorderInput').value = 'D,E,B,F,C,A';
                showSuccess('Ejemplo de Inorden+Postorden cargado. Reconstruyendo...');
                document.getElementById('reconstructFromInPostBtn').click();
            } else if (activeMethod === 'preorder-postorder') {
                document.getElementById('preorderInput3').value = 'A,B,D,C,E,F';
                document.getElementById('postorderInput2').value = 'D,B,E,F,C,A';
                showSuccess('Ejemplo de Preorden+Postorden cargado. Reconstruyendo...');
                document.getElementById('reconstructFromPrePostBtn').click();
            }
        } catch (err) {
            showError(`Error al cargar ejemplo de recorridos: ${err.message}`);
        }
    });

    document.getElementById('exampleComplexTreeBtn').addEventListener('click', () => {
        document.getElementById('arrayInput').value = '50,30,70,20,40,60,80,10,25,35,45,55,65,75,85,5,15,23,27,33,37,43,47,53,57,63,67,73,77,83,87';
        document.getElementById('arrayType').value = 'numbers';
        showSuccess('Ejemplo de árbol complejo cargado. Creando árbol...');
        document.getElementById('buildFromArrayBtn').click();
    });

    // Funciones auxiliares
    function validateTraversalInputs(preorder, inorder, postorder) {
        if (inorder.length === 0) {
            throw new Error("El recorrido INORDEN es obligatorio");
        }

        const hasPreorder = preorder.length > 0;
        const hasPostorder = postorder.length > 0;

        if (!hasPreorder && !hasPostorder) {
            throw new Error("Debe proporcionar Preorden O Postorden junto con Inorden");
        }

        if (hasPreorder && hasPostorder) {
            throw new Error("Solo debe proporcionar Preorden O Postorden, no ambos");
        }

        if (hasPreorder && preorder.length !== inorder.length) {
            throw new Error("Preorden e Inorden deben tener la misma longitud");
        }

        if (hasPostorder && postorder.length !== inorder.length) {
            throw new Error("Postorden e Inorden deben tener la misma longitud");
        }

        const inorderSet = new Set(inorder);
        const comparisonSet = hasPreorder ? new Set(preorder) : new Set(postorder);

        if (inorderSet.size !== inorder.length) {
            throw new Error("El recorrido Inorden no puede tener elementos duplicados");
        }

        if (comparisonSet.size !== (hasPreorder ? preorder.length : postorder.length)) {
            throw new Error("El otro recorrido no puede tener elementos duplicados");
        }

        if (inorderSet.size !== comparisonSet.size || ![...inorderSet].every(item => comparisonSet.has(item))) {
            throw new Error("Los recorridos deben contener los mismos elementos");
        }
    }

    // NUEVO: Función de validación para Preorden+Postorden
    function validatePrePostInputs(preorder, postorder) {
        if (preorder.length === 0 || postorder.length === 0) {
            throw new Error("Ambos recorridos son obligatorios");
        }

        if (preorder.length !== postorder.length) {
            throw new Error("Preorden y Postorden deben tener la misma longitud");
        }

        if (preorder[0] !== postorder[postorder.length - 1]) {
            throw new Error("El primer elemento de Preorden debe ser el último de Postorden");
        }

        const preorderSet = new Set(preorder);
        const postorderSet = new Set(postorder);

        if (preorderSet.size !== preorder.length) {
            throw new Error("El recorrido Preorden no puede tener elementos duplicados");
        }

        if (postorderSet.size !== postorder.length) {
            throw new Error("El recorrido Postorden no puede tener elementos duplicados");
        }

        if (preorderSet.size !== postorderSet.size || ![...preorderSet].every(item => postorderSet.has(item))) {
            throw new Error("Los recorridos deben contener los mismos elementos");
        }
    }

    function showError(message) {
        const resultsContainer = document.getElementById('resultsContainer');
        resultsContainer.innerHTML = `
            <div class="alert alert-error fade-in">
                <span>❌</span>
                <div>${message}</div>
            </div>
        `;
    }

    function showSuccess(message) {
        const resultsContainer = document.getElementById('resultsContainer');
        resultsContainer.innerHTML = `
            <div class="alert alert-success fade-in">
                <span>✅</span>
                <div>${message}</div>
            </div>
        `;
    }

    function showWarning(message) {
        const resultsContainer = document.getElementById('resultsContainer');
        resultsContainer.innerHTML = `
            <div class="alert alert-warning fade-in">
                <span>⚠️</span>
                <div>${message}</div>
            </div>
        `;
    }

    function hideResults() {
        const resultsContainer = document.getElementById('resultsContainer');
        resultsContainer.innerHTML = `
            <div class="alert alert-success">
                <span>✅</span>
                <div>Listo para crear árboles binarios</div>
            </div>
        `;
    }

    function updateTraversalResults(tree) {
        const preorder = tree.preorderTraversal(tree.root);
        const inorder = tree.inorderTraversal(tree.root);
        const postorder = tree.postorderTraversal(tree.root);
        
        document.getElementById('preorderText').textContent = preorder.join(' → ');
        document.getElementById('inorderText').textContent = inorder.join(' → ');
        document.getElementById('postorderText').textContent = postorder.join(' → ');
        
        document.getElementById('preorderResult').style.display = 'block';
        document.getElementById('inorderResult').style.display = 'block';
        document.getElementById('postorderResult').style.display = 'block';
    }

    function hideTraversalResults() {
        document.getElementById('preorderResult').style.display = 'none';
        document.getElementById('inorderResult').style.display = 'none';
        document.getElementById('postorderResult').style.display = 'none';
    }
});
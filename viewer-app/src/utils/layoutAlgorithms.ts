import { DependencyData, GraphNode, ConnectedComponent, CanvasConfig } from '@/types';

/**
 * Calcula o layout hierárquico para os nós do grafo
 */
export function calculateHierarchicalLayout(
  data: DependencyData,
  components: ConnectedComponent[],
  nodesInCycles: Set<string>,
  config: CanvasConfig
): GraphNode[] {
  const nodes: GraphNode[] = [];
  let componentOffsetX = 0;

  // Separar componentes conectados de nós isolados
  const connectedComponents = components.filter((comp) => comp.nodes.length > 1);
  const isolatedNodes = components.filter((comp) => comp.nodes.length === 1);

  // Processar componentes conectados primeiro
  connectedComponents.forEach((component) => {
    const componentDeps = data.dependencies.filter((dep) =>
      component.nodes.includes(dep.fileId)
    );

    // Calcular profundidade para este componente
    const rootNodes = componentDeps.filter(
      (dep) =>
        dep.importedBy.length === 0 ||
        dep.importedBy.every((id) => !component.nodes.includes(id))
    );

    const depthMap: Record<string, number> = {};
    const queue:
      | { id: string; depth: number; path: string[] }[]
      | { id: string; depth: number; path: string[] }[] =
      rootNodes.length > 0
        ? rootNodes.map((node) => ({ id: node.fileId, depth: 0, path: [] }))
        : [{ id: componentDeps[0].fileId, depth: 0, path: [] }];

    while (queue.length > 0) {
      const { id, depth, path } = queue.shift()!;

      if (depthMap[id] !== undefined && depthMap[id] <= depth) {
        continue;
      }

      if (path.includes(id)) {
        if (depthMap[id] === undefined) {
          depthMap[id] = depth;
        }
        continue;
      }

      depthMap[id] = depth;

      const node = componentDeps.find((d) => d.fileId === id);
      if (node) {
        const newPath = [...path, id];
        node.imports.forEach((importId) => {
          if (component.nodes.includes(importId)) {
            queue.push({ id: importId, depth: depth + 1, path: newPath });
          }
        });
      }
    }

    componentDeps.forEach((dep) => {
      if (depthMap[dep.fileId] === undefined) {
        depthMap[dep.fileId] = 0;
      }
    });

    // Agrupar por profundidade
    const nodesByDepth: Record<number, typeof componentDeps> = {};
    componentDeps.forEach((dep) => {
      const depth = depthMap[dep.fileId];
      if (!nodesByDepth[depth]) nodesByDepth[depth] = [];
      nodesByDepth[depth].push(dep);
    });

    // Calcular largura máxima deste componente
    let maxWidth = 0;
    Object.values(nodesByDepth).forEach((nodesAtDepth) => {
      const width = (nodesAtDepth.length - 1) * config.horizontalSpacing;
      maxWidth = Math.max(maxWidth, width);
    });

    // Posicionar nós deste componente
    Object.keys(nodesByDepth)
      .map(Number)
      .sort((a, b) => a - b)
      .forEach((depth) => {
        const nodesAtDepth = nodesByDepth[depth];
        const totalWidth = (nodesAtDepth.length - 1) * config.horizontalSpacing;
        const startX = componentOffsetX - totalWidth / 2;

        nodesAtDepth.forEach((dep, index) => {
          const filePath = data.fileRegistry[dep.fileId] || dep.fileId;
          nodes.push({
            id: dep.fileId,
            x: startX + index * config.horizontalSpacing,
            y: depth * config.verticalSpacing,
            filePath: filePath,
            imports: dep.imports,
            importedBy: dep.importedBy,
            isCircular: nodesInCycles.has(dep.fileId),
            componentIndex: component.index,
          });
        });
      });

    // Avançar offset para o próximo componente
    componentOffsetX += maxWidth + config.componentSpacing;
  });

  // Posicionar nós isolados (arquivos sem conexões) na parte inferior
  if (isolatedNodes.length > 0) {
    const isolatedY = -300; // Posição Y negativa (acima da árvore principal)
    const isolatedSpacing = config.horizontalSpacing * 0.7; // Espaçamento menor
    const totalIsolatedWidth = (isolatedNodes.length - 1) * isolatedSpacing;
    const startIsolatedX = -totalIsolatedWidth / 2;

    isolatedNodes.forEach((component, index) => {
      const dep = data.dependencies.find((d) => d.fileId === component.nodes[0]);
      if (!dep) return;

      const filePath = data.fileRegistry[dep.fileId] || dep.fileId;
      nodes.push({
        id: dep.fileId,
        x: startIsolatedX + index * isolatedSpacing,
        y: isolatedY,
        filePath: filePath,
        imports: dep.imports,
        importedBy: dep.importedBy,
        isCircular: false,
        componentIndex: component.index,
      });
    });
  }

  return nodes;
}

/**
 * Calcula o layout circular para nós que formam um ciclo completo
 */
export function calculateCircularLayout(
  data: DependencyData,
  cycleNodes: string[],
  radius: number = 150
): GraphNode[] {
  const nodes: GraphNode[] = [];
  const angleStep = (2 * Math.PI) / cycleNodes.length;

  cycleNodes.forEach((nodeId, index) => {
    const angle = -Math.PI / 2 + index * angleStep; // Começar no topo
    const dep = data.dependencies.find((d) => d.fileId === nodeId);
    if (!dep) return;

    const filePath = data.fileRegistry[nodeId] || nodeId;

    nodes.push({
      id: nodeId,
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius,
      filePath: filePath,
      imports: dep.imports,
      importedBy: dep.importedBy,
      isCircular: true,
      componentIndex: 0,
    });
  });

  return nodes;
}

/**
 * Layout Force-Directed: Simulação física com atração/repulsão
 */
export function calculateForceDirectedLayout(
  data: DependencyData,
  components: ConnectedComponent[],
  nodesInCycles: Set<string>,
  config: CanvasConfig
): GraphNode[] {
  const nodes: GraphNode[] = [];
  const iterations = 100;
  const forceStrength = 50;
  const repulsionStrength = 5000;
  const dampening = 0.9;

  // Inicializar nós em posições aleatórias
  data.dependencies.forEach((dep, index) => {
    const angle = (index / data.dependencies.length) * 2 * Math.PI;
    const radius = 200;
    nodes.push({
      id: dep.fileId,
      x: Math.cos(angle) * radius + (Math.random() - 0.5) * 100,
      y: Math.sin(angle) * radius + (Math.random() - 0.5) * 100,
      filePath: data.fileRegistry[dep.fileId] || dep.fileId,
      imports: dep.imports,
      importedBy: dep.importedBy,
      isCircular: nodesInCycles.has(dep.fileId),
      componentIndex: 0,
    });
  });

  // Criar mapa de velocidades
  const velocities = new Map<string, { vx: number; vy: number }>();
  nodes.forEach(node => velocities.set(node.id, { vx: 0, vy: 0 }));

  // Simulação
  for (let iter = 0; iter < iterations; iter++) {
    // Calcular forças
    nodes.forEach(node => {
      let fx = 0;
      let fy = 0;

      // Repulsão entre todos os nós
      nodes.forEach(other => {
        if (node.id === other.id) return;
        const dx = node.x - other.x;
        const dy = node.y - other.y;
        const distance = Math.sqrt(dx * dx + dy * dy) || 1;
        const force = repulsionStrength / (distance * distance);
        fx += (dx / distance) * force;
        fy += (dy / distance) * force;
      });

      // Atração por conexões
      const dep = data.dependencies.find(d => d.fileId === node.id)!;
      [...dep.imports, ...dep.importedBy].forEach(connectedId => {
        const other = nodes.find(n => n.id === connectedId);
        if (!other) return;
        const dx = other.x - node.x;
        const dy = other.y - node.y;
        const distance = Math.sqrt(dx * dx + dy * dy) || 1;
        const force = distance / forceStrength;
        fx += (dx / distance) * force;
        fy += (dy / distance) * force;
      });

      // Atualizar velocidade
      const vel = velocities.get(node.id)!;
      vel.vx = (vel.vx + fx) * dampening;
      vel.vy = (vel.vy + fy) * dampening;
    });

    // Aplicar velocidades
    nodes.forEach(node => {
      const vel = velocities.get(node.id)!;
      node.x += vel.vx;
      node.y += vel.vy;
    });
  }

  return nodes;
}

/**
 * Layout Circular Completo: Todos os nós em um grande círculo
 */
export function calculateCircularCompleteLayout(
  data: DependencyData,
  components: ConnectedComponent[],
  nodesInCycles: Set<string>,
  config: CanvasConfig
): GraphNode[] {
  const nodes: GraphNode[] = [];
  const allNodes = data.dependencies;
  const radius = Math.max(300, allNodes.length * 15);
  const angleStep = (2 * Math.PI) / allNodes.length;

  allNodes.forEach((dep, index) => {
    const angle = -Math.PI / 2 + index * angleStep;
    nodes.push({
      id: dep.fileId,
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius,
      filePath: data.fileRegistry[dep.fileId] || dep.fileId,
      imports: dep.imports,
      importedBy: dep.importedBy,
      isCircular: nodesInCycles.has(dep.fileId),
      componentIndex: 0,
    });
  });

  return nodes;
}

/**
 * Layout Radial: Árvore radial a partir do centro
 */
export function calculateRadialLayout(
  data: DependencyData,
  components: ConnectedComponent[],
  nodesInCycles: Set<string>,
  config: CanvasConfig
): GraphNode[] {
  const nodes: GraphNode[] = [];

  components.forEach((component, compIndex) => {
    const componentDeps = data.dependencies.filter(dep =>
      component.nodes.includes(dep.fileId)
    );

    // Encontrar raiz (nó sem importedBy)
    const roots = componentDeps.filter(dep =>
      dep.importedBy.length === 0 ||
      dep.importedBy.every(id => !component.nodes.includes(id))
    );

    const root = roots.length > 0 ? roots[0] : componentDeps[0];
    const angleOffset = (compIndex * 2 * Math.PI) / components.length;

    // BFS para calcular níveis
    const levels = new Map<string, number>();
    const queue: string[] = [root.fileId];
    levels.set(root.fileId, 0);

    while (queue.length > 0) {
      const current = queue.shift()!;
      const currentLevel = levels.get(current)!;
      const dep = componentDeps.find(d => d.fileId === current)!;

      dep.imports.forEach(importId => {
        if (!levels.has(importId) && component.nodes.includes(importId)) {
          levels.set(importId, currentLevel + 1);
          queue.push(importId);
        }
      });
    }

    // Agrupar por nível
    const nodesByLevel = new Map<number, string[]>();
    componentDeps.forEach(dep => {
      const level = levels.get(dep.fileId) ?? 0;
      if (!nodesByLevel.has(level)) nodesByLevel.set(level, []);
      nodesByLevel.get(level)!.push(dep.fileId);
    });

    // Posicionar nós radialmente
    const maxLevel = Math.max(...Array.from(levels.values()));
    const centerX = compIndex * 600;
    const centerY = 0;

    nodesByLevel.forEach((nodeIds, level) => {
      const radius = level === 0 ? 0 : (level / (maxLevel || 1)) * 400;
      const angleSpan = nodeIds.length === 1 ? 0 : Math.PI * 1.5;
      const angleStep = nodeIds.length === 1 ? 0 : angleSpan / (nodeIds.length - 1);
      const startAngle = angleOffset - angleSpan / 2;

      nodeIds.forEach((nodeId, index) => {
        const angle = startAngle + index * angleStep;
        const dep = componentDeps.find(d => d.fileId === nodeId)!;
        nodes.push({
          id: nodeId,
          x: centerX + Math.cos(angle) * radius,
          y: centerY + Math.sin(angle) * radius,
          filePath: data.fileRegistry[nodeId] || nodeId,
          imports: dep.imports,
          importedBy: dep.importedBy,
          isCircular: nodesInCycles.has(nodeId),
          componentIndex: compIndex,
        });
      });
    });
  });

  return nodes;
}

/**
 * Layout em Camadas (Sugiyama): DAG hierárquico otimizado
 */
export function calculateLayeredLayout(
  data: DependencyData,
  components: ConnectedComponent[],
  nodesInCycles: Set<string>,
  config: CanvasConfig
): GraphNode[] {
  const nodes: GraphNode[] = [];
  let componentOffsetX = 0;

  components.forEach(component => {
    const componentDeps = data.dependencies.filter(dep =>
      component.nodes.includes(dep.fileId)
    );

    // Calcular níveis usando topological sort
    const inDegree = new Map<string, number>();
    const layers: string[][] = [];
    
    componentDeps.forEach(dep => {
      const degree = dep.importedBy.filter(id => 
        component.nodes.includes(id)
      ).length;
      inDegree.set(dep.fileId, degree);
    });

    while (inDegree.size > 0) {
      const layer = Array.from(inDegree.entries())
        .filter(([_, degree]) => degree === 0)
        .map(([id]) => id);

      if (layer.length === 0) {
        // Ciclo detectado, pegar nós restantes
        layer.push(...Array.from(inDegree.keys()));
      }

      layers.push(layer);
      layer.forEach(id => {
        inDegree.delete(id);
        const dep = componentDeps.find(d => d.fileId === id)!;
        dep.imports.forEach(importId => {
          if (inDegree.has(importId)) {
            inDegree.set(importId, inDegree.get(importId)! - 1);
          }
        });
      });
    }

    // Calcular largura máxima
    const maxWidth = Math.max(...layers.map(l => l.length));
    const componentWidth = maxWidth * config.horizontalSpacing;

    // Posicionar nós
    layers.forEach((layer, layerIndex) => {
      const layerWidth = (layer.length - 1) * config.horizontalSpacing;
      const startX = componentOffsetX - layerWidth / 2;

      layer.forEach((nodeId, index) => {
        const dep = componentDeps.find(d => d.fileId === nodeId)!;
        nodes.push({
          id: nodeId,
          x: startX + index * config.horizontalSpacing,
          y: layerIndex * config.verticalSpacing,
          filePath: data.fileRegistry[nodeId] || nodeId,
          imports: dep.imports,
          importedBy: dep.importedBy,
          isCircular: nodesInCycles.has(nodeId),
          componentIndex: component.index,
        });
      });
    });

    componentOffsetX += componentWidth + config.componentSpacing;
  });

  return nodes;
}

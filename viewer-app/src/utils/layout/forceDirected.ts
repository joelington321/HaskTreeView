import { DependencyData, GraphNode, ConnectedComponent, CanvasConfig } from '@/types';
import { createGraphNode } from './nodeHelpers';

/**
 * Layout Force-Directed: Simulação física com forças de atração e repulsão
 */
export function calculateForceDirectedLayout(
  data: DependencyData,
  _components: ConnectedComponent[],
  nodesInCycles: Set<string>,
  _config: CanvasConfig
): GraphNode[] {
  const iterations = 100;
  const forceStrength = 50;
  const repulsionStrength = 5000;
  const dampening = 0.9;

  // Inicializar nós em posições aleatórias (disposição circular)
  const nodes: GraphNode[] = data.dependencies.map((dep, index) => {
    const angle = (index / data.dependencies.length) * 2 * Math.PI;
    const radius = 200;
    return createGraphNode(
      dep.fileId,
      Math.cos(angle) * radius + (Math.random() - 0.5) * 100,
      Math.sin(angle) * radius + (Math.random() - 0.5) * 100,
      data,
      nodesInCycles,
      0
    );
  });

  // Mapa de velocidades
  const velocities = new Map<string, { vx: number; vy: number }>();
  nodes.forEach(node => velocities.set(node.id, { vx: 0, vy: 0 }));

  // Executar simulação
  for (let iter = 0; iter < iterations; iter++) {
    applyForces(nodes, data, velocities, forceStrength, repulsionStrength, dampening);
  }

  return nodes;
}

/**
 * Aplica forças de atração e repulsão aos nós
 */
function applyForces(
  nodes: GraphNode[],
  data: DependencyData,
  velocities: Map<string, { vx: number; vy: number }>,
  forceStrength: number,
  repulsionStrength: number,
  dampening: number
) {
  // Calcular forças
  nodes.forEach(node => {
    let fx = 0;
    let fy = 0;

    // Repulsão entre todos os nós
    nodes.forEach(other => {
      if (node.id === other.id) return;
      const { force, dx, dy } = calculateRepulsion(node, other, repulsionStrength);
      fx += dx * force;
      fy += dy * force;
    });

    // Atração por conexões
    const dep = data.dependencies.find(d => d.fileId === node.id)!;
    [...dep.imports, ...dep.importedBy].forEach(connectedId => {
      const other = nodes.find(n => n.id === connectedId);
      if (!other) return;
      const { force, dx, dy } = calculateAttraction(node, other, forceStrength);
      fx += dx * force;
      fy += dy * force;
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

/**
 * Calcula força de repulsão entre dois nós
 */
function calculateRepulsion(
  node: GraphNode,
  other: GraphNode,
  repulsionStrength: number
) {
  const dx = node.x - other.x;
  const dy = node.y - other.y;
  const distance = Math.sqrt(dx * dx + dy * dy) || 1;
  const force = repulsionStrength / (distance * distance);
  
  return {
    force,
    dx: dx / distance,
    dy: dy / distance,
  };
}

/**
 * Calcula força de atração entre nós conectados
 */
function calculateAttraction(
  node: GraphNode,
  other: GraphNode,
  forceStrength: number
) {
  const dx = other.x - node.x;
  const dy = other.y - node.y;
  const distance = Math.sqrt(dx * dx + dy * dy) || 1;
  const force = distance / forceStrength;
  
  return {
    force,
    dx: dx / distance,
    dy: dy / distance,
  };
}

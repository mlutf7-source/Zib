import type { Wall, Point } from './types';
import { distance } from './geometry';

/**
 * حساب مساحة حدود المبنى الخارجية بدقة، مع دعم الأشكال غير المستطيلة (L, U...)
 * يفترض أن wall.start و wall.end هما الوجه الداخلي للجدار
 */
export function computeExteriorFootprintArea(extWalls: Wall[]): number {
  if (extWalls.length < 3) return 0;

  const EPS = 0.05;
  const nodes: Point[] = [];
  const findNode = (p: Point): number => {
    for (let i = 0; i < nodes.length; i++) {
      if (distance(nodes[i], p) < EPS) return i;
    }
    nodes.push({ x: p.x, y: p.y });
    return nodes.length - 1;
  };

  interface Edge { a: number; b: number; wall: Wall; }
  const edges: Edge[] = extWalls.map(w => ({
    a: findNode(w.start),
    b: findNode(w.end),
    wall: w,
  }));

  const adj = new Map<number, Edge[]>();
  for (const e of edges) {
    if (!adj.has(e.a)) adj.set(e.a, []);
    if (!adj.has(e.b)) adj.set(e.b, []);
    adj.get(e.a)!.push(e);
    adj.get(e.b)!.push(e);
  }

  // نقطة بداية (درجة 2)
  let startNode = -1;
  for (const [n, list] of adj) {
    if (list.length === 2) { startNode = n; break; }
  }
  if (startNode < 0) return 0;

  // تتبع المضلع الداخلي
  const orderedNodes: number[] = [];
  const orderedEdges: Edge[] = [];
  const visited = new Set<Edge>();
  let current = startNode;
  let safety = 0;

  while (safety++ < extWalls.length + 5) {
    const neighbors = (adj.get(current) || []).filter(e => !visited.has(e));
    if (neighbors.length === 0) break;
    const nextEdge = neighbors[0];
    visited.add(nextEdge);
    const next = nextEdge.a === current ? nextEdge.b : nextEdge.a;
    orderedNodes.push(current);
    orderedEdges.push(nextEdge);
    current = next;
    if (current === startNode) break;
  }

  if (orderedNodes.length < 3) return 0;

  const innerPoly: Point[] = orderedNodes.map(i => nodes[i]);

  // اتجاه الدوران
  let signedArea = 0;
  for (let i = 0; i < innerPoly.length; i++) {
    const j = (i + 1) % innerPoly.length;
    signedArea += innerPoly[i].x * innerPoly[j].y - innerPoly[j].x * innerPoly[i].y;
  }
  const ccw = signedArea > 0;

  // إزاحة كل حافة للخارج بمقدار سماكة جدارها
  const offsetEdges: { a: Point; dir: Point }[] = [];
  for (let i = 0; i < innerPoly.length; i++) {
    const p1 = innerPoly[i];
    const p2 = innerPoly[(i + 1) % innerPoly.length];
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const len = Math.hypot(dx, dy) || 1;
    const ux = dx / len, uy = dy / len;
    const thickness = orderedEdges[i]?.wall.thickness ?? 0.3;
    const sign = ccw ? 1 : -1;
    const nx = sign * uy;
    const ny = -sign * ux;
    offsetEdges.push({
      a: { x: p1.x + nx * thickness, y: p1.y + ny * thickness },
      dir: { x: ux, y: uy },
    });
  }

  // رؤوس المضلع الخارجي (تقاطعات الحواف المُزاحة)
  const outerPoly: Point[] = [];
  for (let i = 0; i < innerPoly.length; i++) {
    const prevIdx = (i - 1 + innerPoly.length) % innerPoly.length;
    const e1 = offsetEdges[prevIdx];
    const e2 = offsetEdges[i];
    const denom = e1.dir.x * e2.dir.y - e1.dir.y * e2.dir.x;
    if (Math.abs(denom) < 1e-9) {
      outerPoly.push({ x: e2.a.x, y: e2.a.y });
      continue;
    }
    const t = ((e2.a.x - e1.a.x) * e2.dir.y - (e2.a.y - e1.a.y) * e2.dir.x) / denom;
    outerPoly.push({
      x: e1.a.x + e1.dir.x * t,
      y: e1.a.y + e1.dir.y * t,
    });
  }

  // Shoelace
  let area = 0;
  for (let i = 0; i < outerPoly.length; i++) {
    const j = (i + 1) % outerPoly.length;
    area += outerPoly[i].x * outerPoly[j].y - outerPoly[j].x * outerPoly[i].y;
  }
  return Math.abs(area / 2);
}

export function key(point) {
  return `${point.x},${point.y}`;
}

export function isBlocked(layout, x, y) {
  if (x < 0 || y < 0 || x >= layout.width || y >= layout.height) return true;
  return layout.blocked.some(([bx, by]) => bx === x && by === y);
}

export function findPath(layout, start, goal) {
  const safeStart = { x: Math.round(start.x), y: Math.round(start.y) };
  const safeGoal = { x: Math.round(goal.x), y: Math.round(goal.y) };
  if (isBlocked(layout, safeGoal.x, safeGoal.y)) return [];

  const queue = [safeStart];
  const cameFrom = new Map([[key(safeStart), null]]);
  const directions = [[1, 0], [-1, 0], [0, 1], [0, -1]];

  while (queue.length) {
    const current = queue.shift();
    if (current.x === safeGoal.x && current.y === safeGoal.y) break;
    for (const [dx, dy] of directions) {
      const next = { x: current.x + dx, y: current.y + dy };
      const nextKey = key(next);
      if (cameFrom.has(nextKey) || isBlocked(layout, next.x, next.y)) continue;
      cameFrom.set(nextKey, current);
      queue.push(next);
    }
  }

  if (!cameFrom.has(key(safeGoal))) return [];
  const path = [];
  let current = safeGoal;
  while (current) {
    path.unshift(current);
    current = cameFrom.get(key(current));
  }
  return path;
}

export function isoToScreen(point, tileW = 72, tileH = 36) {
  return {
    left: (point.x - point.y) * (tileW / 2),
    top: (point.x + point.y) * (tileH / 2)
  };
}

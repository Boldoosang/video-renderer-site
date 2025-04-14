// Union-Find (Disjoint-Set) data structure
class UnionFind {
  private parent: number[];

  constructor(size: number) {
    this.parent = new Array(size).fill(0).map((_, idx) => idx);
  }

  find(x: number): number {
    if (this.parent[x] !== x) {
      this.parent[x] = this.find(this.parent[x]); // Path compression
    }
    return this.parent[x];
  }

  union(x: number, y: number): void {
    const rootX = this.find(x);
    const rootY = this.find(y);
    if (rootX !== rootY) {
      this.parent[rootY] = rootX; // Union the roots
    }
  }
}

export default UnionFind;

import * as THREE from './vendor/three/three.module.min.js';

/** Deterministic area-weighted sampling in the GLB root's local coordinates. */
export function sampleSurfacePoints(root, count, seed = 1471) {
  const triangles = [], cumulative = [];
  const a = new THREE.Vector3(), b = new THREE.Vector3(), c = new THREE.Vector3();
  const edge = new THREE.Vector3(), cross = new THREE.Vector3();
  root.updateWorldMatrix(true, true);
  const inverse = root.matrixWorld.clone().invert();
  let total = 0;
  root.traverse(mesh => {
    if (!mesh.isMesh) return;
    const transform = new THREE.Matrix4().multiplyMatrices(inverse, mesh.matrixWorld);
    const position = mesh.geometry.attributes.position, index = mesh.geometry.index;
    const length = index ? index.count : position.count;
    for (let i = 0; i < length; i += 3) {
      a.fromBufferAttribute(position, index ? index.getX(i) : i).applyMatrix4(transform);
      b.fromBufferAttribute(position, index ? index.getX(i + 1) : i + 1).applyMatrix4(transform);
      c.fromBufferAttribute(position, index ? index.getX(i + 2) : i + 2).applyMatrix4(transform);
      const area = cross.subVectors(b, a).cross(edge.subVectors(c, a)).length() * .5;
      if (area <= 1e-10) continue;
      total += area;
      cumulative.push(total); triangles.push([...a.toArray(), ...b.toArray(), ...c.toArray()]);
    }
  });
  if (!total) throw new Error('Cannot sample an empty model');
  function random() { seed = (1664525 * seed + 1013904223) >>> 0; return seed / 4294967296; }
  const output = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const target = random() * total;
    let low = 0, high = cumulative.length - 1;
    while (low < high) { const mid = (low + high) >>> 1; if (cumulative[mid] < target) low = mid + 1; else high = mid; }
    const tri = triangles[low], r = Math.sqrt(random()), s = random();
    const weights = [1 - r, r * (1 - s), r * s];
    for (let axis = 0; axis < 3; axis++) output[i * 3 + axis] = weights[0] * tri[axis] + weights[1] * tri[axis + 3] + weights[2] * tri[axis + 6];
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(output, 3));
  geometry.computeBoundingSphere();
  return geometry;
}

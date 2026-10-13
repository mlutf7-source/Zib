import React from 'react';
import * as THREE from 'three';
import { getCurvedWallGeometry } from '../../core/curvedWallGeometry';
import type { Wall } from '../../core/types';
import { INTERIOR_PAINT_COLOR } from './helpers/wallHelpers';
import { useSectionPlanes } from './SectionContext';

interface Props {
  wall: Wall;
  height: number;
  matProps: any;
  texture: THREE.Texture | null;
  repeatScale: number;
  isCut?: boolean;
  cutColor?: string;
}

const ARC_SEGMENTS = 32;

export const CurvedWallMesh: React.FC<Props> = ({
  wall,
  height,
  matProps,
  texture,
  repeatScale,
  isCut = false,
  cutColor = '#B0B0B0',
}) => {
  const clippingPlanes = useSectionPlanes();
  const geometry = React.useMemo(() => {
    const geo = getCurvedWallGeometry(wall);
    if (!geo) return null;

    const span = geo.anticlockwise ? geo.startAngle - geo.endAngle : geo.endAngle - geo.startAngle;
    const dir = geo.anticlockwise ? -1 : 1;

    const outer: THREE.Vector3[] = [];
    const inner: THREE.Vector3[] = [];

    for (let i = 0; i <= ARC_SEGMENTS; i++) {
      const angle = geo.startAngle + dir * span * (i / ARC_SEGMENTS);
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      outer.push(new THREE.Vector3(geo.center.x + cos * geo.outerRadius, 0, geo.center.y + sin * geo.outerRadius));
      inner.push(new THREE.Vector3(geo.center.x + cos * geo.innerRadius, 0, geo.center.y + sin * geo.innerRadius));
    }

    const positions: number[] = [];
    const normals: number[] = [];
    const uvs: number[] = [];
    const indices: number[] = [];

    const outerLen = geo.outerRadius * Math.abs(span);
    const innerLen = geo.innerRadius * Math.abs(span);

    const addSide = (bottomA: THREE.Vector3, topA: THREE.Vector3, bottomB: THREE.Vector3, topB: THREE.Vector3, isExterior: boolean) => {
      const baseIndex = positions.length / 3;
      positions.push(bottomA.x, bottomA.y, bottomA.z);
      positions.push(topA.x, topA.y, topA.z);
      positions.push(bottomB.x, bottomB.y, bottomB.z);
      positions.push(topB.x, topB.y, topB.z);

      const ab = new THREE.Vector3().subVectors(bottomB, bottomA).normalize();
      const up = new THREE.Vector3(0, 1, 0);
      const n = new THREE.Vector3().crossVectors(ab, up).normalize();
      if (!isExterior) n.negate();
      normals.push(n.x, n.y, n.z, n.x, n.y, n.z, n.x, n.y, n.z, n.x, n.y, n.z);

      const sideLen = isExterior ? outerLen : innerLen;
      uvs.push(0, 0, 0, 1, 1, 0, 1, 1);
      // scale UVs by wall length for proper texture repeat
      uvs[2] = sideLen * repeatScale; uvs[3] = height * repeatScale;
      uvs[6] = sideLen * repeatScale; uvs[7] = height * repeatScale;

      indices.push(baseIndex, baseIndex + 1, baseIndex + 2);
      indices.push(baseIndex + 1, baseIndex + 3, baseIndex + 2);
    };

    const isExterior = wall.type === 'exterior';
    const sign = wall.normalSign ?? 1;

    for (let i = 0; i < ARC_SEGMENTS; i++) {
      // exterior face (outer arc)
      addSide(outer[i], outer[i].clone().setY(height), outer[i + 1], outer[i + 1].clone().setY(height), true);
      // interior face (inner arc)
      addSide(inner[i + 1], inner[i + 1].clone().setY(height), inner[i], inner[i].clone().setY(height), false);
    }

    // top cap
    for (let i = 0; i < ARC_SEGMENTS; i++) {
      const baseIndex = positions.length / 3;
      positions.push(outer[i].x, height, outer[i].z);
      positions.push(inner[i].x, height, inner[i].z);
      positions.push(outer[i + 1].x, height, outer[i + 1].z);
      positions.push(inner[i + 1].x, height, inner[i + 1].z);
      normals.push(0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0);
      uvs.push(0, 0, 0, 1, 1, 0, 1, 1);
      indices.push(baseIndex, baseIndex + 2, baseIndex + 1);
      indices.push(baseIndex + 2, baseIndex + 3, baseIndex + 1);
    }

    // bottom cap
    for (let i = 0; i < ARC_SEGMENTS; i++) {
      const baseIndex = positions.length / 3;
      positions.push(outer[i].x, 0, outer[i].z);
      positions.push(inner[i].x, 0, inner[i].z);
      positions.push(outer[i + 1].x, 0, outer[i + 1].z);
      positions.push(inner[i + 1].x, 0, inner[i + 1].z);
      normals.push(0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0);
      uvs.push(0, 0, 0, 1, 1, 0, 1, 1);
      indices.push(baseIndex, baseIndex + 1, baseIndex + 2);
      indices.push(baseIndex + 2, baseIndex + 1, baseIndex + 3);
    }

    // end caps (two flat ends of the arc)
    const addEndCap = (idx: number) => {
      const o = outer[idx];
      const inr = inner[idx];
      const baseIndex = positions.length / 3;
      positions.push(o.x, 0, o.z);
      positions.push(o.x, height, o.z);
      positions.push(inr.x, 0, inr.z);
      positions.push(inr.x, height, inr.z);

      const capNormal = new THREE.Vector3(o.x - geo.center.x, 0, o.z - geo.center.y).normalize();
      normals.push(capNormal.x, 0, capNormal.z, capNormal.x, 0, capNormal.z, capNormal.x, 0, capNormal.z, capNormal.x, 0, capNormal.z);
      uvs.push(0, 0, 0, 1, wall.thickness * repeatScale, 0, wall.thickness * repeatScale, 1);
      if (idx === 0) {
        indices.push(baseIndex, baseIndex + 2, baseIndex + 1);
        indices.push(baseIndex + 2, baseIndex + 3, baseIndex + 1);
      } else {
        indices.push(baseIndex, baseIndex + 1, baseIndex + 2);
        indices.push(baseIndex + 2, baseIndex + 1, baseIndex + 3);
      }
    };
    addEndCap(0);
    addEndCap(ARC_SEGMENTS);

    const geo3d = new THREE.BufferGeometry();
    geo3d.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geo3d.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
    geo3d.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geo3d.setIndex(indices);
    return geo3d;
  }, [wall, height, repeatScale]);

  const materials = React.useMemo(() => {
    if (!geometry) return [];

    const exteriorMaterial = (() => {
      if (!texture) {
        return new THREE.MeshStandardMaterial({ ...matProps, clippingPlanes });
      }
      const tex = texture.clone();
      tex.needsUpdate = true;
      tex.repeat.set(1, 1);
      return new THREE.MeshStandardMaterial({ ...matProps, map: tex, clippingPlanes });
    })();

    const interiorMaterial = new THREE.MeshStandardMaterial({
      color: INTERIOR_PAINT_COLOR,
      roughness: 0.9,
      metalness: 0.0,
      clippingPlanes,
    });

    const cutMaterial = new THREE.MeshStandardMaterial({
      color: cutColor,
      roughness: 0.95,
      metalness: 0.0,
      clippingPlanes,
    });

    const isExterior = wall.type === 'exterior';
    const topMaterial = isCut ? cutMaterial : (isExterior ? exteriorMaterial : interiorMaterial);
    const neutralMaterial = isExterior ? exteriorMaterial : interiorMaterial;

    // Material order: exterior faces, interior faces, top, bottom, end1, end2
    return [exteriorMaterial, interiorMaterial, topMaterial, neutralMaterial, neutralMaterial, neutralMaterial];
  }, [geometry, matProps, texture, repeatScale, isCut, cutColor, clippingPlanes, wall.type]);

  if (!geometry || materials.length === 0) return null;

  return (
    <mesh geometry={geometry} castShadow receiveShadow>
      {materials.map((mat, i) => (
        <primitive key={i} object={mat} attach={`material-${i}`} />
      ))}
    </mesh>
  );
};

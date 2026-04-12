import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';

const Stars = (props: any) => {
  const ref = useRef<any>(null);
  const positions = useMemo(() => {
    const count = 2000;
    const radius = 1.5;
    const p = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      let x = Math.random() * 2 - 1;
      let y = Math.random() * 2 - 1;
      let z = Math.random() * 2 - 1;
      const mag = Math.sqrt(x * x + y * y + z * z) || 1;
      x = (x / mag) * (Math.random() * radius);
      y = (y / mag) * (Math.random() * radius);
      z = (z / mag) * (Math.random() * radius);
      const idx = i * 3;
      p[idx] = x;
      p[idx + 1] = y;
      p[idx + 2] = z;
    }
    return p;
  }, []);

  useFrame((state, delta) => {
    if (ref.current) {
      ref.current.rotation.x -= delta / 10;
      ref.current.rotation.y -= delta / 15;
    }
  });

  return (
    <group rotation={[0, 0, Math.PI / 4]}>
      <Points ref={ref} positions={positions} stride={3} frustumCulled={false} {...props}>
        <PointMaterial
          transparent
          color="#10b981"
          size={0.002}
          sizeAttenuation={true}
          depthWrite={false}
        />
      </Points>
    </group>
  );
};

const Background3D: React.FC = () => {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none">
      <Canvas camera={{ position: [0, 0, 1] }}>
        <Stars />
      </Canvas>
    </div>
  );
};

export default Background3D;

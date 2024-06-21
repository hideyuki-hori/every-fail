import * as THREE from 'three'

const canvas = document.querySelector('canvas')!
const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
const renderer = new THREE.WebGLRenderer({ canvas, alpha: true })
renderer.setSize(window.innerWidth, window.innerHeight)

// パーティクルシステムの作成
const particleCount = 80000
const particles = new THREE.BufferGeometry()
const positions = new Float32Array(particleCount * 3)
const colors = new Float32Array(particleCount * 3)
const sizes = new Float32Array(particleCount)
const lifetimes = new Float32Array(particleCount)
const particleTypes = new Float32Array(particleCount)

for (let i = 0; i < particleCount; i++) {
  const i3 = i * 3
  const angle = Math.random() * Math.PI * 2
  const height = Math.pow(Math.random(), 0.5)
  const radius = (1 - height) * 0.3 * Math.random()

  positions[i3] = Math.cos(angle) * radius
  positions[i3 + 1] = height - 0.1
  positions[i3 + 2] = Math.sin(angle) * radius

  colors[i3] = 1
  colors[i3 + 1] = 0.5
  colors[i3 + 2] = 0

  sizes[i] = (1 - height) * 0.015 + 0.005
  lifetimes[i] = Math.random()

  // 0: 通常の炎, 1: 火の粉 (火の粉の割合を10%に増加)
  particleTypes[i] = Math.random() < 0.1 ? 1 : 0
}

particles.setAttribute('position', new THREE.BufferAttribute(positions, 3))
particles.setAttribute('color', new THREE.BufferAttribute(colors, 3))
particles.setAttribute('size', new THREE.BufferAttribute(sizes, 1))
particles.setAttribute('lifetime', new THREE.BufferAttribute(lifetimes, 1))
particles.setAttribute('particleType', new THREE.BufferAttribute(particleTypes, 1))

// カスタムシェーダーマテリアル
const particleMaterial = new THREE.ShaderMaterial({
  uniforms: {
    time: { value: 0 },
  },
  vertexShader: `
    attribute float size;
    attribute float lifetime;
    attribute float particleType;
    varying vec3 vColor;
    uniform float time;

    // Simplex 3D Noise
    vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
    vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}
    float snoise(vec3 v){
      const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
      const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);
      vec3 i  = floor(v + dot(v, C.yyy) );
      vec3 x0 =   v - i + dot(i, C.xxx) ;
      vec3 g = step(x0.yzx, x0.xyz);
      vec3 l = 1.0 - g;
      vec3 i1 = min( g.xyz, l.zxy );
      vec3 i2 = max( g.xyz, l.zxy );
      vec3 x1 = x0 - i1 + 1.0 * C.xxx;
      vec3 x2 = x0 - i2 + 2.0 * C.xxx;
      vec3 x3 = x0 - 1. + 3.0 * C.xxx;
      i = mod(i, 289.0 );
      vec4 p = permute( permute( permute(
                i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
              + i.y + vec4(0.0, i1.y, i2.y, 1.0 ))
              + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));
      float n_ = 1.0/7.0;
      vec3  ns = n_ * D.wyz - D.xzx;
      vec4 j = p - 49.0 * floor(p * ns.z *ns.z);
      vec4 x_ = floor(j * ns.z);
      vec4 y_ = floor(j - 7.0 * x_ );
      vec4 x = x_ *ns.x + ns.yyyy;
      vec4 y = y_ *ns.x + ns.yyyy;
      vec4 h = 1.0 - abs(x) - abs(y);
      vec4 b0 = vec4( x.xy, y.xy );
      vec4 b1 = vec4( x.zw, y.zw );
      vec4 s0 = floor(b0)*2.0 + 1.0;
      vec4 s1 = floor(b1)*2.0 + 1.0;
      vec4 sh = -step(h, vec4(0.0));
      vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
      vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;
      vec3 p0 = vec3(a0.xy,h.x);
      vec3 p1 = vec3(a0.zw,h.y);
      vec3 p2 = vec3(a1.xy,h.z);
      vec3 p3 = vec3(a1.zw,h.w);
      vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
      p0 *= norm.x;
      p1 *= norm.y;
      p2 *= norm.z;
      p3 *= norm.w;
      vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
      m = m * m;
      return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1),
                                    dot(p2,x2), dot(p3,x3) ) );
    }

    void main() {
      vColor = color;
      vec3 pos = position;

      float t = fract(time * 0.5 + lifetime);
      float noiseScale = 2.0;
      float noiseIntensity = 0.2;

      if (particleType == 0.0) {  // 通常の炎パーティクル
        float yOffset = t * 1.2;
        pos.y += yOffset;

        float noise = snoise(vec3(pos.x * noiseScale, pos.y * noiseScale, time * 0.5));
        pos.x += noise * noiseIntensity * (1.0 - yOffset);
        pos.z += snoise(vec3(pos.z * noiseScale, pos.y * noiseScale, time * 0.5 + 100.0)) * noiseIntensity * (1.0 - yOffset);

        float centralizing = smoothstep(0.0, 1.0, yOffset * 0.5);
        pos.x *= (1.0 - centralizing * 0.4);  // 中心に寄せる効果を弱める
        pos.z *= (1.0 - centralizing * 0.4);  // 中心に寄せる効果を弱める

        vec3 baseColor = vec3(1.0, 0.7, 0.3);
        vec3 tipColor = vec3(0.7, 0.0, 0.0);
        vColor = mix(baseColor, tipColor, smoothstep(0.0, 0.7, yOffset));

        gl_PointSize = size * (1.0 - yOffset * 0.5) * (300.0 / length(modelViewMatrix * vec4(pos, 1.0)));
      } else {  // 火の粉パーティクル
        float sparkLife = t * 1.5;  // 火の粉の寿命を少し長くする
        pos.y += sparkLife * 1.2;  // 上昇速度を少し遅くする

        // より強い横方向の動き
        float horizontalIntensity = 0.8;  // 横方向の動きの強さ
        pos.x += snoise(vec3(pos.x * 10.0, time, pos.z * 10.0)) * horizontalIntensity * sparkLife;
        pos.z += snoise(vec3(pos.z * 10.0, time + 100.0, pos.x * 10.0)) * horizontalIntensity * sparkLife;

        // 螺旋状の動きを追加
        float spiralIntensity = 0.3;
        float spiralAngle = sparkLife * 10.0;
        pos.x += sin(spiralAngle) * spiralIntensity * sparkLife;
        pos.z += cos(spiralAngle) * spiralIntensity * sparkLife;

        vColor = mix(vec3(1.0, 0.7, 0.3), vec3(1.0, 0.3, 0.0), sparkLife);

        gl_PointSize = size * (1.0 - sparkLife * 0.7) * (200.0 / length(modelViewMatrix * vec4(pos, 1.0)));
      }

      gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    }
  `,
  fragmentShader: `
    varying vec3 vColor;
    void main() {
      float dist = length(gl_PointCoord - vec2(0.5));
      if (dist > 0.5) discard;
      float alpha = 1.0 - smoothstep(0.3, 0.5, dist);
      gl_FragColor = vec4(vColor, alpha);
    }
  `,
  blending: THREE.AdditiveBlending,
  depthWrite: false,
  transparent: true,
  vertexColors: true,
})

const particleSystem = new THREE.Points(particles, particleMaterial)
scene.add(particleSystem)

camera.position.z = 2

function animate(time: number) {
  requestAnimationFrame(animate)

  time *= 0.001; // 秒単位に変換
  (particleMaterial.uniforms.time as { value: number }).value = time

  particleSystem.rotation.y += 0.001
  particleSystem.position.z -= 0.005

  if (particleSystem.position.z < -10) particleSystem.position.z = 5

  renderer.render(scene, camera)
}

animate(0)

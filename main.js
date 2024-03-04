import * as THREE from 'three';

// Configuración inicial de la escena, la cámara y el renderizador
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.3, 1000);
camera.position.set(0, 0, 5);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Añadir iluminación
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);
const pointLight = new THREE.PointLight(0xffffff, 1);
pointLight.position.set(5, 5, 5);
scene.add(pointLight);

const generalRadius = 0.08; // Este valor controla la distancia general de las circunferencias al centro

const params = [
    { "waveAmplitude": 0.006, "waveFrequency": 4, "speed": 5 },
    { "waveAmplitude": 0.001, "waveFrequency": 4.5, "speed": 5.5 },
    { "waveAmplitude": 0.005, "waveFrequency": 3.5, "speed": 4.5 },
    { "waveAmplitude": 0.0008, "waveFrequency": 4.2, "speed": 5.2 },
    { "waveAmplitude": 0.0009, "waveFrequency": 3.8, "speed": 4.8 },
    { "waveAmplitude": 0.0012, "waveFrequency": 3.7, "speed": 5.0 },
    { "waveAmplitude": 0.0015, "waveFrequency": 4.0, "speed": 4.5 },
]


const circunferencias = [];

params.forEach((param, index) => {
    const geometry = new THREE.TorusGeometry(2, 0.003, 16, 120);
    const material = new THREE.MeshStandardMaterial({ color: 0x5555ff, emissive: 0x222222, side: THREE.DoubleSide });
    const circunference = new THREE.Mesh(geometry, material);

    circunference.position.x = Math.cos((index / params.length) * 2 * Math.PI) * generalRadius;
    circunference.position.y = Math.sin((index / params.length) * 2 * Math.PI) * generalRadius;

    circunference.rotation.z = Math.PI + index / 8 * Math.PI; // Ajustado para que las ondas no empiecen en el centro

    scene.add(circunference);
    circunferencias.push({ mesh: circunference, param });
});

const particleCount = 1000; // Número de partículas
const particlesGeometry = new THREE.BufferGeometry();
const positions = new Float32Array(particleCount * 3); // Cada partícula necesita x, y, z

for (let i = 0; i < particleCount; i++) {
    // Elegir una circunferencia al azar para posicionar la partícula cerca de ella
    const circunferenceIndex = Math.floor(Math.random() * params.length);
    const angle = Math.random() * Math.PI * 2; // Ángulo aleatorio para la posición en el círculo

    // Calcular la posición x e y basada en el ángulo y el radio
    const x = Math.cos(angle) * (2 + (Math.random() - 0.5) * 0.1); // Ajuste ligero para dispersión
    const y = Math.sin(angle) * (2 + (Math.random() - 0.5) * 0.1); // Ajuste ligero para dispersión

    // Posiciona la partícula cerca de la circunferencia elegida, con un ligero desplazamiento en z para dar profundidad
    positions[i * 3] = x + circunferencias[circunferenceIndex].mesh.position.x;
    positions[i * 3 + 1] = y + circunferencias[circunferenceIndex].mesh.position.y;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 0.2; // Desplazamiento en z
}


particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

const particlesMaterial = new THREE.PointsMaterial({
    color: 0x88ccee,
    size: 0.02, // Tamaño de las partículas
    blending: THREE.AdditiveBlending, // Esto hace que las partículas tengan un efecto de brillo
    transparent: true,
});

const particleSystem = new THREE.Points(particlesGeometry, particlesMaterial);
scene.add(particleSystem);


function animate(time) {

    requestAnimationFrame(animate);

    circunferencias.forEach(({ mesh, param }) => {
        const positions = mesh.geometry.attributes.position;
        const count = positions.count;
        const originalPositions = positions.array.slice(); // Copia del array original para mantener las posiciones iniciales

        // Aplicar la animación de ondas
        for (let i = 0; i < count; i++) {
            const y = originalPositions[i * 3 + 1]; // Componente "y" de cada vértice
            const wave = Math.sin(y * param.waveFrequency + time * 0.001 * param.speed) * param.waveAmplitude;

            positions.array[i * 3] = originalPositions[i * 3] + originalPositions[i * 3] * wave;
        }

        positions.needsUpdate = true;
    });

    renderer.render(scene, camera);


    // Animar las partículas
    const positions = particleSystem.geometry.attributes.position.array;
    for (let i = 0; i < particleCount; i++) {
        // Selecciona una circunferencia basándose en la partícula
        const circunferenceIndex = Math.floor(i / (particleCount / params.length)) % params.length;
        const param = params[circunferenceIndex];

        const ix = i * 3;
        const iy = i * 3 + 1;

        // Posición original (basado en la asignación inicial de la partícula)
        const xOriginal = positions[ix] - circunferencias[circunferenceIndex].mesh.position.x;
        const yOriginal = positions[iy] - circunferencias[circunferenceIndex].mesh.position.y;

        // Aplicar movimiento de onda a las partículas basándose en los parámetros de la circunferencia cercana
        const wave = Math.sin((xOriginal + yOriginal) * param.waveFrequency + time * 0.001 * param.speed) * param.waveAmplitude;

        positions[ix] = xOriginal + xOriginal * wave + circunferencias[circunferenceIndex].mesh.position.x;
        positions[iy] = yOriginal + yOriginal * wave + circunferencias[circunferenceIndex].mesh.position.y;
    }

    particleSystem.geometry.attributes.position.needsUpdate = true;

    renderer.render(scene, camera);

}

animate(0);
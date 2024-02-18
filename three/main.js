import * as THREE from 'three';

// Configuración inicial de la escena, la cámara y el renderizador
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
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

// Parámetros fijos para la animación
const generalRadius = 0.02; // Este valor controla la distancia general de las circunferencias al centro

const params = [
    {
        waveAmplitude: 0.006, // Amplitud de la onda
        waveFrequency: 4,      // Frecuencia de la onda
        speed: 5               // Velocidad de la animación
    },
    {
        waveAmplitude: 0.0010, // Amplitud de la onda
        waveFrequency: 4.5,    // Frecuencia de la onda
        speed: 5.5             // Velocidad de la animación
    },
    {
        waveAmplitude: 0.005, // Amplitud de la onda
        waveFrequency: 3.5,    // Frecuencia de la onda
        speed: 4.5             // Velocidad de la animación
    },
    {
        waveAmplitude: 0.0008, // Amplitud de la onda
        waveFrequency: 4.2,    // Frecuencia de la onda
        speed: 5.2             // Velocidad de la animación
    },
    {
        waveAmplitude: 0.0009, // Amplitud de la onda
        waveFrequency: 3.8,    // Frecuencia de la onda
        speed: 4.8             // Velocidad de la animación
    }
];

// Función de animación
// Array para almacenar múltiples circunferencias
const circunferencias = [];

// Crear múltiples circunferencias basadas en los parámetros
params.forEach((param, index) => {
    const geometry = new THREE.TorusGeometry(2, 0.005, 16, 120);
    const material = new THREE.MeshStandardMaterial({ color: 0x5555ff, emissive: 0x222222, side: THREE.DoubleSide });
    const torus = new THREE.Mesh(geometry, material);

    // Usar 'generalRadius' para posicionar las circunferencias
    torus.position.x = Math.cos((index / params.length) * 2 * Math.PI) * generalRadius;
    torus.position.y = Math.sin((index / params.length) * 2 * Math.PI) * generalRadius;

    // Aplicar una rotación aleatoria en los ejes X e Y
    torus.rotation.z = Math.random() * Math.PI; // Rotación aleatoria entre 0 y π radianes

    scene.add(torus);
    circunferencias.push({ mesh: torus, param });
});



// Función de animación
function animate(time) {
    requestAnimationFrame(animate);

    // Animar cada circunferencia con su respectivo conjunto de parámetros
    circunferencias.forEach(({ mesh, param }) => {
        const positions = mesh.geometry.attributes.position;
        const count = positions.count;
        const originalPositions = positions.array.slice(); // Copia del array original para mantener las posiciones iniciales

        // Aplicar la animación de ondas
        for (let i = 0; i < count; i++) {
            const y = originalPositions[i * 3 + 1]; // Componente y de cada vértice
            const wave = Math.sin(y * param.waveFrequency + time * 0.001 * param.speed) * param.waveAmplitude;

            positions.array[i * 3] = originalPositions[i * 3] + originalPositions[i * 3] * wave; // x
            positions.array[i * 3 + 2] = originalPositions[i * 3 + 2] + originalPositions[i * 3 + 2] * wave; // z
        }

        positions.needsUpdate = true;
    });

    renderer.render(scene, camera);
}

animate(0);
import * as THREE from 'three';

// Configuración inicial de la escena, la cámara y el renderizador
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 0, 5);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Creación de la geometría base: una circunferencia fina
const geometry = new THREE.TorusGeometry(1, 0.005, 16, 100);

// Crear material
const material = new THREE.MeshStandardMaterial({ color: 0x5555ff, emissive: 0x222222, side: THREE.DoubleSide });

// Crear la malla y añadirla a la escena
const torus = new THREE.Mesh(geometry, material);
scene.add(torus);

// Añadir iluminación
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);
const pointLight = new THREE.PointLight(0xffffff, 1);
pointLight.position.set(5, 5, 5);
scene.add(pointLight);

// Parámetros fijos para la animación
const params = {
    waveAmplitude: 0.006,  // Amplitud de la onda
    waveFrequency: 6,      // Frecuencia de la onda
    speed: 14              // Velocidad de la animación
};

// Función de easing: easeInOutSine
function easeInOutSine(x) {
    return -(Math.cos(Math.PI * x) - 1) / 2;
}

// Función de animación
function animate(time) {
    requestAnimationFrame(animate);

    // Acceder a la posición de los vértices
    const positions = torus.geometry.attributes.position;
    const count = positions.count;

    // Calcular un factor de progresión basado en el tiempo, con easing
    let progression = (time * 0.001 * params.speed) % 1; // Valor que oscila entre 0 y 1
    let easedProgression = easeInOutSine(progression); // Aplicar la función de easing

    // Actualizar la posición de los vértices para simular las ondas radiales
    for (let i = 0; i < count; i++) {
        const y = positions.array[i * 3 + 1]; // Componente y de cada vértice

        // Aplicar la función de onda con la progresión modificada por la función de easing
        const wave = Math.sin(y * params.waveFrequency + 2 * Math.PI * easedProgression) * params.waveAmplitude;

        positions.array[i * 3] += Math.cos(y) * wave; // x
        positions.array[i * 3 + 2] += Math.sin(y) * wave; // z
    }

    // Indicar que la posición de los vértices necesita ser actualizada
    positions.needsUpdate = true;

    // Renderizar la escena
    renderer.render(scene, camera);
}

// Iniciar la animación
animate(0);

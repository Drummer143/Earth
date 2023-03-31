import gsap from 'gsap';
import { AdditiveBlending, BackSide, BufferGeometry, Float32BufferAttribute, Group, Mesh, PerspectiveCamera, Points, PointsMaterial, Scene, ShaderMaterial, SphereGeometry, TextureLoader, Vector2, WebGLRenderer } from "three";

import earthImg from './assets/earth.jpg';
//@ts-ignore
import earthVertexShader from './shaders/earthVertex.glsl';
//@ts-ignore
import earthFragmentShader from './shaders/earthFragment.glsl';
//@ts-ignore
import atmosphereVertexShader from './shaders/atmosphereVertex.glsl';
//@ts-ignore
import atmosphereFragmentShader from './shaders/atmosphereFragment.glsl';

import './style.css';

const app = document.getElementById('app') as HTMLElement;
const canvas = app.querySelector('#canvas') as HTMLCanvasElement;

const FOV = 75;
const ASPECT = app.clientWidth / app.clientHeight;
const NEAR = 0.1;
const FAR = 1000;
const PLANET_RADIUS = 5;
const WIDTH_SEGMENTS = 50;

const scene = new Scene();
const camera = new PerspectiveCamera(FOV, ASPECT, NEAR, FAR);
const renderer = new WebGLRenderer({
    antialias: true,
    canvas
});
renderer.setPixelRatio(window.devicePixelRatio);

const appResizeObserver = new ResizeObserver(entries => {
    const lastEntry = entries.at(-1);

    if (!lastEntry) {
        return;
    }

    const { width, height } = lastEntry.contentRect;

    renderer.setSize(width, height);

    camera.aspect = width / height;
    camera.updateProjectionMatrix();
});

appResizeObserver.observe(app);

const planetGeometry = new SphereGeometry(PLANET_RADIUS, WIDTH_SEGMENTS, WIDTH_SEGMENTS / 2);
const planetMaterial = new ShaderMaterial({
    vertexShader: earthVertexShader,
    fragmentShader: earthFragmentShader,
    uniforms: {
        earthTexture: {
            value: new TextureLoader().load(earthImg)
        }
    }
    // side: DoubleSide
})
const planetMesh = new Mesh(planetGeometry, planetMaterial);

const group = new Group();
group.add(planetMesh);

scene.add(group);

const atmosphereMaterial = new ShaderMaterial({
    vertexShader: atmosphereVertexShader,
    fragmentShader: atmosphereFragmentShader,
    blending: AdditiveBlending,
    side: BackSide
})
const atmosphereMesh = new Mesh(planetGeometry.clone(), atmosphereMaterial);
atmosphereMesh.scale.set(1.1, 1.1, 1.1);

scene.add(atmosphereMesh);

const starsGeometry = new BufferGeometry();
const starsMaterial = new PointsMaterial({ color: 0xffffff });

const starsCoords: number[] = [];
for (let i = 0; i < 1000; i++) {
    const x = (Math.random() - 0.5) * 2000;
    const y = (Math.random() - 0.5) * 2000;
    const z = -Math.random() * 2000;

    starsCoords.push(x, y, z);
}
starsGeometry.setAttribute('position', new Float32BufferAttribute(starsCoords, 3));

const starsMesh = new Points(starsGeometry, starsMaterial);
scene.add(starsMesh);

camera.position.setZ(20);

const mouseCoords = new Vector2();

const animate = () => {
    requestAnimationFrame(animate);

    planetMesh.rotateY(0.002);
    gsap.to(group.rotation, {
        x: mouseCoords.y * 0.5,
        y: mouseCoords.x * 0.3
    })

    renderer.render(scene, camera);
}

document.addEventListener('mousemove', e => {
    const x = (e.clientX / window.innerWidth) * 2 - 1;
    const y = (e.clientY / window.innerHeight) * 2 + 1;

    mouseCoords.set(x, y);
})

animate()
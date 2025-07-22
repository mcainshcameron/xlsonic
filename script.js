document.addEventListener('DOMContentLoaded', () => {
    // Particle.js background animation
    particlesJS('particles-js', {
        particles: {
            number: { value: 80, density: { enable: true, value_area: 800 } },
            color: { value: '#ffffff' },
            shape: { type: 'circle', stroke: { width: 0, color: '#000000' }, polygon: { nb_sides: 5 } },
            opacity: { value: 0.5, random: true, anim: { enable: true, speed: 1, opacity_min: 0.1, sync: false } },
            size: { value: 3, random: true, anim: { enable: false } },
            line_linked: { enable: true, distance: 150, color: '#ffffff', opacity: 0.4, width: 1 },
            move: { enable: true, speed: 2, direction: 'none', random: false, straight: false, out_mode: 'out', bounce: false }
        },
        interactivity: {
            detect_on: 'canvas',
            events: { onhover: { enable: true, mode: 'grab' }, onclick: { enable: true, mode: 'push' }, resize: true },
            modes: { grab: { distance: 140, line_opacity: 1 }, bubble: { distance: 400, size: 40, duration: 2, opacity: 8, speed: 3 }, repulse: { distance: 200, duration: 0.4 }, push: { particles_nb: 4 }, remove: { particles_nb: 2 } }
        },
        retina_detect: true
    });

    // Three.js 3D hero visualization
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true });
    const container = document.getElementById('hero-visual-3d');
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    const geometry = new THREE.TorusKnotGeometry(10, 3, 100, 16);
    const material = new THREE.MeshStandardMaterial({ color: 0x00ffff, wireframe: true });
    const torusKnot = new THREE.Mesh(geometry, material);
    scene.add(torusKnot);

    const pointLight = new THREE.PointLight(0xffffff);
    pointLight.position.set(20, 20, 20);
    scene.add(pointLight);

    camera.position.z = 30;

    function animate3D() {
        requestAnimationFrame(animate3D);
        torusKnot.rotation.x += 0.005;
        torusKnot.rotation.y += 0.005;
        renderer.render(scene, camera);
    }
    animate3D();

    // Audio player and visualizer logic
    const audioPlayers = document.querySelectorAll('.audio-player');
    let currentAudio = null;
    let currentButton = null;
    let audioContext;
    const visualizers = new Map();

    audioPlayers.forEach(player => {
        const playButton = player.querySelector('.play-button');
        const trackPath = playButton.dataset.track;
        const audio = new Audio(trackPath);
        const canvas = player.querySelector('.audio-visualizer');
        const canvasCtx = canvas.getContext('2d');

        playButton.addEventListener('click', () => {
            if (!audioContext) {
                audioContext = new (window.AudioContext || window.webkitAudioContext)();
            }

            if (currentAudio && currentAudio !== audio) {
                currentAudio.pause();
                currentAudio.currentTime = 0;
                currentButton.innerHTML = '<i class="fas fa-play"></i>';
            }

            if (audio.paused) {
                audio.play();
                playButton.innerHTML = '<i class="fas fa-pause"></i>';
                currentAudio = audio;
                currentButton = playButton;

                if (!visualizers.has(audio)) {
                    const analyser = audioContext.createAnalyser();
                    const source = audioContext.createMediaElementSource(audio);
                    source.connect(analyser);
                    analyser.connect(audioContext.destination);
                    analyser.fftSize = 256;
                    visualizers.set(audio, { analyser, canvasCtx, canvas });
                }
                drawVisualizer(audio);
            } else {
                audio.pause();
                playButton.innerHTML = '<i class="fas fa-play"></i>';
                currentAudio = null;
                currentButton = null;
            }
        });

        audio.addEventListener('ended', () => {
            playButton.innerHTML = '<i class="fas fa-play"></i>';
            if (currentAudio === audio) {
                currentAudio = null;
                currentButton = null;
            }
        });
    });

    function drawVisualizer(audio) {
        const visualizer = visualizers.get(audio);
        if (!visualizer || audio.paused) return;

        const { analyser, canvasCtx, canvas } = visualizer;
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        requestAnimationFrame(() => drawVisualizer(audio));

        analyser.getByteFrequencyData(dataArray);
        canvasCtx.clearRect(0, 0, canvas.width, canvas.height);

        const barWidth = (canvas.width / bufferLength) * 2.5;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
            const barHeight = dataArray[i];
            const gradient = canvasCtx.createLinearGradient(0, 0, 0, canvas.height);
            gradient.addColorStop(0, '#00ffff');
            gradient.addColorStop(1, '#9747FF');
            canvasCtx.fillStyle = gradient;
            canvasCtx.fillRect(x, canvas.height - barHeight / 2, barWidth, barHeight / 2);
            x += barWidth + 1;
        }
    }

    // Interactive table row selection
    const tableRows = document.querySelectorAll('tbody tr');
    tableRows.forEach(row => {
        row.addEventListener('click', () => {
            tableRows.forEach(r => r.classList.remove('selected'));
            row.classList.add('selected');
        });
    });

    // CSV file upload
    const csvUpload = document.getElementById('csv-upload');
    const fileNameDisplay = document.getElementById('file-name');
    csvUpload.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            fileNameDisplay.textContent = `File: ${file.name}`;
            alert('CSV file uploaded! Audio generation from custom files is a premium feature.');
        }
    });
});

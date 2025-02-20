function getRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
    
function getRandomRatio() {
    const ratios = [10, 12, 13, 14, 15, 16, 17];
    return ratios[Math.floor(Math.random() * ratios.length)];
}

function getRandomGrindSize() {
    const grindSizes = ['fina', 'média-fina', 'média', 'média-grossa', 'grossa'];
    return grindSizes[Math.floor(Math.random() * grindSizes.length)];
}

function showRecipe() {
    const totalPoursInput = document.getElementById('total-pours');
    const totalPours = parseInt(totalPoursInput.value) || 0;

    // Only adjust the value if user has entered something
    if (totalPoursInput.value !== '') {
        if (totalPours < 2 || totalPours > 6) {
            totalPoursInput.value = Math.min(Math.max(2, totalPours), 6);
        }
    }

    const landingPage = document.getElementById('landing-page');
    const recipePage = document.getElementById('recipe-page');
    
    landingPage.classList.add('fade-out');
    recipePage.classList.remove('hidden');
    
    // Small delay to ensure the fade-out animation starts before showing the content
    setTimeout(() => {
        recipePage.classList.add('show');
    }, 50);
    
    generateRecipe();
}

function calculateExtractionTime(coffeeGrams, waterGrams, grindSize, totalPours) {
    // Base time between 2:00 and 4:00 minutes (in seconds)
    let baseTime = 150; // 2:30 minutes in seconds
    
    // Adjust time based on coffee amount (more coffee = more time)
    baseTime += (coffeeGrams - 20) * 3;
    
    // Adjust time based on grind size
    const grindSizeMultiplier = {
        'fina': 0.9,
        'média-fina': 0.95,
        'média': 1,
        'média-grossa': 1.05,
        'grossa': 1.1
    };
    baseTime *= grindSizeMultiplier[grindSize];
    
    // Adjust time based on number of pours
    baseTime += (totalPours - 2) * 15;
    
    // Add some randomness (±15 seconds)
    baseTime += Math.floor(Math.random() * 31) - 15;
    
    // Format time to MM:SS
    const minutes = Math.floor(baseTime / 60);
    const seconds = Math.floor(baseTime % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

function calculatePourTimes(totalPours, extractionTime) {
    const [minutes, seconds] = extractionTime.split(':').map(Number);
    const totalSeconds = minutes * 60 + seconds;
    
    // Subtract 30 seconds for bloom time
    const remainingTime = totalSeconds - 30;
    
    // Calculate interval between pours
    const interval = Math.floor(remainingTime / (totalPours - 1));
    
    // Generate pour times
    const pourTimes = ['0:30']; // First pour after bloom
    let currentTime = 30;
    
    for (let i = 1; i < totalPours - 1; i++) {
        currentTime += interval;
        const mins = Math.floor(currentTime / 60);
        const secs = currentTime % 60;
        pourTimes.push(`${mins}:${secs.toString().padStart(2, '0')}`);
    }
    
    return pourTimes;
}



function generateRecipe() {
    // Get fixed values from inputs or generate random values
    const coffeeInput = document.getElementById('coffee-grams');
    const totalPoursInput = document.getElementById('total-pours');

    const coffeeGrams = coffeeInput.value ? parseInt(coffeeInput.value) : getRandomNumber(15, 30);
    const waterTemp = getRandomNumber(88, 96);
    const totalPours = totalPoursInput.value ? parseInt(totalPoursInput.value) : getRandomNumber(2, 6);
    
    const ratio = getRandomRatio();
    const waterGrams = coffeeGrams * ratio;
    const grindSize = getRandomGrindSize();
    const extractionTime = calculateExtractionTime(coffeeGrams, waterGrams, grindSize, totalPours);
    const pourTimes = calculatePourTimes(totalPours, extractionTime);

    // Calculate pour amounts
    const bloomWater = coffeeGrams * 2;
    const remainingWater = waterGrams - bloomWater;
    const pourAmount = Math.floor(remainingWater / (totalPours - 1));

    // Convert extraction time to seconds
    const [extractionMinutes, extractionSeconds] = extractionTime.split(':').map(Number);
    const totalExtractionSeconds = extractionMinutes * 60 + extractionSeconds;

    // Update variables list
    const variablesList = document.getElementById('variables');
    variablesList.innerHTML = `
        <li>Café: <strong>${coffeeGrams}g</strong></li>
        <li>Água total: <strong>${waterGrams}g</strong> (proporção <strong>1:${ratio}</strong>)</li>
        <li>Temperatura da água: <strong>${waterTemp}°C</strong></li>
        <li>Moagem: <strong>${grindSize}</strong></li>
        <li>Número de jogadas de água: <strong>${totalPours}</strong></li>
        <li>Tempo total de extração: <strong>${extractionTime}</strong></li>
        <li>Intervalos entre jogadas de água: <strong>${pourTimes.join('</strong>, <strong>')}</strong></li>
    `;

    // Generate steps
    const stepsList = document.getElementById('steps');
    let steps = [
        `Pré-aqueça o v60, o filtro e a xícara com água quente. Descarte a água do pré-aquecimento.`,
        `Coloque <strong>${coffeeGrams}g</strong> de café moído no filtro. Use moagem <strong>${grindSize}</strong>.`,
        `Aqueça <strong>${waterGrams}g</strong> de água a <strong>${waterTemp}°C</strong>.`,
        `Despeje <strong>${bloomWater}g</strong> de água no centro do café em movimentos circulares para o bloom. Aguarde <strong>30 segundos</strong>.`
    ];

    let currentWater = bloomWater;
    for (let i = 1; i < totalPours; i++) {
        const thisAmount = i === totalPours - 1 ? waterGrams - currentWater : pourAmount;
        currentWater += thisAmount;
        const [mins, secs] = pourTimes[i-1].split(':').map(Number);
        const timeInSeconds = mins * 60 + secs;
        steps.push(`Em <strong>${pourTimes[i-1]}</strong>, despeje mais <strong>${thisAmount}g</strong> de água em movimentos circulares suaves. <i>Totalizando: <strong>${currentWater}g</strong></i>.`);
    }

    steps.push(`Aguarde a água terminar de drenar completamente. O tempo total deve ser aproximadamente <strong>${extractionTime}</strong> minutos.`);
    steps.push('Seu café está pronto! Aproveite! ☕');

    stepsList.innerHTML = steps.map(step => `<li>${step}</li>`).join('');
}

// Generate initial recipe when page loads
document.addEventListener('DOMContentLoaded', function() {
    // Clear any default values
    const coffeeInput = document.getElementById('coffee-grams');
    const totalPoursInput = document.getElementById('total-pours');
    
    // Ensure both inputs are empty
    coffeeInput.value = '';
    totalPoursInput.value = '';
    
    // Generate initial recipe
    generateRecipe();
});
function loadModesContent() {
    if (!modesContent) return;
    modesContent.innerHTML = '';

    const projectDesc = document.createElement('p');
    projectDesc.classList.add('text-gray-200', 'font-medium', 'text-lg');
    projectDesc.innerHTML = `<span class="text-emerald-400">Proje Tanımı:</span> ${egitim.projeTanimi}`;
    modesContent.appendChild(projectDesc);

    const featuresTitle = document.createElement('h3');
    featuresTitle.classList.add('text-xl', 'font-semibold', 'text-white', 'mt-4');
    featuresTitle.textContent = 'Hedef Özellikler:';
    modesContent.appendChild(featuresTitle);

    const featuresList = document.createElement('ul');
    featuresList.classList.add('list-disc', 'list-inside', 'ml-4', 'space-y-1');
    egitim.hedefOzellikler.forEach(feature => {
        const li = document.createElement('li');
        li.textContent = feature;
        featuresList.appendChild(li);
    });
    modesContent.appendChild(featuresList);

    const techStackTitle = document.createElement('h3');
    techStackTitle.classList.add('text-xl', 'font-semibold', 'text-white', 'mt-4');
    techStackTitle.textContent = 'Teknik Altyapı:';
    modesContent.appendChild(techStackTitle);

    const techStackDiv = document.createElement('div');
    techStackDiv.classList.add('ml-4', 'space-y-1');
    techStackDiv.innerHTML = `
        <p><strong>Model:</strong> ${egitim.teknikAltyapi.model}</p>
        <p><strong>Geliştirme Dili:</strong> ${egitim.teknikAltyapi.gelistirmeDili.join(', ')}</p>
        <p><strong>API Entegrasyonları:</strong> ${egitim.teknikAltyapi.apiEntegrasyonlari.join(', ')}</p>
    `;
    modesContent.appendChild(techStackDiv);

    const modesTitle = document.createElement('h3');
    modesTitle.classList.add('text-xl', 'font-semibold', 'text-white', 'mt-4');
    modesTitle.textContent = 'Mevcut Modlar:';
    modesContent.appendChild(modesTitle);

    egitim.modlar.forEach(mode => {
        const modeDiv = document.createElement('div');
        modeDiv.classList.add('bg-gray-700', 'p-4', 'rounded-lg', 'shadow-md', 'hover:bg-emerald-900', 'transition-colors', 'duration-300', 'cursor-pointer');
        modeDiv.innerHTML = `
            <h4 class="font-semibold text-emerald-300 text-lg mb-1">${mode.ad}</h4>
            <p class="text-sm text-gray-400 leading-relaxed">${mode.amac}</p>
        `;
        modesContent.appendChild(modeDiv);
    });
}

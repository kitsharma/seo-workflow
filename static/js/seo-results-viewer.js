document.addEventListener('DOMContentLoaded', () => {
    const rawData = document.getElementById('seo-results-data').textContent;
    const result = JSON.parse(rawData);

    const overviewContainer = document.getElementById('overview-content');
    const recsContainer = document.getElementById('recommendations-content');
    const detailsContainer = document.getElementById('details-content');

    const parseEmbeddedJson = (text) => {
        if (!text) return null;
        const match = text.match(/\{[\s\S]*\}/);
        if (!match) return null;
        try {
            return JSON.parse(match[0]);
        } catch (e) {
            console.warn('Failed to parse embedded JSON:', e);
            return null;
        }
    };

    const extractOutput = (stepKey) => {
        const data = result[stepKey];
        if (!data) return null;
        if (data.analysis || data.recommendations) return data;
        return parseEmbeddedJson(data.response_text);
    };

    // Overview Tab
    Object.keys(result)
        .filter(key => key.startsWith('output_'))
        .forEach(key => {
            const step = key.replace('output_', '');
            const output = extractOutput(key);
            const div = document.createElement('div');
            div.className = 'bg-gray-50 p-4 rounded-lg shadow';
            div.innerHTML = `<h4 class="font-semibold text-teal-700 capitalize mb-2">${step.replace('_', ' ')}</h4>
                             <p>${output?.analysis?.summary || output?.analysis || 'No analysis provided.'}</p>`;
            overviewContainer.appendChild(div);
        });

    // Recommendations Tab
    Object.keys(result)
        .filter(key => key.startsWith('output_'))
        .forEach(key => {
            const step = key.replace('output_', '');
            const output = extractOutput(key);
            const recs = output?.recommendations;
            if (Array.isArray(recs)) {
                const div = document.createElement('div');
                div.className = 'bg-gray-50 p-4 rounded-lg shadow';
                div.innerHTML = `<h4 class="font-semibold text-teal-700 capitalize mb-2">${step.replace('_', ' ')}</h4>`;
                const ul = document.createElement('ul');
                ul.className = 'list-disc ml-6';
                recs.forEach(r => {
                    const li = document.createElement('li');
                    li.textContent = typeof r === 'string' ? r : JSON.stringify(r);
                    ul.appendChild(li);
                });
                div.appendChild(ul);
                recsContainer.appendChild(div);
            }
        });

    // Step Details Tab
    const log = result.execution_summary?.execution_log || [];
    log.forEach(entry => {
        const div = document.createElement('div');
        div.className = 'bg-gray-50 p-4 rounded-lg shadow';
        div.innerHTML = `<p><strong>Step:</strong> ${entry.agent}</p>
                         <p><strong>Time:</strong> ${entry.execution_time_seconds.toFixed(2)}s</p>
                         <p><strong>Output Keys:</strong> ${entry.output_data_keys.join(', ')}</p>`;
        detailsContainer.appendChild(div);
    });
});
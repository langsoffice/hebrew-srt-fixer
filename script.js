// ---------------- Text Utilities ----------------
function isHebrew(text) {
    for (let ch of text) {
        if ((ch >= '\u0590' && ch <= '\u05FF') || (ch >= '\uFB1D' && ch <= '\uFB4F')) {
            return true;
        }
    }
    return false;
}

function reverseHebrew(text) {
    return text.split('').reverse().join('');
}

function processLine(line, maxWords) {
    if (!isHebrew(line)) return line;

    const words = line.split(' ');
    if (words.length <= maxWords) return reverseHebrew(line);

    const firstSegment = words.slice(0, maxWords).join(' ');
    const lastSegment = words.slice(maxWords).join(' ');

    return reverseHebrew(firstSegment) + '\n' + reverseHebrew(lastSegment);
}

function processSRT(content, maxWords) {
    const lines = content.split(/\r?\n/);
    const processed = [];

    for (let line of lines) {
        if (/^\d+$/.test(line.trim()) || line.includes('-->') || line.trim() === '') {
            processed.push(line);
        } else {
            const newText = processLine(line, maxWords);
            processed.push(...newText.split('\n'));
        }
    }

    return processed.join('\n');
}

// ---------------- Web App Logic ----------------
document.getElementById('processBtn').addEventListener('click', () => {
    const fileInput = document.getElementById('srtFile');
    const maxWords = parseInt(document.getElementById('maxWords').value) || 4;
    const messageEl = document.getElementById('message');

    if (!fileInput.files.length) {
        messageEl.textContent = 'Please upload an SRT file.';
        return;
    }

    const file = fileInput.files[0];
    const reader = new FileReader();

    reader.onload = function(e) {
        const content = e.target.result;
        const fixedContent = processSRT(content, maxWords);

        const blob = new Blob([fixedContent], {type: 'text/plain;charset=utf-8'});
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'fixed_' + file.name;
        link.click();

        messageEl.textContent = 'SRT processed successfully!';
    };

    reader.readAsText(file, 'UTF-8');
});

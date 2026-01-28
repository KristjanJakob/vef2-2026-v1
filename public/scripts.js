let correct = 0;
let wrong = 0;

const correctEl = document.getElementById('correct');
const wrongEl = document.getElementById('wrong');

document.addEventListener('click', (e) => {
    if (e.target.classList.contains('rett')) {
        correct++;
        correctEl.textContent = correct;
        disableButtons(e.target);
    }
    if (e.target.classList.contains('rangt')) {
        wrong++;
        wrongEl.textContent = wrong;
        disableButtons(e.target);
    }
})

function disableButtons(button) {
    const actions = button.closes('.actions');
    if(!actions) return;

    actions.querySelectorAll('button').forEach((btn) => {
        btn.disabled = true;
    });
}
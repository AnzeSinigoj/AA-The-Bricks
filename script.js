let slider = document.getElementById('slider');
let game = document.getElementById('game');
let raketa = document.getElementById('raketa');
let bricks = document.getElementsByClassName('jet');
let scoreElement = document.getElementById('count');
let score = 0;

function calcSlider() { // V px
    let parentRect = game.getBoundingClientRect();
    let childRect = slider.getBoundingClientRect();
    return childRect.left - parentRect.left;
}

function moveSlider(direction) {
    let pos = calcSlider();
    let stp = 10; // Smaller step value for smoother movement
    let gameRect = game.getBoundingClientRect();
    let sliderRect = slider.getBoundingClientRect();
    
    if (direction === 'left' && pos - stp >= 0) {
        slider.style.left = (pos - stp) + 'px';
    } else if (direction === 'right' && pos + sliderRect.width + stp <= gameRect.width) {
        slider.style.left = (pos + stp) + 'px';
    } else if (direction === 'right') {
        slider.style.left = (gameRect.width - sliderRect.width) + 'px';
    } else if (direction === 'left') {
        slider.style.left = '0px';
    }
}

document.addEventListener("keydown", function(event) {
    if (event.key === 'ArrowLeft' || event.key === 'a') {
        moveSlider('left');
    } else if (event.key === 'ArrowRight' || event.key === 'd') {
        moveSlider('right');
    }
});

// Raketa movement
let raketaDx, raketaDy;
let animationFrameId;

function start() {
    let raketaRect = raketa.getBoundingClientRect();
    let gameRect = game.getBoundingClientRect();
    let initialTop = raketaRect.top - gameRect.top;
    let initialLeft = raketaRect.left - gameRect.left;

    raketa.style.top = initialTop + 'px'; // Set initial top position
    raketa.style.left = initialLeft + 'px'; // Set initial left position

    raketaDx = Math.random() > 0.5 ? 2 : -2; // Random direction
    raketaDy = Math.random() > 0.5 ? 2 : -2; // Random direction

    moveRaketa();
}

function moveRaketa() {
    let gameRect = game.getBoundingClientRect();
    let raketaRect = raketa.getBoundingClientRect();
    let sliderRect = slider.getBoundingClientRect();

    // Move the raketa
    let newTop = raketaRect.top + raketaDy;
    let newLeft = raketaRect.left + raketaDx;

    // Check if raketa touches the ground (bottom of the game)
    if (newTop + raketaRect.height >= gameRect.bottom) {
        showAlert("Game Over", "You lost!", "error");
        cancelAnimationFrame(animationFrameId);
        return;
    }
    // Check for collision with slider
    if (
        raketaRect.bottom >= sliderRect.top &&
        raketaRect.right >= sliderRect.left &&
        raketaRect.left <= sliderRect.right
    ) {
        raketaDy = -raketaDy; // Reverse vertical direction
    }

    // Check for collision with walls and ceiling, and bounce
    if (newTop <= gameRect.top) {
        raketaDy = -raketaDy; // Bounce off the ceiling
    }
    if (newLeft <= gameRect.left || newLeft + raketaRect.width >= gameRect.right) {
        raketaDx = -raketaDx; // Bounce off the walls
    }

    // Check for collision with bricks and display explosion if collision occurs
    let allJetsGone = true;
    for (let brick of bricks) {
        let brickRect = brick.getBoundingClientRect();
        if (
            raketaRect.right >= brickRect.left &&
            raketaRect.left <= brickRect.right &&
            raketaRect.bottom >= brickRect.top &&
            raketaRect.top <= brickRect.bottom &&
            brick.style.backgroundImage !== 'none' &&
            brick.getAttribute('data-hit') !== 'true'
        ) {
            raketaDy = -raketaDy;
            raketaDx = -raketaDx;
            brick.style.backgroundImage = 'url("img/explosion.png")'; // Set to explosion image
            score += 5; // Add 5 points to the score
            scoreElement.innerHTML = `Score: ${score}`; // Update the score display
            brick.setAttribute('data-hit', 'true'); // Mark the brick as hit
            setTimeout(() => {
                brick.style.backgroundImage = 'none'; // Remove the background image after 1 second
            }, 1000);
        }
        if (brick.style.backgroundImage !== 'none') {
            allJetsGone = false;
        }
    }

    // Check if all jets are gone
    if (allJetsGone) {
        showAlert("Congratulations!", "You win!", "info");
        cancelAnimationFrame(animationFrameId);
        return;
    }

    raketa.style.top = (raketaRect.top - gameRect.top + raketaDy) + 'px';
    raketa.style.left = (raketaRect.left - gameRect.left + raketaDx) + 'px';

    animationFrameId = requestAnimationFrame(moveRaketa);
}

// Add event listeners for dragging
let isDragging = false;
let initialX, offsetX;

slider.addEventListener('mousedown', startDrag);
slider.addEventListener('touchstart', startDrag);

document.addEventListener('mousemove', drag);
document.addEventListener('touchmove', drag);

document.addEventListener('mouseup', endDrag);
document.addEventListener('touchend', endDrag);

function startDrag(event) {
    isDragging = true;
    initialX = event.type === 'touchstart' ? event.touches[0].clientX : event.clientX;
    offsetX = slider.offsetLeft;
    event.preventDefault(); // Prevent text selection while dragging
}

function drag(event) {
    if (!isDragging) return;
    let currentX = event.type === 'touchmove' ? event.touches[0].clientX : event.clientX;
    let dx = currentX - initialX;
    let newLeft = offsetX + dx;

    let gameRect = game.getBoundingClientRect();
    let sliderRect = slider.getBoundingClientRect();

    // Ensure no large jumps in position
    slider.style.transition = 'none'; // Disable transition for immediate response

    if (newLeft >= 0 && newLeft + sliderRect.width <= gameRect.width) {
        slider.style.left = newLeft + 'px';
    }

    event.preventDefault(); // Prevent default behavior
}

function endDrag() {
    isDragging = false;
}

function restart(){
    location.reload();
}

function showAlert(title, text, icon) {
    swal({
        title: title,
        text: text,
        icon: icon,
        button: {
            text: "Play Again",
            className: "swal-button"
        }
    }).then(() => {
        location.reload(); 
    });
}
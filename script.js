let slider = document.getElementById('slider');
let game = document.getElementById('game');
let leva = document.getElementById('leva');
let desna = document.getElementById('desna');
slider.style.left = '37%';

function mv(){
    let val = slider.style.left.replace("%", "");
    val = parseFloat(val) + 2;
    slider.style.left = `${val}%`;
    console.log(slider.style.left);
    
}

setInterval(mv, 100);
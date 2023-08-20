var canvas = document.getElementById('myCanvas');
var canvasContainer = document.getElementById('canvasContainer');
var highlight = document.getElementById('highlight');

var ctx = canvas.getContext('2d');

var canvasWidth = 512 * 32;
var canvasHeight = 512 * 32;

var blockSize = 32; // Размер одного блока

var zoom = 0.25;

var offsetX = 0;
var offsetY = 0;

let map = []

function getColor(a) {
    const colors = [
      "white",
      "black",
      "rgb(245, 80, 80)",
      "rgb(42, 83, 172)",
      "rgb(230, 210, 101)",
      "rgb(93, 189, 117)",
      "rgb(141, 82, 196)",
      "rgb(103, 112, 131)",
      "rgb(231, 157, 46)",
      "rgb(40, 113, 131)",
      "rgb(255, 187, 235)",
      "rgb(80, 58, 53)",
    ];
  
    // Приведем число 'a' к диапазону от 0 до 5
    const index = Math.min(Math.max(Math.floor(a), 0), 11);
  
    return colors[index];
}

const squares = document.querySelectorAll('.square');

var colorValue = 1;

squares.forEach(square => {
  square.addEventListener('click', () => {
    colorValue = parseInt(square.getAttribute('data-color'));
    squares.forEach(s => s.classList.remove('selected'));
    square.classList.add('selected');
  });
});



const ruleButtons = document.querySelectorAll('.square_rule');

ruleButtons.forEach(button => {
  button.addEventListener('click', () => {
    ruleValue = button.getAttribute('data-rule');
    console.log(ruleValue);
    ruleAction(ruleValue);
  });
});

function border_draw(){
     // Добавляем границы черного цвета вокруг всего холста
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvasWidth * zoom, 1); // Верхняя граница
    ctx.fillRect(0, canvasHeight * zoom - 1, canvasWidth * zoom, 1); // Нижняя граница
    ctx.fillRect(0, 0, 1, canvasHeight * zoom); // Левая граница
    ctx.fillRect(canvasWidth * zoom - 1, 0, 1, canvasHeight * zoom); // Правая граница

    ctx.fillStyle = 'white';
    ctx.fillRect(1, 1, canvasWidth / zoom - 2, canvasHeight / zoom - 2); // Заполняем область внутри границ белым цветом
}


function renderMap(mapData = lastmap) {
    console.log("Начало отрисовки карты");
    var blockSize = Math.round(32 * zoom);
    var map = mapData.map;
    for (var y = 0; y < map.length; y++) {
        for (var x = 0; x < map[y].length; x++) {
            var color = getColor(map[y][x]);
            ctx.fillStyle = color;
            ctx.fillRect((x-offsetX) * blockSize, (y-offsetY) * blockSize, blockSize, blockSize);
        }
    }
    console.log("Конец отрисовки карты");
}

function updateMap()
{
    $.get("https://fisashqqq.pythonanywhere.com/get_map", function(data, status){
        map = data;
        renderMap(map);
        });
        
}
updateMap();
border_draw()
setInterval(updateMap, 1000);

canvas.addEventListener('mousemove', function(event) {
    var x = event.offsetX;
    var y = event.offsetY;
    var blockSize = Math.round(32 * zoom);

    // Проверяем, находится ли курсор внутри холста
    if (x >= 0 && x < canvasWidth / zoom && y >= 0 && y < canvasHeight / zoom) {
        var blockX = Math.floor(x / blockSize) * blockSize + canvas.getBoundingClientRect().left - 8;
        var blockY = Math.floor(y / blockSize) * blockSize;

        highlight.style.left = blockX + 'px';
        highlight.style.top = blockY + 'px';
        highlight.style.width = blockSize + 'px';
        highlight.style.height = blockSize + 'px';
        highlight.style.display = 'block'; // Показываем обводку
    } else {
        highlight.style.display = 'none'; // Скрываем обводку
    }
});

canvas.addEventListener('click', function(event) {
    var x = event.offsetX;
    var y = event.offsetY;
    var blockSize = Math.round(32 * zoom);

    var blockX = Math.floor(x / blockSize) * blockSize;
    var blockY = Math.floor(y / blockSize) * blockSize;

    var color = colorValue;
    ctx.fillStyle = getColor(color);
    ctx.fillRect(blockX, blockY, blockSize, blockSize);
    
    $.post("https://fisashqqq.pythonanywhere.com/setpixel", { color:color, x: blockX/blockSize + offsetX, y: blockY/blockSize + offsetY}, 
    function(data){
        console.log(data);
        console.log(color);
        console.log(blockX/blockSize);
        console.log(blockY/blockSize);
    });
    
});

function ruleAction(action){
    if (action === '=') {
        zoom += 0.05
    } else if (action === '-') {
        zoom -= 0.05
    }
    else if (action === 'd' || action === 'в') {
        offsetX += 15
    }
    else if (action === 'a' || action === 'ф') {
        offsetX -= 15
    }
    else if (action === 'w' || action === 'ц') {
        offsetY -= 15
    }
    else if (action=== 's' || action === 'ы') {
        offsetY += 15
    }
    else{
        return;
    }
    
    offsetX = Math.min(Math.max(offsetX, 0), 512)
    offsetY = Math.min(Math.max(offsetY, 0), 512)

    zoom = Math.min(Math.max(zoom, 0.05), 2);

    // обновление экрана щоби не было багов 
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    //updateMap();
    renderMap(map);
    border_draw();
}
document.addEventListener('keydown', function (event) {
   ruleAction(event.key);
});

window.addEventListener('wheel', function(e) {
    e.preventDefault();
}, { passive: false });

window.addEventListener("wheel", function(event){
    var delta = Math.sign(event.deltaY); // Определяем направление прокрутки

    zoom -= delta / 20;

    zoom = Math.min(Math.max(zoom, 0.05), 2);

    // обновление экрана щоби не было багов 
    
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    //updateMap();
    renderMap(map);
    border_draw();
});

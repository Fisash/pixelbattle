var canvas = document.getElementById('myCanvas');
var canvasContainer = document.getElementById('canvasContainer');
var highlight = document.getElementById('highlight');

var ctx = canvas.getContext('2d');

var canvasWidth = 512 * 32;
var canvasHeight = 512 * 32;

var blockSize = 32; // Размер одного блока

var zoom = 1;


function getColor(a) {
    const colors = [
      "white",
      "black",
      "rgb(245, 80, 80)",
      "rgb(42, 83, 172)",
      "rgb(230, 210, 101)",
      "rgb(93, 189, 117)",
    ];
  
    // Приведем число 'a' к диапазону от 0 до 5
    const index = Math.min(Math.max(Math.floor(a), 0), 5);
  
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

function border_draw(){
     // Добавляем границы черного цвета вокруг всего холста
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvasWidth / zoom, 1); // Верхняя граница
    ctx.fillRect(0, canvasHeight / zoom - 1, canvasWidth / zoom, 1); // Нижняя граница
    ctx.fillRect(0, 0, 1, canvasHeight / zoom); // Левая граница
    ctx.fillRect(canvasWidth / zoom - 1, 0, 1, canvasHeight / zoom); // Правая граница

    ctx.fillStyle = 'white';
    ctx.fillRect(1, 1, canvasWidth / zoom - 2, canvasHeight / zoom - 2); // Заполняем область внутри границ белым цветом
}


function renderMap(mapData) {
    var blockSize = Math.round(32 / zoom);
    var map = mapData.map;

    for (var y = 0; y < map.length; y++) {
        for (var x = 0; x < map[y].length; x++) {
            var color = getColor(map[y][x]);
            ctx.fillStyle = color;
            ctx.fillRect(x * blockSize, y * blockSize, blockSize, blockSize);
        }
    }
}

function updateMap()
{
    $.get("https://holu31.pythonanywhere.com/get_map", function(data, status){
        let map = data;
        renderMap(map);
        });
        
}
updateMap();
border_draw()
setInterval(updateMap, 1000);

canvas.addEventListener('mousemove', function(event) {
    var x = event.offsetX;
    var y = event.offsetY;
    var blockSize = Math.round(32 / zoom);

    // Проверяем, находится ли курсор внутри холста
    if (x >= 0 && x < canvasWidth / zoom && y >= 0 && y < canvasHeight / zoom) {
        var blockX = Math.floor(x / blockSize) * blockSize;
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
    var blockSize = Math.round(32 / zoom);

    var blockX = Math.floor(x / blockSize) * blockSize;
    var blockY = Math.floor(y / blockSize) * blockSize;

    var currentColor = ctx.getImageData(blockX, blockY, blockSize, blockSize).data;

    var color = colorValue;

    ctx.fillRect(blockX, blockY, blockSize, blockSize);
    
    $.post("https://holu31.pythonanywhere.com/setpixel", { color:color, x: blockX/blockSize, y: blockY/blockSize }, 
    function(data){
        console.log(data);
        console.log(color);
        console.log(blockX/blockSize);
        console.log(blockY/blockSize);
    });
    
});

document.addEventListener('keydown', function (event) {
    if (event.key === '=') {
        if(zoom <= 0.5) return;
        zoom -= 0.05
    } else if (event.key === '-') {
        if(zoom >= 16) return;
        zoom += 0.05
    }

    // обновление экрана щоби не было багов 
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    updateMap();
    border_draw();
});

window.addEventListener('wheel', function(e) {
    e.preventDefault();
}, { passive: false });

window.addEventListener("wheel", function(event){
    var delta = Math.sign(event.deltaY); // Определяем направление прокрутки

    zoom += delta / 10;

    zoom = Math.min(Math.max(zoom, 0.5), 16);

    // обновление экрана щоби не было багов 
    
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    updateMap();
    border_draw();
});

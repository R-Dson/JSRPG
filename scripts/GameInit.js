var playerInfo;
var gameRunState = true;
var canvas;
var keyState = {};

window.onload = function()
{
    startGame();
}

function startGame()
{
    loadGame();
    
    runGame();
}

function player(x, y, experience, healthPoints, equipmentJson)
{
    this.x = x;
    this.y = y;
    this.experience = experience;
    this.healthPoints = healthPoints;
    this.equipmentJson = equipmentJson;
    this.updatePlayer = function()
    {
        drawArea = canvas.context;
        drawArea.fillStyle = "red";
        drawArea.fillRect(this.x, this.y, 30, 30);
    }

}

function runGame()
{    var loadedEquipment = "";

    playerInfo = new player(canvas.gameCanvas.width/2, canvas.gameCanvas.height/2, 0, 100, loadedEquipment);
    canvas.start();
}

var left = 37, up = 38, right = 39, down = 40;

function gameUpdate()
{
    canvas.clear();
    canvas.frameNumber += 1;
    /*switch(keyState)
    {
        case left:
            playerInfo.x -= 4;
            break;
        case up:
            playerInfo.y -= 4;
            break;
        case right:
            playerInfo.x += 4;
            break;
        case down:
            playerInfo.y += 4;
            break;
    }*/
    if(keyState[left] && keyState[down])
    {
        playerInfo.y += 4;
        playerInfo.x -= 4;
    }
    else if(keyState[left] && keyState[up])
    {
        playerInfo.x -= 4;
        playerInfo.y -= 4;
    }
    else if(keyState[right] && keyState[up])
    {
        playerInfo.x += 4;
        playerInfo.y -= 4;
    }
    else if(keyState[right] && keyState[down])
    {
        playerInfo.x += 4;
        playerInfo.y += 4;
    }
    else if(keyState[left])
        playerInfo.x -= 4;
    else if(keyState[up])
        playerInfo.y -= 4;
    else if(keyState[right])
        playerInfo.x += 4;
    else if(keyState[down])
        playerInfo.y += 4;

    if(canvas.frameNumber == 1 || updateInverval(16))
    {
        
    }
    playerInfo.updatePlayer();
}

function loadGame()
{
    canvas = {
        gameCanvas : document.getElementById("canvas"),
        start : function()
        {
            this.context = this.gameCanvas.getContext("2d");
            this.frameNumber = 0;
            this.tick = setInterval(gameUpdate, 16)
        },
        clear : function()
        {
            this.context.clearRect(0, 0, this.gameCanvas.width, this.gameCanvas.height)
        }
    };
}

function updateInverval(number)
{
    if((canvas.frameNumber / number) % 1 == 0)
        return true;
    return false;
}

function endGame()
{
    gameRunState = false;
}

function ondeath()
{
    
}


// Events
document.addEventListener('keydown', 
function(event)
{
    keyState[event.keyCode || event.which] = true;    
}, gameRunState);

document.addEventListener('keyup', function(event)
{
    keyState[event.keyCode || event.which] = false;
}, gameRunState)
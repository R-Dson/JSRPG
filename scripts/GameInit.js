var playerInfo;
var gameRunState = true;
var canvas;
var keyState = {};
var npcs = [];
var left = 37, up = 38, right = 39, down = 40;
var isfightning = false;


window.onload = function () {
    startGame();
}

function startGame() {
    loadGame();

    runGame();
}

function loadGame() {
    canvas = {
        gameCanvas: document.getElementById("canvas"),
        start: function () {
            this.context = this.gameCanvas.getContext("2d");
            this.frameNumber = 0;
            this.tick = setInterval(gameUpdate, 16)
        },
        clear: function () {
            this.context.clearRect(0, 0, this.gameCanvas.width, this.gameCanvas.height)
        }
    };
}

function runGame() {
    var loadedEquipment = "";

    playerInfo = new character(canvas.gameCanvas.clientWidth, canvas.gameCanvas.clientHeight, 100, 100, 0, 100, loadedEquipment, 10, "red");
    for (var i = 0; i < Math.round(Math.random() * 25); i++) {
        var randomwidth = Math.round(Math.random(0) * 400);
        var randomheight = Math.round(Math.random(0) * 400);
        var randomhp = Math.round(randomheight * randomwidth * Math.random() * 0.1)/100;
        npcs.push(new character(Math.round(Math.random(0) * canvas.gameCanvas.width), Math.round(Math.random(0) * canvas.gameCanvas.height), randomwidth, randomheight, 0, randomhp, "", 10, "blue"));
    }
    canvas.start();
}

function character(x, y, width, height, experience, healthPoints, equipmentJson, walkSpeed, color) {
    this.x = x;
    this.y = y;
    this.experience = experience;
    this.healthPoints = healthPoints;
    this.displayhealth = healthPoints;
    this.equipmentJson = equipmentJson;
    this.height = width;
    this.width = height;
    this.walkSpeed = walkSpeed;
    //this.drawArea = canvas.context;
    this.updatecharacter = function () {
        drawArea = canvas.context;
        drawArea.fillStyle = color;
        drawArea.fillRect(this.x, this.y, this.width, this.height);
    }

    this.updateplayerdetails = function () {
        var ctx = canvas.context;
        var fontsize = 50;
        ctx.font = fontsize + "px Georgia";
        ctx.fillStyle = "white";
        ctx.fillText("Player details: ", 3, fontsize);
        ctx.fillText("hp: " + playerInfo.healthPoints + " / " + playerInfo.displayhealth, 3, fontsize * 2)
    }

    this.displaydamage = function (displaydamage, x, y, width, height) {
        var ctx = canvas.context;
        ctx.font = "50px Georgia";
        ctx.fillStyle = "white";
        ctx.fillText(displaydamage, x + width * .5, y + height / 2);

    }

    this.displayhealthonscreen = function(totalhp, hpleft, x, y){
        var ctx = canvas.context;
        ctx.font = "50px Georgia";
        ctx.fillStyle = "white";
        ctx.fillText(hpleft + " / " + totalhp, x, y-5);
    }

    var bottom = canvas.gameCanvas.height - this.height, topAndLeftLimit = 0, rightlimit = canvas.gameCanvas.width - this.width;

    this.limit = function () {

        if (this.y > bottom)
            this.y = bottom;
        if (this.y < topAndLeftLimit)
            this.y = topAndLeftLimit;
        if (this.x < topAndLeftLimit)
            this.x = topAndLeftLimit;
        if (this.x > rightlimit)
            this.x = rightlimit;
    }
    this.npclimit = function () {
        if (this.y > bottom) {
            this.y = bottom;
            return true;
        }

        if (this.y < topAndLeftLimit) { this.y = topAndLeftLimit; return true; }
        if (this.x < topAndLeftLimit) { this.x = topAndLeftLimit; return true; }
        if (this.x > rightlimit) { this.x = rightlimit; return true; }
        return false;
    }

    this.collision = function (collisionitem) {
        var myleft = this.x;
        var myright = this.x + (this.width);
        var mytop = this.y;
        var mybottom = this.y + (this.height);
        var otherleft = collisionitem.x;
        var otherright = collisionitem.x + (collisionitem.width);
        var othertop = collisionitem.y;
        var otherbottom = collisionitem.y + (collisionitem.height);
        //if (this.y + this.height < collisionitem || this.y > collisionitem.y + collisionitem.height || this.x + this.width > collisionitem.x || this.x > collisionitem.x + collisionitem.width) {
        if ((mybottom < othertop) || (mytop > otherbottom) || (myright < otherleft) || (myleft > otherright)) {
            return false;
        }
        return true;
    }

    this.ondeath = function (deadcharacter) {
        deadcharacter.healthPoints = 0;
        if (fightningNPC == deadcharacter) {
            var i = npcs.indexOf(fightningNPC);
            if (i >= 0) {
                playerInfo.experience += fightningNPC.experience;

                npcs.splice(i, 1);
                isfightning = false;
            }
        }
        else{

        }

    }


}

var fightningNPC;
var playerFightTick = 0;
var npcFightTick = 0;

function gameUpdate() {
    if (gameRunState) {
        for (var i = 0; i < npcs.length; i++) {
            var collision = playerInfo.collision(npcs[i]);
            if (collision) {
                isfightning = true;
                fightningNPC = npcs[i];
                break;
            }
        }
        playerInfo.updatecharacter();


        canvas.clear();
        canvas.frameNumber += 1;

        //MOVEMENT LOGIC ####################################################################

        if (!isfightning) {
            if (keyState[left] && keyState[down]) {
                playerInfo.y += playerInfo.walkSpeed;
                playerInfo.x -= playerInfo.walkSpeed;
            }
            else if (keyState[left] && keyState[up]) {
                playerInfo.x -= playerInfo.walkSpeed;
                playerInfo.y -= playerInfo.walkSpeed;
            }
            else if (keyState[right] && keyState[up]) {
                playerInfo.x += playerInfo.walkSpeed;
                playerInfo.y -= playerInfo.walkSpeed;
            }
            else if (keyState[right] && keyState[down]) {
                playerInfo.x += playerInfo.walkSpeed;
                playerInfo.y += playerInfo.walkSpeed;
            }
            else if (keyState[left])
                playerInfo.x -= playerInfo.walkSpeed;
            else if (keyState[up])
                playerInfo.y -= playerInfo.walkSpeed;
            else if (keyState[right])
                playerInfo.x += playerInfo.walkSpeed;
            else if (keyState[down])
                playerInfo.y += playerInfo.walkSpeed;
        }
        var npcwalkup = 1, npcwalkdown = 0, npcwalkright = 1, npcwalkleft = 0;

        for (i = 0; i < npcs.length; i++) {

            var randomx = Math.round(Math.random(0) * 40);
            var randomy = Math.round(Math.random(0) * 40);

            if (!npcs[i].npclimit() && npcs[i] != fightningNPC) {
                if (randomy == npcwalkup)
                    npcs[i].y -= Math.round(Math.random()) * npcs[i].walkSpeed;
                else if (randomy == npcwalkdown)
                    npcs[i].y += Math.round(Math.random()) * npcs[i].walkSpeed;
                if (randomx == npcwalkright)
                    npcs[i].x += Math.round(Math.random()) * npcs[i].walkSpeed;
                else if (randomx == npcwalkleft)
                    npcs[i].x -= Math.round(Math.random()) * npcs[i].walkSpeed;
            }
        }

        for (i = 0; i < npcs.length; i++) {
            npcs[i].updatecharacter();
            npcs[i].displayhealthonscreen(npcs[i].displayhealth, npcs[i].healthPoints, npcs[i].x, npcs[i].y);
        }

        //triggeres when you collide with an enemy, fighting logic here ##########################################################################
        if (isfightning) {
            playerFightTick++;
            npcFightTick++;
            var playerallowattack = fightT(playerFightTick);
            var npcAllowAttack = fightT(npcFightTick);
            if (playerallowattack) {
                var playerdamage = Math.round(Math.random() * 25);
                playerInfo.displaydamage(playerdamage, fightningNPC.x, fightningNPC.y, fightningNPC.width, fightningNPC.height);
                fightningNPC.healthPoints -= playerdamage;
                playerFightTick = 0;
            }
            if (npcAllowAttack) {
                var npcdamage = Math.round(Math.random() * 15);
                fightningNPC.displaydamage(playerInfo.displayhealth, playerInfo.healthPoints, playerInfo.x, playerInfo.y);
                playerInfo.healthPoints -= npcdamage;
                npcFightTick = 0;
            }
            if (fightningNPC.healthPoints <= 0) {
                fightningNPC.ondeath(fightningNPC);
            }
            if (playerInfo.healthPoints <= 0) {
                delete window.playerInfo;
                gameRunState = false;
            }
        }
        playerInfo.updatecharacter();
        playerInfo.updateplayerdetails();
        playerInfo.displayhealthonscreen(playerInfo.displayhealth, playerInfo.healthPoints, playerInfo.x, playerInfo.y);
        playerInfo.limit();

    }
}



function updateInverval(number) {
    if ((canvas.frameNumber / number) % 1 == 0)
        return true;
    return false;
}

function gamestate() {
    this.pausegame = function () {
        gameRunState = false;
    }

    this.returnGame = function () {
        gameRunState = true;
    }
}

function endGame() {
    gameRunState = false;
}
function returnGame() {
    gameRunState = true;
}

function fightT(tick) {
    if (tick % 32 == 0)
        return true
    return false
}


// Events
document.addEventListener('keydown',
    function (event) {
        keyState[event.keyCode || event.which] = true;
    }, gameRunState);

document.addEventListener('keyup',
    function (event) {
        keyState[event.keyCode || event.which] = false;
    }, gameRunState)

document.addEventListener('touchstart',
    function (event) {
        var eventx = event.changedTouches[0].pageX;
        var eventy = event.changedTouches[0].pageY;
        if (eventx < playerInfo.x)
            playerInfo.x -= playerInfo.walkSpeed;
        if (eventy < playerInfo.y)
            playerInfo.y -= playerInfo.walkSpeed;
        if (eventx > playerInfo.x)
            playerInfo.x += playerInfo.walkSpeed;
        if (eventy > playerInfo.y)
            playerInfo.y += playerInfo.walkSpeed;
    }, gameRunState)
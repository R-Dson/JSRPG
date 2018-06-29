var playerInfo;
var gameRunState = true;
var canvas;
var keyState = {};
var npcs = [];
var left = 37, up = 38, right = 39, down = 40;
var isfightning = false;
var drawingTool = new drawing();
var gameEvent = new gameEvents();
var itemsImage = new Image();
var Jsoninfo;
var totalattack;
var playerdamage;
var npcdamage;

window.onload = function () {
    startGame();
}

function startGame() {
    loadGame();
    importItemImages();
    runGame();
}

function loadGame() {
    canvas = {
        gameCanvas: document.getElementById("canvas"),
        start: function () {
            this.context = this.gameCanvas.getContext("2d");
            this.frameNumber = 0;
            this.tick = setInterval(gameUpdate, 1000 / 144);
            this.fighttick = setInterval(fight, 16)
        },
        clear: function () {
            this.context.clearRect(0, 0, this.gameCanvas.width, this.gameCanvas.height);
        }
    };

}

function runGame() {
    var loadedItems = "";
    fetch('https://raw.githubusercontent.com/WorldOfEngineering/JSRPG/master/resources/GameJSON.json').then(function (Response) {
        return Response.json();
    }).then(function (json) {
        // var item1 = json.Equipment.helm;
        // var item2 = json.Equipment.chest;
        // var item3 = json.Equipment.pants;
        // var item4 = json.Equipment.weapon;
        // var item5 = json.Equipment.offhand;

        var items = [json.Equipment.helm, json.Equipment.chest, json.Equipment.pants, json.Equipment.weapon, json.Equipment.offhand];
        var itemsInv = [json.Inventory.slot0, json.Inventory.slot1, json.Inventory.slot2, json.Inventory.slot3, json.Inventory.slot4, json.Inventory.slot5, json.Inventory.slot6, json.Inventory.slot7, json.Inventory.slot8, json.Inventory.slot9];
        playerInfo = new character("Player", canvas.gameCanvas.clientWidth, canvas.gameCanvas.clientHeight, 100, 100, json.PlayerStats.Experience, json.PlayerStats.healthPoints, items, itemsInv, 4, "red", 10, 10, 10, 1);
    });

    generateNPC();
    canvas.start();
}

function drawing() {
    this.updateplayerdetails = function () {
        var ctx = canvas.context;

        var fontsize = 25;
        ctx.font = fontsize + "px Georgia";
        ctx.fillStyle = "white";

        //Display new lines of info below, each new row is a multiplier of fontsize in y-coordiante
        ctx.fillText("Player details: ", 3, fontsize);
        ctx.fillText("hp: " + playerInfo.healthPoints + " / " + playerInfo.displayhealth, 3, fontsize * 2);
    }

    this.displaydamage = function (displaydamage, x, y, width, height) {
        var ctx = canvas.context;
        ctx.font = "20px Georgia";
        ctx.fillStyle = "white";
        ctx.fillText(displaydamage, x + width * .5, y + height / 2);
    }

    this.displayhealthonscreen = function (totalhp, hpleft, x, y) {
        var ctx = canvas.context;
        ctx.font = "25px Georgia";
        ctx.fillStyle = "white";
        ctx.fillText(Math.round(hpleft * 100) / 100 + " / " + totalhp, x, y - 5);
    }

    this.drawInterface = function () {
        var ctx = canvas.context;
        ctx.fillStyle = "#201F1D";
        height = 64;
        ctx.fillRect(canvas.gameCanvas.width / 4, canvas.gameCanvas.height - height, canvas.gameCanvas.width / 2, height);
    }

    this.drawitem = function (item, index) {
        if (item != null) {
            var x = canvas.gameCanvas.width / 4;
            var y = canvas.gameCanvas.height - height;
            var ctx = canvas.context;
            ctx.drawImage(itemsImage, 16 * item.multiplierx, 16 * item.multipliery, 16, 16, x + (64 * index) + 15, y + 7, 64, 64);
            if (item.stackable == 1) {
                ctx.font = "20px Georgia";
                ctx.fillStyle = "white";
                ctx.fillText(item.Amount, x + (64 * index) + 8, y + 23);
            }
        }

    }

}

function gameEvents() {
    this.ondeath = function (deadcharacter) {
        deadcharacter.healthPoints = 0;
        if (fightningNPC == deadcharacter) {
            var i = npcs.indexOf(fightningNPC);
            if (i >= 0) {
                playerInfo.experience += fightningNPC.experience;
                npcs.splice(i, 1);
                var getitemprobability = Math.random() * 100;
                var index = 0;
                for(var i = 0; i < playerInfo.inventoryitems.length; i++){
                    if(playerInfo.inventoryitems[i].Name == null){
                        index = i;
                        break;
                    }
                }
                if(playerInfo.inventoryitems.length <= 10){
                    if (getitemprobability > 90) {
                        //creates a rare item
                        var values = [];
                        playerInfo.inventoryitems[index] = new Item("Rare", 10, "Test Name", 50, 50, 1, null, null, 1, 0, "Burns the enemy foe.");
    
                    }
                    else if (getitemprobability < 91 && getitemprobability > 60) {
                        //creates a magic item
                    }
                    else if(getitemprobability < 61 && getitemprobability > 20) {
                        //creates a normal item
                        
                        playerInfo.inventoryitems[index] = new Item("Normal", 1, "Normal Item Name", 15, 15, 0, null, null, 1, 0, "None.");
                        
                    }
                }
                
            }
        }
        else {

        }
        isfightning = false;
    }
}

function Item(Rarity, LevelRequirement, Name, Attack, Strength, Defence, multiplierx, multipliery, Amount, stackable, Effect) {
    this.Rarity = Rarity;
    this.lvlreq = LevelRequirement;
    this.Name = Name;
    this.attack = Attack;
    this.strength = Strength;
    this.defence = Defence;
    this.multiplierx = multiplierx;
    this.multipliery = multipliery;
    this.Amount = Amount;
    this.stackable = stackable;
    this.effect = Effect;
}

function playerInventory(items) {

}

function character(type, x, y, width, height, experience, healthPoints, equipment, inventory, walkSpeed, color, attack = 10, defence = 10, strength = 10, level = 1) {

    this.x = x;
    this.y = y;
    this.experience = experience;
    this.healthPoints = healthPoints;
    this.displayhealth = healthPoints;
    this.inventory = inventory;

    if (type == "Player") {
        this.attackPower = attack;
        this.defencePower = defence;
        this.strengthPower = strength;
        for (i = 0; i < equipment.length; i++) {
            var app = equipment[i].Attack;
            var dpp = equipment[i].Defence;
            var spp = equipment[i].Defence;
            this.attackPower += app;
            this.defencePower += dpp;
            this.strengthPower += spp;
        }
        this.inventoryitems = [];
        for (i = 0; i < inventory.length; i++) {
            this.inventoryitems.push(new Item(inventory[i].Rarity, inventory[i].LevelRequirement, inventory[i].Name, inventory[i].Attack, inventory[i].Strength, inventory[i].Defence, inventory[i].multiplierx, inventory[i].multipliery, inventory[i].Amount, inventory[i].stackable, inventory[i].Effect));
        }
        this.equipmentitems = []
        for (i = 0; i < equipment.length; i++) {
            this.equipmentitems.push(new Item(equipment[i].Rarity, equipment[i].LevelRequirement, equipment[i].Name, equipment[i].Attack, equipment[i].Strength, equipment[i].Defence, equipment[i].multiplierx, equipment[i].multipliery, equipment[i].Amount, equipment[i].stackable, equipment[i].Effect));
        }

    }

    this.height = width;
    this.width = height;
    this.walkSpeed = walkSpeed;
    this.currency = 0;
    this.attack = attack;
    this.defence = defence;
    this.attack = attack;
    this.strength = strength
    this.level = level;

    this.updatecharacter = function () {
        drawArea = canvas.context;
        drawArea.fillStyle = color;
        drawArea.fillRect(this.x, this.y, this.width, this.height);
    }
    //#201F1D

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
        playerInfo.updatecharacter();

        for (i = 0; i < npcs.length; i++) {
            npcs[i].updatecharacter();
            drawingTool.displayhealthonscreen(npcs[i].displayhealth, npcs[i].healthPoints, npcs[i].x, npcs[i].y);
        }

        //triggeres when you collide with an enemy, fighting logic here ##########################################################################

        if (isfightning) {
            if (playerdamage != null) {
                drawingTool.displaydamage(playerdamage, fightningNPC.x, fightningNPC.y, fightningNPC.width, fightningNPC.height);
            }
            if (npcdamage != null) {
                drawingTool.displaydamage(playerInfo.displayhealth, playerInfo.healthPoints, playerInfo.x, playerInfo.y);
            }
        }

        updateTable(playerInfo.healthPoints, playerInfo.displayhealth, playerInfo.attackPower, playerInfo.defence, playerInfo.experience, playerInfo.level);


        //Drawing ##########################################################################
        drawingTool.displayhealthonscreen(playerInfo.displayhealth, playerInfo.healthPoints, playerInfo.x, playerInfo.y);
        playerInfo.limit();
        importItemImages();
        drawingTool.drawInterface();
        for (i = 0; i < 7; i++) {
            drawingTool.drawitem(playerInfo.inventoryitems[i], i);
        }
    }
}

// function updateInverval(number) {
//     if ((canvas.frameNumber / number) % 6 == 0)
//         return true;
//     return false;
// }

function fight() {
    if (isfightning) {

        playerFightTick++;
        npcFightTick++;

        var playerallowattack = fightT(playerFightTick);
        var npcAllowAttack = fightT(npcFightTick);

        if (playerallowattack && playerInfo.healthPoints > 0) {
            playerdamage = Math.round(Math.random() * 2.5 * playerInfo.attackPower - fightningNPC.defence / 10);
            fightningNPC.healthPoints -= playerdamage;
            playerFightTick = 0;
        }
        if (npcAllowAttack && fightningNPC.healthPoints > 0) {
            npcdamage = Math.round(Math.random() * 15 - playerInfo.defence / 10);
            playerInfo.healthPoints -= npcdamage;
            npcFightTick = 0;
        }
        if (fightningNPC.healthPoints <= 0) {
            gameEvent.ondeath(fightningNPC);
            fightningNPC.healthPoints = 0;
        }
        if (playerInfo.healthPoints <= 0) {
            playerInfo.healthPoints = 0;
            delete window.playerInfo;
            gameRunState = false;
        }
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

function generateNPC() {
    for (var i = 0; i < Math.round(Math.random() * 25); i++) {
        var randomwidth = Math.round(Math.random(0) * 400);
        var randomheight = Math.round(Math.random(0) * 400);
        var randomhp = Math.round(randomheight * randomwidth * Math.random() * 0.1) / 100;
        npcs.push(new character("NPC", Math.round(Math.random(0) * canvas.gameCanvas.width), Math.round(Math.random(0) * canvas.gameCanvas.height), randomwidth, randomheight, randomhp, randomhp, "", "", 10, "blue"));
    }
}

function BuyHPotion() {
    var exist = false;
    for (i = 0; i <= playerInfo.inventoryitems.length; i++) {
        if (playerInfo.inventoryitems[i] != null && playerInfo.inventoryitems[i].Name == "Health Potion") {
            playerInfo.inventoryitems[i].Amount++;
            exist = true;
            break;
        }
    }
    if (!exist && playerInfo.inventoryitems.length < 10) {
        healthPoints = []
        playerInfo.inventoryitems.unshift(new Item("Normal", null, "Health Potion", null, null, null, 0, 0, 1, 1, "Heals the user."));
    }
}

function importItemImages() {
    var ctx = canvas.gameCanvas.getContext("2d");
    itemsImage.src = "https://raw.githubusercontent.com/WorldOfEngineering/JSRPG/master/resources/rpgItems.png";
}

// Events triggers ###########################################################################################
document.addEventListener('keydown',
    function (event) {
        keyState[event.keyCode || event.which] = true;
        useitem(event.which);
    }, gameRunState);

document.addEventListener('keyup',
    function (event) {
        keyState[event.keyCode || event.which] = false;
    }, gameRunState
);

document.addEventListener('scroll',
    function () {
        window.scrollTo(0, 0);
    }, true
);

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
    }, gameRunState
);

//menu scripts goes here ####################################################

function switchTab(event, tabName) {
    var tabs = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabs.length; i++) {
        tabs[i].style.display = "none";
    }
    var tab = document.getElementById(tabName);
    tab.style.display = "block";
}

function updateTable(currentHP, totalHp, playerAttack, playerDefence, playerexperience, playerlevel) {
    var healthPointstd, attack, defence, experience, level, trinventory, trequipment;

    healthPointstd = document.getElementById("HealthPoints");
    healthPointstd.innerHTML = "Health: " + currentHP + " / " + totalHp;

    attack = document.getElementById("Attack");
    attack.innerHTML = "Attack: " + playerAttack;

    defence = document.getElementById("Defence");
    defence.innerHTML = "Defence: " + playerDefence;

    experience = document.getElementById("Experience");
    experience.innerHTML = "Experience: " + Math.round(playerexperience * 100) / 100;

    level = document.getElementById("Level");
    level.innerHTML = "Level: " + playerlevel;

    trinventory = document.getElementById("Inventory");

    for (let i = 0; i < playerInfo.inventoryitems.length; i++) {
        var name = playerInfo.inventoryitems[i].Name;
        if (name != null) {
            trinventory.cells[i].innerHTML = playerInfo.inventoryitems[i].Name + ": " + playerInfo.inventoryitems[i].Amount;
            trinventory.cells[i].title = "Rarity: " + playerInfo.inventoryitems[i].Rarity +
                "\nAttack bonus: " + playerInfo.inventoryitems[i].Attack +
                "\nDefence bonus: " + playerInfo.inventoryitems[i].Defence +
                "\nStrength bonus: " + playerInfo.inventoryitems[i].Strength +
                "\nEffect: " + playerInfo.inventoryitems[i].Effect;
        }
        else {
            if(trinventory.cells[i] != null){
                trinventory.cells[i].innerHTML = " ";
            }
            
        }
    }
    trequipment = document.getElementById("Equipment");

    for (let i = 0; i < playerInfo.equipmentitems.length; i++) {
        if (playerInfo.equipmentitems[i].Name != null) {
            trequipment.cells[i].innerHTML = playerInfo.equipmentitems[i].Name;
            trequipment.cells[i].title = "Rarity: " + playerInfo.equipmentitems[i].Rarity +
                "\nAttack bonus: " + playerInfo.equipmentitems[i].Attack +
                "\nDefence bonus: " + playerInfo.equipmentitems[i].Defence +
                "\nStrength bonus: " + playerInfo.equipmentitems[i].Strength +
                "\nEffect: " + playerInfo.equipmentitems[i].Effect;
        }
    }
}

function useitem(buttonclick) {
    switch (buttonclick) {
        case 49:
            if (playerInfo.inventoryitems.length > 0 && playerInfo.healthPoints < 100) {
                if (playerInfo.inventoryitems[0].Amount > 1) {
                    playerInfo.inventoryitems[0].Amount -= 1;
                }
                else {
                    var i = playerInfo.inventoryitems.indexOf(playerInfo.inventoryitems[0]);
                    playerInfo.inventoryitems.splice(i, 1);
                }
                playerInfo.healthPoints += 20;
                if (playerInfo.healthPoints > playerInfo.displayhealth) {
                    playerInfo.healthPoints = playerInfo.displayhealth;
                }
            }

    }
}

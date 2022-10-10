let shared;
let gridSize = 20;
var won = false;
var outOfTime = false;

function preload() {
    partyConnect(
        "wss://deepstream-server-1.herokuapp.com",
        "mjgomsa_sheep_2",
        "main"
    );
    shared = partyLoadShared("shared", {
        grid: [],
        eaten: 0,
        gameMode: 0,
        game_timer: 90,
        farmer_timer: 15,
        replanted_x: 0,
        replanted_y: 0,
        made_it: false
    });
    sheep = loadImage("sheep.png");
    black_sheep = loadImage("black_sheep.png");
    grass = loadImage("grass.png");
    farmer = loadImage("farmer.png");

    me = partyLoadMyShared();
    guests = partyLoadGuestShareds();

}

function setup() {
    if (partyIsHost()) {
        resetGrid();
        shared.eaten = 0;
        shared.replanted_x = floor(random(0, gridSize));
        shared.replanted_y = floor(random(0, gridSize));
        shared.gameMode = 0;
    }

    frameRate(60);

    me.sheep = { posX: gridSize * -1, posY: gridSize * 0 };
    guests.sheep = { posX: gridSize * -1, posY: gridSize * 0 };
}

function draw() {
    switch (shared.gameMode) {
        case 0:
            startingScreen();
            break;
        case 1:
            instructScreen();
            break;
        case 2:
            gameOn();
            break;
        case 3:
            gameOver();
            break;
    }
}


function startingScreen() {
    createCanvas(600, 600);
    background("beige");
    push();
    fill('black');
    textSize(35);
    text("Bah Bah Grass", 120, 200);
    pop();
    push();
    textSize(20);
    text("Click anywhere to continue", 120, 420);
    pop();


}

function instructScreen() {
    createCanvas(600, 600);
    background("beige");
    fill('black');
    push();
    textSize(35);
    text("Instructions", 120, 100);
    pop();
    textSize(25);
    text("Eat all grass squares with", 120, 200);
    text("your teammates before", 120, 240);
    text("the time runs out.", 120, 280);
    push();
    pop();
    push();
    textSize(20);
    text("Click anywhere to continue", 120, 420);
    pop();

}

function mousePressed() {
    if (shared.gameMode == 0) {
        shared.gameMode = 1;
    } else if (shared.gameMode == 1) {
        shared.gameMode = 2;
    }
}

function gameOn() {
    createCanvas(600, 600);
    background("beige");

    translate(width / 10, height / 11); // move grid in relation to greater canvas

    gridDraw();

    push();
    for (const p of guests) {
        image(
            black_sheep,
            p.sheep.posX - 8,
            p.sheep.posY - 10,
            gridSize + 15,
            gridSize + 15
        );
    }
    pop();
    image(
        sheep,
        me.sheep.posX - 8,
        me.sheep.posY - 10,
        gridSize + 15,
        gridSize + 15
    );
    fill("black");
    textSize(20);
    text("Grass eaten: " + shared.eaten, 0, 430);

    // timer
    if (frameCount % 60 === 0 && shared.game_timer > 0) {
        shared.game_timer--;
    }
    if (shared.game_timer === 0) {
        console.log("game over");
        outOfTime = true;
        shared.gameMode = 3;
    }
    text(shared.game_timer, 380, 430);

    replantingGrass();

    //if winner(gridSize *2 or timer runs out):
    if (shared.eaten == gridSize * gridSize) {
        won = true;
        shared.gameMode = 3;
    }
}

function replantingGrass() {
    const x = shared.replanted_x * gridSize;
    const y = shared.replanted_y * gridSize;

    if (shared.eaten >= (gridSize * gridSize) / 4) {
        //start farmer timer
        if (partyIsHost()) {
            if (frameCount % 60 === 0 && shared.farmer_timer > 0) {
                shared.farmer_timer--;
            }
        }
        text(shared.farmer_timer, width / 2, 430);

        if (me.sheep.posX == x && me.sheep.posY == y) {
            shared.made_it = true;
        }
        // if timer hasnt gone off and made_it is false
        if ((shared.farmer_timer != 0) && (shared.made_it == false)) {
            // console.log("seed is planted")
            shared.grid[shared.replanted_x][shared.replanted_y] = "replanted";
        } else if ((shared.farmer_timer != 0) && (shared.made_it == true)) {
            // console.log("you made it!");
            shared.grid[shared.replanted_x][shared.replanted_y] = "unplanted";
        } else if ((shared.farmer_timer == 0) && (shared.made_it == false)) {
            text("You didn't get to the seed in time!", width / 5, 460);
            for (i = 0; i < gridSize; i++) {
                shared.grid[i][shared.replanted_y] = "planted";
            }
        }
    }

}

function gameOver() {
    if (won == true) {
        createCanvas(500, 500);
        background("beige");
        fill('black');
        text("Congratulations! You WIN!", 200, 200);
    }
    if (outOfTime == true) {
        createCanvas(500, 500);
        background("beige");
        fill('black');
        text("You're out of time... You LOSE!", 200, 200);
    }
}

function gridDraw() {
    for (let row = 0; row < gridSize; row++) {
        for (let col = 0; col < gridSize; col++) {
            const x = col * gridSize;
            const y = row * gridSize;
            stroke('#94541E');
            if (shared.grid[col][row] === "planted") { // false
                fill('#0F3325');
                rect(x + 1, y + 1, gridSize, gridSize);
                image(
                    grass,
                    x + 1,
                    y + 1,
                    gridSize + 1,
                    gridSize + 1
                );
            } else if (shared.grid[col][row] === "unplanted") { //true
                fill('#94541E');
                rect(x + 1, y + 1, gridSize, gridSize);
            } else if (shared.grid[col][row] === "replanted") {
                fill("yellow");
                rect(x + 1, y + 1, gridSize, gridSize);
            }
        }
    }
}

function keyPressed() {
    if (keyCode === DOWN_ARROW) {
        me.sheep.posY = me.sheep.posY + gridSize;
    }
    if (keyCode === UP_ARROW) {
        me.sheep.posY = me.sheep.posY - gridSize;
    }
    if (keyCode === LEFT_ARROW) {
        me.sheep.posX = me.sheep.posX - gridSize;
    }
    if (keyCode === RIGHT_ARROW) {
        me.sheep.posX = me.sheep.posX + gridSize;
    }

    let col = me.sheep.posX / gridSize;
    let row = me.sheep.posY / gridSize;
    if (shared.grid[col][row] === "planted") {
        shared.grid[col][row] = "unplanted";
        shared.eaten = shared.eaten + 1;
    } else {
        shared.grid[col][row] = "planted";
        shared.eaten = shared.eaten - 1;
    }
}

function resetGrid() {
    const newGrid = [];
    for (let col = 0; col < gridSize; col++) {
        newGrid[col] = new Array(gridSize).fill("planted");
    }
    shared.grid = newGrid;
}
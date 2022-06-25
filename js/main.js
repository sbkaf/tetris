import "../css/index.css"

import "./webxdc-scores.js"

let game_interval = 0,
    score = 0,
    level = 1,
    newlevel = 1,
    speed = 450,
    sensibility = 4,
    started = false;
let playfield = new Array(22),
    dirty_rows = new Array(20),
    dirty = false;
const canvas = document.getElementById("playfield"),
      scoreboard = document.getElementById("scoreboard"),
      square_img = document.getElementById("square"),
      tip = document.getElementById("tip");

const width = canvas.width,
      height = canvas.height,
      main = canvas.getContext("2d");
main.fillStyle = "rgba(255, 0, 0, 0.6)";

let falling = {
    shape: [],
    rot: 0,
    loc: [],
    color: "",
    width: 0
};

let xDown = null;
let yDown = null;

let xtrigger = 0;
let ytrigger = 0;
let dtrigger = 0;

let KeyCodes = {
    SPACE : 32,
    ARROWL: 37,
    ARROWR: 39,
    ARROWU: 38,
    ARROWD: 40
};

function setField() {
    for (let i = 0; i < playfield.length; ++i) {
        playfield[i] = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    }
    for (let i = 0; i < dirty_rows.length; ++i) {
        dirty_rows[i] = true;
    }
    dirty = true;
}

function checkClear(max) { // todo: check and clear up to max
    for (let row = 0; row <= max && row < playfield.length; ++row) {
	if (playfield[row][0] > 0 &&
	    playfield[row][1] > 0 &&
	    playfield[row][2] > 0 &&
	    playfield[row][3] > 0 &&
	    playfield[row][4] > 0 &&
	    playfield[row][5] > 0 &&
	    playfield[row][6] > 0 &&
	    playfield[row][7] > 0 &&
	    playfield[row][8] > 0 &&
	    playfield[row][9] > 0) {
	    playfield.splice(row, 1);
	    playfield.splice(0, 0, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
	    for (let i = 0; i <= row; ++i) {
		if (i > 1 && !dirty_rows[i-2]) {
		    dirty_rows[i-2] = true;
		    if (!dirty) dirty = true;
		    incScore(1);
		    //console.log("clear "+i);
		}
	    }
	}
    }
}

function incScore(amount) {
    score+=amount;
    newlevel = Math.floor((score+100)/100);
    if (newlevel!=level) {
        level = newlevel;
        window.highscores.setScore(score);
        //clearInterval(game_interval);
        //started = false;
        //scoreboard.classList.add("opened");
        if (level>1) {
            speed = 450 - 25*(level-1);
            clearInterval(game_interval);
            game_interval = setInterval(() => {
                fall(playfield, falling, true);
            }, speed);
        }
    }
}

function draw() {
    if (dirty) {
	rePaint(false);
	dirty = false;
	main.font = 'bold 34px Arial';
	main.fillStyle = "rgb(255,255,255)";
	main.fillText("Score: "+score,20,50);
	main.fillText("Level: "+level,20,100);
	if (!started) {
	    //main.font = 'bold 30px Arial';
	    //main.fillStyle = "rgb(255,255,255)";
	    //main.fillText("Touch anywhere to start",width/2-150,200);
	    //let scores = window.highscores.getHighScores();
	    scoreboard.classList.add("opened");
	    //if (scores.length>0)
	    //   main.fillText("Scoreboard",width/2-100,300);
	    //for(let x=0; x<scores.length; x++) {
	    //   main.fillText(scores[x].pos+". "+scores[x].name+" "+scores[x].score,width/2-100,(x*50)+350);
	    //}
	}
    }
    window.requestAnimationFrame(draw);
}

function spawn(type) {
    switch (type) {
    case "I":
	falling.shape = [[	[0, 0, 0, 0],
				[1, 1, 1, 1],
				[0, 0, 0, 0],
				[0, 0, 0, 0]],
			 [	[0, 0, 1, 0],
				[0, 0, 1, 0],
				[0, 0, 1, 0],
				[0, 0, 1, 0]],
			 [	[0, 0, 0, 0],
				[0, 0, 0, 0],
				[1, 1, 1, 1],
				[0, 0, 0, 0]],
			 [	[0, 1, 0, 0],
				[0, 1, 0, 0],
				[0, 1, 0, 0],
				[0, 1, 0, 0]]];
	falling.rot = 0;
	falling.loc = [0, 3];
	falling.color = "cyan";
	falling.width = 4;
	// playfield[1][3] = playfield[1][4] = playfield[1][5] = playfield[1][6] = 1; // add checks for collision -> fail
	break;
    case "J":
	falling.shape = [[	[2, 0, 0],
				[2, 2, 2],
				[0, 0, 0]],
			 [	[0, 2, 2],
				[0, 2, 0],
				[0, 2, 0]],
			 [	[0, 0, 0],
				[2, 2, 2],
				[0, 0, 2]],
			 [	[0, 2, 0],
				[0, 2, 0],
				[2, 2, 0]]];
	falling.rot = 0;
	falling.loc = [0, 3];
	falling.color = "blue";
	falling.width = 3;
	break;
    case "L":
	falling.shape = [[	[0, 0, 3],
				[3, 3, 3],
				[0, 0, 0]],
			 [	[0, 3, 0],
				[0, 3, 0],
				[0, 3, 3]],
			 [	[0, 0, 0],
				[3, 3, 3],
				[3, 0, 0]],
			 [	[3, 3, 0],
				[0, 3, 0],
				[0, 3, 0]]];
	falling.rot = 0;
	falling.loc = [0, 3];
	falling.color = "orange";
	falling.width = 3;
	break;
    case "O":
	falling.shape = [[	[4, 4],
				[4, 4]],
			 [	[4, 4],
				[4, 4]],
			 [	[4, 4],
				[4, 4]],
			 [	[4, 4],
				[4, 4]]];
	falling.rot = 0;
	falling.loc = [0, 4];
	falling.color = "yellow";
	falling.width = 2;
	break;
    case "S":
	falling.shape = [[	[0, 5, 5],
				[5, 5, 0],
				[0, 0, 0]],
			 [	[0, 5, 0],
				[0, 5, 5],
				[0, 0, 5]],
			 [	[0, 0, 0],
				[0, 5, 5],
				[5, 5, 0]],
			 [	[5, 0, 0],
				[5, 5, 0],
				[0, 5, 0]]];
	falling.rot = 0;
	falling.loc = [0, 3];
	falling.color = "green";
	falling.width = 3;
	break;
    case "T":
	falling.shape = [[	[0, 6, 0],
				[6, 6, 6],
				[0, 0, 0]],
			 [	[0, 6, 0],
				[0, 6, 6],
				[0, 6, 0]],
			 [	[0, 0, 0],
				[6, 6, 6],
				[0, 6, 0]],
			 [	[0, 6, 0],
				[6, 6, 0],
				[0, 6, 0]]];
	falling.rot = 0;
	falling.loc = [0, 3];
	falling.color = "purple";
	falling.width = 3;
	break;
    case "Z":
	falling.shape = [[	[7, 7, 0],
				[0, 7, 7],
				[0, 0, 0]],
			 [	[0, 0, 7],
				[0, 7, 7],
				[0, 7, 0]],
			 [	[0, 0, 0],
				[7, 7, 0],
				[0, 7, 7]],
			 [	[0, 7, 0],
				[7, 7, 0],
				[7, 0, 0]]];
	falling.rot = 0;
	falling.loc = [0, 3];
	falling.color = "red";
	falling.width = 3;
	break;
    case "-":
	falling.shape = [[	[0, 0],
				[8, 8]],
			 [	[8, 0],
				[8, 0]],
			 [	[8, 8],
				[0, 0]],
			 [	[0, 8],
				[0, 8]]];
	falling.rot = 0;
	falling.loc = [0, 4];
	falling.color = "magenta";
	falling.width = 2;
	break;
    case "~":
	falling.shape = [[	[9, 0, 0],
				[9, 9, 9],
				[0, 0, 9]],
			 [	[0, 9, 9],
				[0, 9, 0],
				[9, 9, 0]],
			 [	[9, 0, 0],
				[9, 9, 9],
				[0, 0, 9]],
			 [	[0, 9, 9],
				[0, 9, 0],
				[9, 9, 0]]];
	falling.rot = 0;
	falling.loc = [0, 3];
	falling.color = "pink";
	falling.width = 3;
	break;
    case "+":
	falling.shape = [[	[0, 10, 0],
				[10, 10, 10],
				[0, 10, 0]],
			 [	[0, 10, 0],
				[10, 10, 10],
				[0, 10, 0]],
			 [	[0, 10, 0],
				[10, 10, 10],
				[0, 10, 0]],
			 [	[0, 10, 0],
				[10, 10, 10],
				[0, 10, 0]]];
	falling.rot = 0;
	falling.loc = [0, 3];
	falling.color = "gray";
	falling.width = 3;
	break;
    }
    for (let i = 0; i < falling.shape[0].length; ++i) {
	const row = falling.loc[0] + i;
	for (let j = 0; j < falling.shape[0][i].length; ++j) {
	    const col = falling.loc[1] + j;
	    if (falling.shape[0][i][j] > 0) {
		if (playfield[row][col] > 0) {
		    clearInterval(game_interval);
		    started = false;
		    setField();
		    window.highscores.setScore(score);
                    scoreboard.classList.add("opened");
                    tip.innerHTML="<br>Touch anywhere to start";
		    clearGame();
		    score = 0;
		    level = 1;
		    speed = 450;
		    break;
		}
		else if (falling.shape[0][i][j] > 0) {
		    playfield[row][col] = falling.shape[0][i][j];
		    if (row > 1 && !dirty_rows[row - 2]) {
			dirty_rows[row - 2] = true;
			dirty = true;
		    }
		}
	    }
	}
    }
}

function spawn_rand() {
    let extra = 0;
    if (level<5) {
        extra = 0;
    }
    else if(level<10) {
        extra = 1;
    }
    else if(level<15) {
        extra = 2;
    }
    else{
        extra = 3;
    }
    const type = Math.random() * (7+extra); // [0, 8) = ijlostz-~+
    if (type < 1) {
	spawn("I");
    }
    else if (type < 2) {
	spawn("J");
    }
    else if (type < 3) {
	spawn("L");
    }
    else if (type < 4) {
	spawn("O");
    }
    else if (type < 5) {
	spawn("S");
    }
    else if (type < 6) {
	spawn("T");
    }
    else if (type < 7) {
	spawn("Z");
    }
    else if (type < 8) {
	spawn("-");
    }
    else if (type < 9) {
	spawn("~");
    }
    else{
	spawn("+");
    }
}

function fall(field, piece, render) {
    if (piece.shape.length != 4) return;
    let valid = true;
    for (let i = 0; i < piece.shape[piece.rot].length; ++i) {
	const row = piece.loc[0] + i;
	for (let j = 0; j < piece.shape[piece.rot][i].length; ++j) {
	    const col = piece.loc[1] + j;
	    if (col < 0 || col > 9) {
		continue;
	    }
	    if (piece.shape[piece.rot][i][j] > 0) {
		if (!((i+1 < piece.shape[piece.rot].length && piece.shape[piece.rot][i+1][j] > 0) ||
		      (row+1 < field.length && field[row+1][col] == 0))) {
		    valid = false;
		    piece.shape = [];
		    break;
		}
	    }
	}
	if (!valid) break;
    }
    if (valid) {
	for (let i = piece.shape[piece.rot].length-1; i >= 0; i--) {
	    const row = piece.loc[0] + i;
	    for (let j = 0; j < piece.shape[piece.rot][i].length; ++j) {
		const col = piece.loc[1] + j;
		if (col < 0 || col > 9) {
		    continue;
		}
		if (piece.shape[piece.rot][i][j] > 0) {
		    field[row][col] = 0;
		    field[row+1][col] = piece.shape[piece.rot][i][j];
		    if (render && row > 1 && !dirty_rows[row-2]) {
			dirty_rows[row - 2] = true;
		    }
		    if (render && row+1 > 1 && !dirty_rows[row-1]) {
			dirty_rows[row - 1] = true;
		    }
		}
	    }
	}
	piece.loc[0] += 1;
	if (render) dirty = true;
    }
    else{
	checkClear(piece.loc[0] + piece.width - 1);
	spawn_rand();
    }
    return valid;
}

// rot 90deg clockwise
function rotate(field, piece, render) {
    if (piece.shape.length != 4) return;
    let rot = 1;
    let check;
    while (rot < 4) {
	check = piece.rot + rot;
	if (check > 3) check -= 4;
	let valid = true;
	for (let i = 0; i < piece.width; ++i) {
	    const row = piece.loc[0] + i;
	    for (let j = 0; j < piece.width; ++j) {
		if (piece.shape[check][i][j] > 0) {
		    const col = piece.loc[1] + j;
		    if ((row >= field.length)) {
			valid = false;
			break;
		    }
		    if (col < 0 || col > 9) {
			valid = false;
			break;
		    }
		    if (piece.shape[piece.rot][i][j] == 0 && row < field.length && field[row][col] > 0) {
			valid = false;
			break;
		    }
		}
	    }
	    if (!valid) break;
	}
	if (!valid) rot++;
	else break;
    }
    if (rot < 4) {
	for (let i = 0; i < piece.width; ++i) {
	    const row = piece.loc[0] + i;
	    for (let j = 0; j < piece.width; ++j) {
		const col = piece.loc[1] + j;
		if (col < 0 || col > 9) {
		    continue;
		}
		if (piece.shape[piece.rot][i][j] > 0 && piece.shape[check][i][j] == 0) {
		    field[row][col] = 0;
		    if (render && row > 1 && !dirty_rows[row-2]) {
			dirty_rows[row - 2] = true;
		    }
		}
		else if (field[row][col] == 0 && piece.shape[check][i][j] > 0) {
		    field[row][col] = piece.shape[check][i][j];
		    if (render && row > 1 && !dirty_rows[row-2]) {
			dirty_rows[row - 2] = true;
		    }
		}
	    }
	}
	piece.rot = check;
	if (render) dirty = true;
    }
    return rot < 4;
}

function move(x, field, piece, render) { // input x: -1, 1
    if (piece.shape.length != 4) return;
    let valid = true;
    for (let i = 0; i < piece.width; ++i) {
	const row = piece.loc[0] + i;
	for (let j = 0; j < piece.width; ++j) {
	    if (piece.shape[piece.rot][i][j] > 0) {
		const col = piece.loc[1] + j + x;
		if (col < 0 || col > 9) {
		    valid = false;
		    break;
		}
		else if (field[row][col] > 0) {
		    if ((j + x < piece.width && piece.shape[piece.rot][i][j + x] == 0) ||
			(j + x < 0 || j + x >= piece.width)) {
			valid = false;
			break;
		    }
		}
	    }
	}
	if (!valid) break;
    }
    if (valid) {
	for (let i = 0; i < piece.width; ++i) {
	    const row = piece.loc[0] + i;
	    for (let j = 0; j < piece.width; ++j) {
		const col = piece.loc[1] + j;
		if (piece.shape[piece.rot][i][j] > 0) {
		    field[row][col] =  0;
		}
	    }
	}
	for (let i = 0; i < piece.width; ++i) {
	    const row = piece.loc[0] + i;
	    for (let j = 0; j < piece.width; ++j) {
		const col = piece.loc[1] + j + x;
		if (piece.shape[piece.rot][i][j] > 0) {
		    field[row][col] =  piece.shape[piece.rot][i][j];
		    if (render && row > 1 && !dirty_rows[row - 2]) {
			dirty_rows[row - 2] = true;
		    }
		}
	    }
	}
	piece.loc[1] += x;
	if (render) dirty = true;
    }
}

function start() {
    if (!started) {
	if(window.localStorage.getItem("playfield")!=undefined) {
            scoreboard.classList.remove("opened");
	    game_interval = setInterval(()=>{
                fall(playfield, falling, true);
            }, speed);
	    started = true;
	}
	else {
	    spawn_rand();
	    scoreboard.classList.remove("opened");
	    game_interval = setInterval(() => {
                fall(playfield, falling, true);
            }, speed);
	    started = true;
	}
	tip.innerHTML="";
    } else {
        rotate(playfield, falling, true);
    }
}

function rePaint(refresh) {
    for (let i = 0; i < 20; ++i) {
        if(dirty_rows[i] || refresh) {
	    main.clearRect(0, i * 100, width, 100);
	    for (let j = 0; j < 10; ++j) {
		if (playfield[i+2][j] > 0) {
		    main.drawImage(square_img, j * 100, i * 100);
		    switch(playfield[i+2][j]) { // note: static colors looks dull
		    case(1): // cyan
			main.fillStyle = "rgba(0, 255, 255, 0.65)"
			break;
		    case(2): // blue
			main.fillStyle = "rgba(0, 0, 255, 0.65)"
			break;
		    case(3): // orange
			main.fillStyle = "rgba(255, 165, 0, 0.65)"
			break;
		    case(4): // yellow
			main.fillStyle = "rgba(255, 255, 0, 0.65)"
			break;
		    case(5): // green
			main.fillStyle = "rgba(0, 255, 0, 0.65)"
			break;
		    case(6): // purple
			main.fillStyle = "rgba(128, 0, 128, 0.65)"
			break;
		    case(7): // red
			main.fillStyle = "rgba(255, 0, 0, 0.65)"
			break;
		    case(8): // magenta
			main.fillStyle = "rgba(255, 110, 200, 0.65)"
			break;
		    case(9): // pink
			main.fillStyle = "rgba(255, 192, 203, 0.65)"
			break;
		    case(10): // gray
			main.fillStyle = "rgba(200, 200, 200, 0.65)"
			break;
		    }
		    main.fillRect(j*100, i*100, 100, 100);
		}
	    }
            dirty_rows[i] = false;
        }
    }
}

function saveGame() {
    window.localStorage.setItem("playfield", JSON.stringify(playfield));
    window.localStorage.setItem("falling", JSON.stringify(falling));
    window.localStorage.setItem("dirty_rows", JSON.stringify(dirty_rows));
    window.localStorage.setItem("score", score);
    window.localStorage.setItem("sensibility", document.getElementById("sencontrol").selectedIndex+1);
}

function restoreGame() {
    if(window.localStorage.getItem("playfield")!=undefined) {
        playfield = JSON.parse(window.localStorage.getItem("playfield"));
        falling = JSON.parse(window.localStorage.getItem("falling"));
        dirty_rows = JSON.parse(window.localStorage.getItem("dirty_rows"));
        score = Number(window.localStorage.getItem("score"));
        sensibility = Number(window.localStorage.getItem("sensibility"));
        document.getElementById("sencontrol").selectedIndex=sensibility-1;
        level = Math.floor((score+100)/100);
        speed = 450 - 25*(level-1);
        dirty = true;
        rePaint(true);
    }
}

function clearGame() {
    window.localStorage.removeItem("playfield");
    window.localStorage.removeItem("falling");
    window.localStorage.removeItem("dirty_rows");
    window.localStorage.removeItem("score");
    window.localStorage.removeItem("sensibility");
}

function getTouches(evt) {
    return evt.touches ||             // browser API
        evt.originalEvent.touches; // jQuery
}

function handleTouchStart(evt) {
    const firstTouch = getTouches(evt)[0];
    xDown = firstTouch.clientX;
    yDown = firstTouch.clientY;
    xtrigger = 0;
    ytrigger = 0;
    dtrigger = 0;
};

function handleTouchMove(evt) {
    if ( ! xDown || ! yDown || ! started) {
        return;
    }

    let xUp = evt.touches[0].clientX;
    let yUp = evt.touches[0].clientY;

    let xDiff = xDown - xUp;
    let yDiff = yDown - yUp;
    sensibility = Number(document.getElementById("sencontrol").value);

    if ( Math.abs( xDiff ) > Math.abs( yDiff ) ) {/*most significant*/
        /* right swipe */
        if ( xDiff > 0 ) {
            ytrigger = 0;
            dtrigger = 0;
            if(xtrigger<sensibility)
                xtrigger++
            else
                xtrigger=0;
            if(xtrigger==sensibility)
                move(-1, playfield, falling, true);
        } else {
            /* left swipe */
            xtrigger = 0;
            dtrigger = 0;
            if(ytrigger<sensibility)
                ytrigger++
            else
                ytrigger=0;
            if(ytrigger==sensibility)
                move(1, playfield, falling, true);
        }
        //console.log(xDiff);
    } else {
        if (yDiff < 0) {
            ytrigger = 0;
            xtrigger = 0;
            if (dtrigger < sensibility)
                dtrigger++
            else
                dtrigger=0;
            if (dtrigger == sensibility)
                fall(playfield, falling, true);
        }
    }
}

function onKeyDown(event) {
    let keyCode;
    if (event == null) {
	keyCode = window.event.keyCode;
    } else {
	keyCode = event.keyCode;
    }
    switch (keyCode) {
    case KeyCodes.SPACE:
	start();
	break;
    case KeyCodes.ARROWD:
	fall(playfield, falling, true);
	break;
    case KeyCodes.ARROWL:
	move(-1, playfield, falling, true);
	break;
    case KeyCodes.ARROWR:
	move(1, playfield, falling, true);
	break;
    case KeyCodes.ARROWU:
	rotate(playfield, falling, true);
	break;
    default:
	break;
    }
}

window.addEventListener("load", () => {
    setField();
    window.requestAnimationFrame(draw);
    window.highscores.init("Tetris", "scoreboard").then(() => {
        restoreGame();
        scoreboard.classList.add("opened");
        window.addEventListener("pointerup", start);
        document.addEventListener('touchstart', handleTouchStart, false);
        document.addEventListener('touchmove', handleTouchMove, false);
        document.addEventListener('keydown', onKeyDown);
        document.addEventListener("visibilitychange", saveGame);
    });
});

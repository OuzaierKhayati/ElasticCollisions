/******CONSTANTS*******/
const canvas = getCanvas();
const ctx = canvas.getContext("2d");
const rect = canvas.getBoundingClientRect();
const gravity=0.000;
let state = [{
    x: 0,
    y: 800,
    vX: 0.4,
    vY: 0.2,
    radius: 80,
    G: gravity,
}],
oldTime=0,
squareToChose = [{
    x: 0,
    y: 0,
    radius: 0,
}];
let isMouseDown=false, mouseX, mouseY, currentX, currentY, circleRadius = 5, sizeSide = 0, speedOfChoosose =0;


function getCanvas() {
    // Select the game canvas
    const canvas = document.querySelector("#game-canvas");
    return canvas;
}

function setCanvasSize() {
    const parent = canvas.parentNode;
    canvas.width = parent.offsetWidth;
    canvas.height = parent.offsetHeight;
}

function getCanvasSize() {
    return {
        width: canvas.width,
        height: canvas.height
    }
}

function clearScreen() {
    const { width, height } = getCanvasSize();
    ctx.clearRect(0, 0, width, height);
}

function drawSquare(x, y, radius, fill) {
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI *2);
    ctx.fillStyle = fill;
    ctx.fill();
}
function drawLine(startX, startY, currentX, currentY){
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(currentX, currentY);
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.closePath();
}

function getDeltaTime(time) {
    if(state.length>0){
        const dt = time - oldTime;
        return dt;
    }
}

function collision(h){
    //const state=state[h];
    let v1X, v2X,v1Y, v2Y, fsteq, seceq ;
    for(let i=0; i<state.length; i++){
        if (i!=h){
            if(Math.sqrt ((state.x - state[i].x)**2 + (state.y - state[i].y)**2 ) == state.circleRadius+state[i].circleRadius){
                const radX1 = state[h].vX>state.vY ? (state[h].vY/state[h].vX)*Math.PI/2 : Math.PI/2 - (state[h].vX/state[h].vY)*Math.PI/2;
                const radX2 = state[i].vX>state[i].vY ? (state[i].vY/state[i].vX)*Math.PI/2 : Math.PI/2 - (state[i].vX/state[i].vY)*Math.PI/2;

                /*state.circleRadius * v1X + state[i].circleRadius * v2X == state.circleRadius * state.vX * radX1 + state[i].circleRadius * state[i].vX * radX2;
                v2X - v1X == state.vX * Math.cos(radX1) + state[i].vX * Math.cos(radX2);*/
                
                fsteq = state[h].circleRadius * state[h].vX * radX1 + state[i].circleRadius * state[i].vX * radX2;
                seceq = state[h].vX * Math.cos(radX1) + state[i].vX * Math.cos(radX2);
                
                v1X = (fsteq-state[i].circleRadius * seceq)/(state[h].circleRadius+state[i].circleRadius);
                v1Y = state[h].vX * Math.sin(radX1);

                v2X = sec + v1X;
                v2Y = state[i].vX * Math.sin(radX2);

                state[h].vX = v1X ; state[h].vY = v1Y ;
                state[i].vX = v2X ; state[i].vY = v2Y ;

            }
        }
    }
}

function applyPhysics(time) {
    const dt = getDeltaTime(time);
    const { width, height } = getCanvasSize();

    for(let i =0; i<state.length; i++){
        state[i].vY += state[i].G * dt;
        state[i].x += state[i].vX * dt;
        state[i].y += state[i].vY * dt;
        if (state[i].y >= height - state[i].radius) {
            state[i].vY = - Math.abs(state[i].vY) * 0.7;
            state[i].y = height - state[i].radius;
        }
        if (state[i].y <= state[i].radius){
            state[i].vY = Math.abs(state[i].vY) * 0.7;
            state[i].y =  state[i].radius;
        }
        if (state[i].x >= width -state[i].radius){
            state[i].vX = -Math.abs(state[i].vX) * 0.7;
            state[i].x = width-state[i].radius;
        }
        if (state[i].x <= state[i].radius){
            state[i].vX = Math.abs(state[i].vX) * 0.7;
            state[i].x = state[i].radius;
        }
        collision(i);
    }
    //collision(i);

}
function chose(mouseX, mouseY, circleRadius){
    squareToChose[0].x = mouseX;
    squareToChose[0].y = mouseY;
    squareToChose[0].radius = circleRadius;

}

function renderGame() {

    // Clear screen
    clearScreen();

    // Draw game
    for (let i=0; i<state.length; i++){
        drawSquare(state[i].x,state[i].y, state[i].radius, 'white');
    }
    if(isMouseDown){

        if(sizeSide==0){
            chose(mouseX, mouseY, circleRadius);
            if(speedOfChoosose>1){circleRadius += 5 ; speedOfChoosose=0} 
            else{speedOfChoosose+=1}
            if(circleRadius == 85){sizeSide=1;}
        }
        else{
            chose(mouseX, mouseY, circleRadius);
            if(speedOfChoosose>1){circleRadius -= 5 ; speedOfChoosose=0} 
            else{speedOfChoosose+=1}
            if(circleRadius == 0){sizeSide=0;}
        }

        for(let i =0; i<squareToChose.length; i++){
            drawSquare(squareToChose[i].x,squareToChose[i].y, squareToChose[i].radius, 'white');
        }
        if(currentX){
            drawLine(mouseX, mouseY, currentX, currentY);
        }
    }
}

function gameLoop(time) {
    // Main game
    applyPhysics(time);
    renderGame();

    // End calls
    oldTime = time;
    window.requestAnimationFrame(gameLoop);
}
function mouseAdd(mouseX, mouseY, circleRadius){
    state.push({
        x: mouseX,
        y: mouseY,
        vX: 0,
        vY: 0,
        radius: circleRadius,
        G: gravity,
    })
} 

function main() {
    // Set canvas width & height automatically
    setCanvasSize();
    window.addEventListener('resize', () => {
        setCanvasSize();
    })
    document.addEventListener('keyup', (e) => {
        const {
            x,
            y
        } = {
            ArrowUp: {
                x: 0,
                y: -1
            },
            ArrowDown: {
                x: 0,
                y: 1
            }, ArrowRight: {
                x: 1,
                y: 0
            }, ArrowLeft: {
                x: -1,
                y: 0
            },
        }[e.key];

        const power = 0.2;
        for(let i=0; i<state.length; i++){
            state[i].vX += x * power;
            state[i].vY += y * power;
        }
    })

    document.addEventListener('mouseup', (e) => {
        isMouseDown=false;
        mouseAdd(mouseX, mouseY, circleRadius,currentX,currentY);
        const d = Math.sqrt ((mouseX - currentX)**2 + (mouseY - currentY)**2 );
        const rad = Math.acos(Math.abs(mouseX-currentX) / d);
        if(currentX>mouseX){
            state[state.length-1].vX += -(d / circleRadius) * 0.1 * ((Math.PI/2)-rad) ;
        }else{
            state[state.length-1].vX += (d / circleRadius) * 0.1 * ((Math.PI/2)-rad) ;
        }
        if(currentY>mouseY){
            state[state.length-1].vY += -(d / circleRadius) * 0.1 * rad ;
        }else{
            state[state.length-1].vY += (d / circleRadius) * 0.1 * rad ;
        }
        circleRadius = 5;
    })

    document.addEventListener('mousedown', (e) => {
        currentX = undefined;
        mouseX = e.clientX - rect.left;
        mouseY = e.clientY - rect.top;
        isMouseDown=true;
    })

    document.addEventListener('mousemove', (e) => {
        if(isMouseDown){
            currentX = e.clientX - rect.left;
            currentY = e.clientY - rect.top;
        }
    })

    document.addEventListener('keyup', (e) => {
        switch (e.key){
            case "r": state=[]; console.log("State after pressing 'r':", state); break;
        }
    });
    

    // Run game
    window.requestAnimationFrame(gameLoop)
}


/****Main call*****/
main();





//////////////////////////////////////////////////////////////////////////////////////////////////////////

/******CONSTANTS*******/
const canvas = getCanvas();
const ctx = canvas.getContext("2d");
const rect = canvas.getBoundingClientRect();
let gravity=0;
let state = [{
    x: 600,
    y: 400,
    vX: 0.5,
    vY: 0.5,
    radius: 80,
    G: gravity,
    collision: [],
}],
oldTime=0,
squareToChose = [{
    x: 0,
    y: 0,
    radius: 0,
}];
let isMouseDown=false, mouseX, mouseY, currentX, currentY, circleRadius = 5, sizeSide = 0, speedOfChoosose =0;


function getCanvas() {
    // Select the game canvas
    const canvas = document.querySelector("#game-canvas");
    return canvas;
}

function setCanvasSize() {
    const parent = canvas.parentNode;
    canvas.width = parent.offsetWidth;
    canvas.height = parent.offsetHeight;
}

function getCanvasSize() {
    return {
        width: canvas.width,
        height: canvas.height
    }
}

function clearScreen() {
    const { width, height } = getCanvasSize();
    ctx.clearRect(0, 0, width, height);
}

function drawSquare(x, y, radius, fill) {
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI *2);
    ctx.fillStyle = fill;
    ctx.fill();
}
function drawLine(startX, startY, currentX, currentY){
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(currentX, currentY);
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.closePath();
}

function getDeltaTime(time) {
    if(state.length>0){
        const dt = time - oldTime;
        return dt;
    }
}

function findCollision(c,h){
    if(state[c].collision.length > 0){
        for (let i=0; i<state[h].collision.length; i++){
            if(state[h].collision[i] == c ){
                return true;
            }
        }
        return false;
    }
    else return false;
}
function removeCollision(){

    for(let i =0 ; i<state.length; i++){
        if(state[i].collision.length > 0 ){
         state[i].collision = [];   
        }
    }
}

function collision(h){
    //const state=state[h];
    let v1X, v2X,v1Y, v2Y, fsteq, seceq , V1, V2, radX1, radX2;
    for(let i=0; i<state.length; i++){
        if (i!=h){
            if( (Math.sqrt ((state[h].x - state[i].x)**2 + (state[h].y - state[i].y)**2 ) <= state[h].radius+state[i].radius) ){

                    if(state[h].vX==0 && state[h].vY!=0){
                        radX1 = Math.PI/2;
                    }
                    else if (state[h].vX!=0 && state[h].vY==0){
                        radX1 = 0;
                    }
                    else if(state[h].vX!=0 && state[h].vY!=0){
                        radX1 = (Math.PI/2)/ (Math.abs(state[h].vY/state[h].vX)+1);
                    }
                    if(state[i].vX==0 && state[i].vY!=0){
                        radX2 = Math.PI/2;
                    }
                    else if (state[i].vX!=0 && state[i].vY==0){
                        radX2 = 0;
                    }
                    else if(state[i].vX!=0 && state[i].vY!=0){
                        radX2 = (Math.PI/2)/ (Math.abs(state[i].vY/state[i].vX)+1);
                    }
                    
                    if(radX1 && radX2){
                        V1= state[h].vX>0 ? Math.sqrt(state[h].vX **2 + state[h].vY **2): -Math.sqrt(state[h].vX **2 + state[h].vY **2) ;
                        V2= state[i].vX>0 ? Math.sqrt(state[i].vX **2 + state[i].vY **2): -Math.sqrt(state[i].vX **2 + state[i].vY **2) ;
        
                        fsteq = state[h].radius * V1 * Math.cos(radX1) + state[i].radius * V2 * Math.cos(radX2) ;
                        v1Y = V1 * Math.sin(radX1);
                        v2Y = V2 * Math.sin(radX2);
        
                        V1 = V1>0 ? 1*V1: -1*V1;
                        V2 = V2>0 ? 1*V2: -1*V2;
        
                        seceq = V1 * Math.cos(radX1) + V2 * Math.cos(radX2);
        
                        v1X = (fsteq-state[i].radius * seceq)/(state[h].radius + state[i].radius);
                        v2X = seceq + v1X;
                        
                        if(v1X!=0){state[h].vX = v1X;}
                        if(v1Y!=0){state[h].vY = v1Y;}
                        if(v2X!=0){state[i].vX = v2X;}
                        if(v2Y!=0){state[i].vY = v2Y;}
    
                        state[h].collision.push(i);
                        state[i].collision.push(h);
                    }
                    else if (!radX1){

                    }
                    else {
                        
                    }
                
            }
        }
    }
}
function adjustCoordinates(x1, y1, x2, y2, radiusC1, radiusC2, d){
    const sumRadius = radiusC1 + radiusC2;
    const factor = sumRadius / d;
    if (x1 > x2) {
        x2 = x1 - (x1 - x2) * factor;
    } else {
        x2 = x1 + (x2 - x1) * factor;
    }

    if (y1 > y2) {
        y2 = y1 - (y1 - y2) * factor;
    } else {
        y2 = y1 + (y2 - y1) * factor;
    }

    return {x2, y2};
}
function testPosition(h){
    let res;
    for(let i=0; i<state.length; i++){
        if(i!=h){
            const d = Math.sqrt ((state[h].x - state[i].x)**2 + (state[h].y - state[i].y )**2 );
            if(d<(state[h].radius+state[i].radius)){
                if(state[h].radius > state[i].radius){
                    res = adjustCoordinates(state[h].x, state[h].y, state[i].x, state[i].y, state[h].radius, state[i].radius, d)
                    state[i].x = res.x2; state[i].y = res.y2;
                }
                else {
                    res = adjustCoordinates(state[i].x, state[i].y, state[h].x, state[h].y, state[i].radius, state[h].radius, d)
                    state[h].x = res.x2; state[h].y = res.y2;
                }
            }
        }
    }
}

function applyPhysics() {
    //const dt = getDeltaTime(time);
    const { width, height } = getCanvasSize();
    for(let i = 0; i<state.length; i++){
        testPosition(i);
    }
    for(let i =0; i<state.length; i++){
        state[i].vY += state[i].G * state[i].radius;
        state[i].x += state[i].vX ;
        state[i].y += state[i].vY ;
        if (state[i].y >= height - state[i].radius) {
            state[i].vY = - Math.abs(state[i].vY) * 0.7;
            state[i].y = height - state[i].radius;
        }
        if (state[i].y <= state[i].radius){
            state[i].vY = Math.abs(state[i].vY) * 0.7;
            state[i].y =  state[i].radius;
        }
        if (state[i].x >= width -state[i].radius){
            state[i].vX = -Math.abs(state[i].vX) * 0.7;
            state[i].x = width-state[i].radius;
        }
        if (state[i].x <= state[i].radius){
            state[i].vX = Math.abs(state[i].vX) * 0.7;
            state[i].x = state[i].radius;
        }
        collision(i);
    }
    removeCollision();

}
function chose(mouseX, mouseY, circleRadius){
    squareToChose[0].x = mouseX;
    squareToChose[0].y = mouseY;
    squareToChose[0].radius = circleRadius;

}

function renderGame() {

    // Clear screen
    clearScreen();

    // Draw game
    for (let i=0; i<state.length; i++){
        drawSquare(state[i].x,state[i].y, state[i].radius, 'white');
    }
    if(isMouseDown){

        if(sizeSide==0){
            chose(mouseX, mouseY, circleRadius);
            if(speedOfChoosose>1){circleRadius += 5 ; speedOfChoosose=0} 
            else{speedOfChoosose+=1}
            if(circleRadius == 85){sizeSide=1;}
        }
        else{
            chose(mouseX, mouseY, circleRadius);
            if(speedOfChoosose>1){circleRadius -= 5 ; speedOfChoosose=0} 
            else{speedOfChoosose+=1}
            if(circleRadius == 0){sizeSide=0;}
        }

        for(let i =0; i<squareToChose.length; i++){
            drawSquare(squareToChose[i].x,squareToChose[i].y, squareToChose[i].radius, 'white');
        }
        if(currentX){
            drawLine(mouseX, mouseY, currentX, currentY);
        }
    }
}

function gameLoop() {
    // Main game
    applyPhysics();
    renderGame();

    // End calls
    //oldTime = time;
    window.requestAnimationFrame(gameLoop);
}
function mouseAdd(mouseX, mouseY, circleRadius){
    state.push({
        x: mouseX,
        y: mouseY,
        vX: 0,
        vY: 0,
        radius: circleRadius,
        G: gravity,
        collision: [],
    })
} 

function main() {
    // Set canvas width & height automatically
    setCanvasSize();
    window.addEventListener('resize', () => {
        setCanvasSize();
    })
    document.addEventListener('keyup', (e) => {
        const {
            x,
            y
        } = {
            ArrowUp: {
                x: 0,
                y: -1
            },
            ArrowDown: {
                x: 0,
                y: 1
            }, ArrowRight: {
                x: 1,
                y: 0
            }, ArrowLeft: {
                x: -1,
                y: 0
            },
        }[e.key];

        const power = 0.2;
        for(let i=0; i<state.length; i++){
            state[i].vX += x * power;
            state[i].vY += y * power;
        }
    })

    document.addEventListener('mouseup', (e) => {
        isMouseDown=false;
        mouseAdd(mouseX, mouseY, circleRadius,currentX,currentY);
        const d = Math.sqrt ((mouseX - currentX)**2 + (mouseY - currentY)**2 );
        if(!currentX || !currentY){
            state[state.length-1].vX = 0;
            state[state.length-1].vY = 0;
        }else {
            const rad = Math.acos(Math.abs(mouseX-currentX) / d);
            if(currentX>mouseX){
                state[state.length-1].vX += -(d / circleRadius) * 0.1 * ((Math.PI/2)-rad) ;
            }else{
                state[state.length-1].vX += (d / circleRadius) * 0.1 * ((Math.PI/2)-rad) ;
            }
            if(currentY>mouseY){
                state[state.length-1].vY += -(d / circleRadius) * 0.1 * rad ;
            }else{
                state[state.length-1].vY += (d / circleRadius) * 0.1 * rad ;
            }
        }
        circleRadius = 5;
    })

    document.addEventListener('mousedown', (e) => {
        currentX = undefined;
        mouseX = e.clientX - rect.left;
        mouseY = e.clientY - rect.top;
        isMouseDown=true;
    })

    document.addEventListener('mousemove', (e) => {
        if(isMouseDown){
            currentX = e.clientX - rect.left;
            currentY = e.clientY - rect.top;
        }
    })

    document.addEventListener('keyup', (e) => {
        switch (e.key){
            case "r": state=[]; break;
            case "g": if(gravity==0) {
                gravity = 0.06;
                for(let i = 0 ; i<state.length; i++){
                    state[i].G = gravity;
                }

            }else{
                gravity=0;
                for(let i = 0 ; i<state.length; i++){
                    state[i].G = gravity;
                }

            }; break;

        }
    });
    

    // Run game
    window.requestAnimationFrame(gameLoop)
}


/****Main call*****/
main();


if(state[h].vX==0 && state[h].vY!=0){
    if (state[h].vY<0) {radX1 = Math.PI/2;}
    else {radX1 = 3*Math.PI/2;}
}
else if ((state[h].vX!=0 && state[h].vY==0) || (state[h].vX==0 && state[h].vY==0)){
    if (state[h].vX<0) {radX1 = Math.PI;}
    else {radX1 = 0;}
}
else{
    radX1 = (Math.PI/2)/ (Math.abs(state[h].vY/state[h].vX)+1);
}
if(state[i].vX==0 && state[i].vY!=0){
    if (state[i].vY<0) {radX2 = Math.PI/2;}
    else {radX2 = 3*Math.PI/2;}
}
else if ((state[i].vX!=0 && state[i].vY==0) || (state[i].vX==0 && state[i].vY==0)){
    if (state[i].vX<0) {radX2 = Math.PI;}
    else {radX2 = 0;}
}




document.addEventListener('mousedown', (e) => {
    const withinCanvasX = e.clientX >= rect1.left && e.clientX <= rect1.right;
    const withinCanvasY = e.clientY >= rect1.top && e.clientY <= rect1.bottom;
    console.log(rect1.left, rect1.right, rect1.top, rect1.bottom, e.clientX, e.clientY);

    if (withinCanvasX && withinCanvasY){
        currentX = undefined;
        mouseX = e.clientX - rect.left;
        mouseY = e.clientY - rect.top;
        isMouseDown=true;
    }
})
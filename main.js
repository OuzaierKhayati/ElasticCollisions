/******CONSTANTS*******/
const canvas = getCanvas();
const ctx = canvas.getContext("2d");
const rect = canvas.getBoundingClientRect();
const canvasSelector = document.querySelector('canvas'); // Assuming you have a canvas element
const rect1 = canvasSelector.getBoundingClientRect();
const w = window.innerWidth;
const h = window.innerHeight;
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
let isMouseDown=false, mouseX, mouseY, currentX, currentY, circleRadius = 40, sizeSide = 0, speedOfChoosose =0;


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
    ctx.strokeStyle = 'black';
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

function equalsRadius(b1, b2, m1, m2) {
    const v1 = Math.sqrt(state[b1].vX ** 2 + state[b1].vY ** 2);
    const v2 = Math.sqrt(state[b2].vX ** 2 + state[b2].vY ** 2);
    const deltaY = state[b2].y - state[b1].y;
    const deltaX = state[b2].x - state[b1].x;
    const phi = Math.atan2(deltaY, deltaX);
    let theta1,theta2;
    if(v1==0){
        theta1 = Math.atan(m1*Math.sin(phi)/(m2+m1*Math.cos(phi)))
        theta2 = (Math.PI - phi)/2;
    }else if(v2==0){
        theta1 = Math.atan(m2*Math.sin(phi)/(m1+m2*Math.cos(phi)))
        theta2 = (Math.PI - phi)/2;
    }
    else{
        const Vcomx = (m1*state[b1].vX + m2*state[b2].vX) / (m1+m2);
        const Vcomy = (m1*state[b1].vY + m2*state[b2].vY) / (m1+m2);
        const x1v = -(state[b1].vX - Vcomx)+Vcomx;
        const y1v = -(state[b1].vY - Vcomy)+Vcomy;
        const x2v = -(state[b2].vX - Vcomx)+Vcomx;
        const y2v = -(state[b2].vY - Vcomy)+Vcomy;
        theta1 = Math.atan(y1v/x1v);
        theta2 = Math.atan(y2v/x2v);
    }
    

    const v1xF = Math.cos(phi) * ((v1 * Math.cos(theta1 - phi) * (m1 - m2) + 2 * m2 * v2 * Math.cos(theta2 - phi)) / (m1 + m2)) + v1 * Math.sin(theta1 - phi) * Math.cos(phi + Math.PI / 2);
    const v1yF = Math.sin(phi) * ((v1 * Math.cos(theta1 - phi) * (m1 - m2) + 2 * m2 * v2 * Math.cos(theta2 - phi)) / (m1 + m2)) + v1 * Math.sin(theta1 - phi) * Math.sin(phi + Math.PI / 2);

    const v2xF = Math.cos(phi) * ((v2 * Math.cos(theta2 - phi) * (m2 - m1) + 2 * m1 * v1 * Math.cos(theta1 - phi)) / (m1 + m2)) + v2 * Math.sin(theta2 - phi) * Math.cos(phi + Math.PI / 2);
    const v2yF = Math.sin(phi) * ((v2 * Math.cos(theta2 - phi) * (m2 - m1) + 2 * m1 * v1 * Math.cos(theta1 - phi)) / (m1 + m2)) + v2 * Math.sin(theta2 - phi) * Math.sin(phi + Math.PI / 2);

    // Calculate the momentum to decide the direction
    const p1Initial = m1 * v1;
    const p2Initial = m2 * v2;
    if(p1Initial>p2Initial){
        state[b1].vX = state[b1].vX > 0 ? Math.abs(v1xF) : -Math.abs(v1xF);
        state[b1].vY = state[b1].vY  > 0 ? Math.abs(v1yF) : -Math.abs(v1yF);
        state[b2].vX = deltaX > 0 ? Math.abs(v2xF) : -Math.abs(v2xF);
        state[b2].vY = deltaY > 0 ? Math.abs(v2yF) : -Math.abs(v2yF);
    }
    else {
        state[b1].vX = deltaX > 0 ? -Math.abs(v1xF) : Math.abs(v1xF);
        state[b1].vY = deltaY > 0 ? -Math.abs(v1yF) : Math.abs(v1yF);
        state[b2].vX = state[b2].vX > 0 ? Math.abs(v2xF) : -Math.abs(v2xF);
        state[b2].vY = state[b2].vY > 0 ? Math.abs(v2yF) : -Math.abs(v2yF);
    }

   /*const delateP = Math.abs(m1-m2)*0.03;
    if(delateP<0){
        state[b1].vX *= delateP;
        state[b1].vY *= delateP;
        state[b2].vX /= delateP;
        state[b2].vY /= delateP;
    }else if (delateP>0){
        state[b1].vX /= delateP;
        state[b1].vY /= delateP;
        state[b2].vX *= delateP;
        state[b2].vY *= delateP;
    }
    /*state[b1].vX = deltaX > 0 ? -Math.abs(v1xF) : Math.abs(v1xF);
    state[b1].vY = deltaY > 0 ? -Math.abs(v1yF) : Math.abs(v1yF);
    state[b2].vX = deltaX > 0 ? Math.abs(v2xF) : -Math.abs(v2xF);
    state[b2].vY = deltaY > 0 ? Math.abs(v2yF) : -Math.abs(v2yF);*/

}

function collision(h){

    let radX1, radX2;
    for(let i=0; i<state.length; i++){
        if (i!=h){
            if( (Math.sqrt ((state[h].x - state[i].x)**2 + (state[h].y - state[i].y)**2 ) <= state[h].radius+state[i].radius) ){

                if(state[h].vX==0 && state[h].vY!=0){
                    radX1 = Math.PI/2;
                }
                else if ((state[h].vX!=0 && state[h].vY==0) || (state[h].vX==0 && state[h].vY==0)){
                    radX1 = 0;
                }
                else{
                    radX1 = Math.PI -  (Math.PI/2)/ (Math.abs(state[h].vY/state[h].vX)+1);
                }
                if(state[i].vX==0 && state[i].vY!=0){
                    radX2 = Math.PI/2;
                }
                else if ((state[i].vX!=0 && state[i].vY==0) || (state[i].vX==0 && state[i].vY==0)){
                    radX2 = 0;
                }
                else{
                    radX2 = Math.PI - (Math.PI/2)/ (Math.abs(state[i].vY/state[i].vX)+1);
                }
                equalsRadius(h, i, state[h].radius*2, state[i].radius*2);
                
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
        drawSquare(state[i].x,state[i].y, state[i].radius, 'black');
    }
    if(isMouseDown){

        if(sizeSide==0){
            chose(mouseX, mouseY, circleRadius);
            if(speedOfChoosose>1){circleRadius += 5 ; speedOfChoosose=0} 
            else{speedOfChoosose+=1}
            if(circleRadius == 80){sizeSide=1;}
        }
        else{
            chose(mouseX, mouseY, circleRadius);
            if(speedOfChoosose>1){circleRadius -= 5 ; speedOfChoosose=0} 
            else{speedOfChoosose+=1}
            if(circleRadius == 0){sizeSide=0;}
        }

        for(let i =0; i<squareToChose.length; i++){
            drawSquare(squareToChose[i].x,squareToChose[i].y, squareToChose[i].radius, 'black');
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
                state[state.length-1].vX += -(d / circleRadius)  * ((Math.PI/2)-rad) ;
            }else{
                state[state.length-1].vX += (d / circleRadius) * ((Math.PI/2)-rad) ;
            }
            if(currentY>mouseY){
                state[state.length-1].vY += -(d / circleRadius)  * rad ;
            }else{
                state[state.length-1].vY += (d / circleRadius)  * rad ;
            }
        }
        circleRadius = 5;
    })

    document.addEventListener('mousedown', (e) => {

        const withinCanvasX = e.clientX >= rect1.left && e.clientX <= w-rect1.left;
        const withinCanvasY = e.clientY >= rect1.top && e.clientY <= h-rect1.top*2;

        if(withinCanvasX && withinCanvasY){

            currentX = undefined;
            mouseX = e.clientX - rect.left;
            mouseY = e.clientY - rect.top;
            isMouseDown=true;
        }
        else{
            mouseX=undefined;
            mouseY=undefined;
        }

    })

    document.addEventListener('mousemove', (e) => {
        if(isMouseDown){
            currentX = e.clientX - rect.left;
            currentY = e.clientY - rect.top;
        }
    })
    const gravityElement = document.getElementById("displayGravity");

    document.addEventListener('keyup', (e) => {
        if(e.key ==="r" || e.key==="R"){
            state=[];
        }else if (e.key ==="g" || e.key==="G"){
            if(gravity==0) {
                gravity = 0.009;
                for(let i = 0 ; i<state.length; i++){
                    state[i].G = gravity;
                }
                gravityElement.innerText = "Gravity: ON";

            }else{
                gravity=0;
                for(let i = 0 ; i<state.length; i++){
                    state[i].G = gravity;
                    state[i].vY = -1;
                }
                gravityElement.innerText = "Gravity: OFF";
            }
        }
    });
    
    // Run game
    window.requestAnimationFrame(gameLoop)
}


/****Main call*****/
main();

//
//   Emergence of diverse epidermal patterns 
//   via the integration of the Turing pattern model 
//   with the majority voting model 
//   2023.7.1
//
var canvas;
var ctx;
var cellSize = 8;   // Number of dots per cell
var meshNum ;       // Number of vertical and horizontal cells
var w   ;      // morphological parameter
var w2  ;      // morphological parameter

var x,y ;
var cells = new Array();     // Cell State
var cells_x = new Array();   // x-coordinate of cell
var cells_y = new Array();   // y-coordinate of cell

var buttonStart;
var buttonRandom;
var buttonReset;
var timer1;
var running = false;
 
window.onload = function()
{
    canvas = document.getElementById('lifegame');
    ctx = canvas.getContext('2d');
    meshNum = 100 ;
    initCells();
    buttonStart  = document.getElementById('buttonStart');
    buttonRandom = document.getElementById('buttonRandom');
    buttonReset  = document.getElementById('buttonReset');
    buttonStart.addEventListener('click', onStart, false);
    buttonRandom.addEventListener('click', randomCells, false);
    buttonReset.addEventListener('click', initCells, false);
    canvas.addEventListener('click', canvasClick, false);
};
 
// Start button
function onStart(){
    if(running){
        clearInterval(timer1);
        buttonStart.value = "Start";
        running = false;
    } else {
        nextGeneration();
        timer1 = setInterval("nextGeneration()", 100);
        buttonStart.value = "Stop";
        running = true;
    }
}
 
// Initialization, or Reset button
function initCells(){
	var ni, nj ;
	
    ctx.fillStyle = 'rgb( 0, 110, 110)';
    ctx.fillRect(0,0, canvas.width, canvas.height);
    for(i=0;i<=meshNum;i++){
        cells[i]   = new Array();
        cells_x[i] = new Array();
        cells_y[i] = new Array();
	}
    for(i=1;i<=meshNum;i++){
        for(j=1;j<=meshNum;j++){
            cells[i][j]  = 0;
		 	cells_x[i][j]=(0+((j-1)%2)*cellSize/2+(i-1)*cellSize);
		 	cells_y[i][j]=(0+ (j-1)*cellSize*Math.sqrt(3)/2);
        }
    }

    redraw();
}
 
// Random button ; Random placement of states 0 and 1
function randomCells(){

    for(x=0;x<=meshNum;x++){
        cells[x] = new Array();
	}
	
    for(x=1;x<=meshNum;x++){
    for(y=1;y<=meshNum;y++){
       if ( Math.random()>0.50) {//0.50
     	 cells[x][y] = 1;
	   } else {
		 cells[x][y] = 0;
	   }
     	//cells[x][y] = Math.round( Math.random());
    }
    }
    redraw();
}
 
// Drawing Cell Space and results
function redraw(){
    for(x=1;x<=meshNum;x++){
    for(y=1;y<=meshNum;y++){
        drawCell(x, y);
    }
    }
}
 
// Drawing Cell 
function drawCell(xx, yy){
    var value = cells[xx][yy];
    ctx.strokeStyle='rgb(100, 0,0)';
    ctx.lineWidth= 1;
    //console.log("value=",value,x,y);
    if (value==0) {ctx.fillStyle = 'rgb( 100,100,100)';}
    if (value==1) {ctx.fillStyle = 'rgb(   0,255,255)';}

	ctx.beginPath();
    //ctx.fillRect(xx * cellSize, yy * cellSize, cellSize - 1, cellSize - 1);
    ctx.arc( cells_x[xx][yy]+cellSize/2,cells_y[xx][yy]+cellSize/2 , cellSize/2, 0 , 2*Math.PI);
	ctx.fill();
	ctx.closePath();
	ctx.stroke();
		
}
 
// Calculation routine with integrated model
function nextGeneration(){
    var sum1,sum2,total ;

    var nextCells = new Array();
    for(x=0;x<=meshNum;x++){
        nextCells[x] = new Array();
	}

	var r1 = 6;     //  outer neighborhood range
	var r2 = 3;　　　　　//  inner neighborhood range
  

    for(x=1;x<=meshNum;x++){
        for(y=1;y<=meshNum;y++){
			
            sum1 = countAround(x, y, r1);
            sum2 = countAround(x, y, r2);
            total = countTotal(x, y, r2);
            
			sum1=sum1 -sum2;

			// Skin pattern integration model
			// Parameters for Turing Patterns
            //w=0.32 ;
			//var a = 0 ;
			
			// Parameters for Majority Model
            //w=0.0 ;
			//var a = total/2 ;
            
			// Parameters for the intermediate model
            var w=0.25;　　//0.1
			var a=0.3;  // 0.7
			var a = total/2*a ;

			// Skin pattern integration model
            
			if((sum2 -(sum1*w))==a)  {nextCells[x][y]=cells[x][y] ; } 
           　if((sum2 -(sum1*w))>a)   {nextCells[x][y]=1 ; } 
           　if((sum2 -(sum1*w))<a)   {nextCells[x][y]=0 ; } 

			// Skin pattern integration model＋invariant model of boundary
            /* 
			var b=0.8 ;//0.4
           　if (cells[x][y]==1) nextCells[x][y]=1 ; else  nextCells[x][y]=0; 
           　if((sum2 -(sum1*w))>a*(1+b))   {nextCells[x][y]=1 ; } 
           　if((sum2 -(sum1*w))<a*(1-b))   {nextCells[x][y]=0 ; } 
            */
			
        }
    }
    cells = nextCells;
    redraw();
}
 
// Sum the states of cells within radius r from coordinates x,y
function countAround(x, y, r){
    var count = 0;
	var rr ;
    for(i=(r*-1-4);i<=r+4;i++){
        for(j=(r*-1-6);j<=r+6;j++){
	        rr =Math.sqrt((0+i)**2 + ((0+j)*Math.sqrt(3)/2)**2);		
			if (rr<=r) {
			var xx = x + i ;
			var yy = y + j ;
             
			if (xx<=0) { xx = meshNum+x+i; }
			else if (xx>=(meshNum+1)) { xx =(x-meshNum)+i;}
			
			if (yy<=0) { yy = meshNum+y+j;}
			else if (yy>=(meshNum+1)) { yy =(y-meshNum)+j;}
	
			count = count + cells[xx][yy];
			}
        }
    }
    return count;
}

// Count the number of cells within radius r from coordinates x,y
function countTotal(x, y, r){
    var count = 0;
	var rr ;
    for(i=(r*-1-4);i<=r+4;i++){
        for(j=(r*-1-6);j<=r+6;j++){
	        rr =Math.sqrt((0+i)**2 + ((0+j)*Math.sqrt(3)/2)**2);		
			if (rr<=r) {
			var xx = x + i ;
			var yy = y + j ;
             
			if (xx<=0) { xx = meshNum+x+i; }
			else if (xx>=(meshNum+1)) { xx =(x-meshNum)+i;}
			
			if (yy<=0) { yy = meshNum+y+j;}
			else if (yy>=(meshNum+1)) { yy =(y-meshNum)+j;}
	
			count = count + 1;
			}
        }
    }
    return count;
}

 

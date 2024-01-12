let canvas = document.querySelector('canvas')
let c = canvas.getContext('2d')

canvas.width = window.innerWidth
canvas.height = window.innerHeight

let MOUSE = {
    x: 0,
    y: 0
}

let MODE = 0
const CURSOR_COLORS = ['#4CB944', '#FFC4D1', '#08415C', '#FC9E4F', '#EC0B43']
let SELECTED = {from: null, to: null}
let SELECTED_TRIANGLE = {v1: null, v2: null, v3: null}
let DRAGGING = null
let TOGGLE_FUZZY_BALLS = false
let TOGGLE_FUZZY_SIMPLICES = false
let TOGGLE_INFO = false

let graph = new Graph
let realGraph = new RealGraph(graph)
let N_NEIGHBORS = 3
let knnN = make_knn(N_NEIGHBORS)
realGraph.vertexColor = '#121420'
realGraph.edgeColor = '#DB2763'
realGraph.triangleColor = '#54DEFD'
realGraph.fuzzyBallColor = '#C45BAA'
realGraph.vertexRadius = 6
realGraph.max_v = canvas.width
realGraph.sigma_prec = 100
realGraph.n_neighbors = N_NEIGHBORS
bgColor = '#EEF5DB'
selectedColor = '#FF6542'

let cursor = new Cursor(0,0,'red', 0.6)

window.addEventListener('mousemove', e => {
    MOUSE.x = e.x
    MOUSE.y = e.y
    if(MODE === 3 && (DRAGGING != null && DRAGGING != undefined)){
        realGraph.updateVertex(DRAGGING, e.x, e.y)
        knnN(realGraph.graph.vertices)
        realGraph.computeFuzzySimplices()
        realGraph.eliminateDegenerates()
    }

})

window.addEventListener('click', e => {
    switch(MODE){
        case 0:
            realGraph.addVertex({x: MOUSE.x, y: MOUSE.y, r: 10, color: '#3D5A6C'})   
            knnN(realGraph.graph.vertices)
            realGraph.computeFuzzySimplices()
            realGraph.eliminateDegenerates()
            break
        case 1:
            if(SELECTED.from != null && SELECTED.from != undefined){
                SELECTED.to = realGraph.contains(MOUSE.x, MOUSE.y)
                realGraph.linkVertices(SELECTED.from, SELECTED.to)
                SELECTED.from = null
                SELECTED.to = null
            }
            else SELECTED.from = realGraph.contains(MOUSE.x, MOUSE.y)
            break
        case 2:  
            if(SELECTED_TRIANGLE.v2 != null && SELECTED_TRIANGLE.v2 != undefined){
                SELECTED_TRIANGLE.v3 = realGraph.contains(MOUSE.x, MOUSE.y)
                realGraph.triangulateVertices(SELECTED_TRIANGLE.v1, SELECTED_TRIANGLE.v2, SELECTED_TRIANGLE.v3)
                SELECTED_TRIANGLE.v1 = null
                SELECTED_TRIANGLE.v2 = null
                SELECTED_TRIANGLE.v3 = null
            }
            else if(SELECTED_TRIANGLE.v1 != null && SELECTED_TRIANGLE.v1 != undefined){
                SELECTED_TRIANGLE.v2 = realGraph.contains(MOUSE.x, MOUSE.y)
            }
            else SELECTED_TRIANGLE.v1 = realGraph.contains(MOUSE.x, MOUSE.y)
            break
        case 3:
            if(SELECTED.from != null && SELECTED.from != undefined){
                SELECTED.from = null
            }
            else SELECTED.from = realGraph.contains(MOUSE.x, MOUSE.y)
            break
        case 4:
            realGraph.deleteVertex(realGraph.contains(MOUSE.x, MOUSE.y))   
            knnN(realGraph.graph.vertices)
            realGraph.computeFuzzySimplices()
            realGraph.eliminateDegenerates()
            break
        // case 5:
        //     knn(realGraph.graph.vertices, 3)
        //     break
    }
})

window.addEventListener('mousedown', e => {
    DRAGGING = realGraph.contains(MOUSE.x, MOUSE.y)
})

window.addEventListener('mouseup', e => {
    DRAGGING = null
})

window.addEventListener('resize', e => {
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
})

window.addEventListener('keydown', e => {

    if(e.code==='Space'){
        MODE = (MODE + 1)%6
    }
    if(e.code==='KeyV'){
        for(let i=0; i<8; i++){
            realGraph.addVertex({
                x: Math.random() * (canvas.width  - 2* realGraph.vertexRadius) + realGraph.vertexRadius,
                y: Math.random() * (canvas.height - 2* realGraph.vertexRadius) + realGraph.vertexRadius,
                r: realGraph.vertexRadius,
                color: realGraph.vertexColor
            })
        }
        knnN(realGraph.graph.vertices)
        realGraph.computeFuzzySimplices()
        realGraph.eliminateDegenerates()
    }
    if(e.code==='KeyE'){
        for(let i=0; i<4; i++){
            realGraph.linkVertices(
                Object.keys(realGraph.graph.vertices)[Math.floor(Math.random() * Object.keys(realGraph.graph.vertices).length)],
                Object.keys(realGraph.graph.vertices)[Math.floor(Math.random() * Object.keys(realGraph.graph.vertices).length)])
        }
        realGraph.eliminateDegenerates()
    }

    if(e.code==='KeyT'){
        for(let i=0; i<4; i++){
            realGraph.triangulateVertices(
                Object.keys(realGraph.graph.vertices)[Math.floor(Math.random() * Object.keys(realGraph.graph.vertices).length)],
                Object.keys(realGraph.graph.vertices)[Math.floor(Math.random() * Object.keys(realGraph.graph.vertices).length)],
                Object.keys(realGraph.graph.vertices)[Math.floor(Math.random() * Object.keys(realGraph.graph.vertices).length)])
        }
        realGraph.eliminateDegenerates()
    }

    if(e.code === 'KeyW'){
        realGraph.graph.edges = new Set()
    }

    if(e.code === 'KeyB'){
        TOGGLE_FUZZY_BALLS = !TOGGLE_FUZZY_BALLS
    }

    if(e.code === 'KeyS'){
        TOGGLE_FUZZY_SIMPLICES = !TOGGLE_FUZZY_SIMPLICES
    }

    if(e.code === 'KeyH'){
        TOGGLE_FUZZY_BALLS = false
        TOGGLE_FUZZY_SIMPLICES = false
    }

    if(e.code === 'KeyJ'){
        TOGGLE_FUZZY_BALLS = true
        TOGGLE_FUZZY_SIMPLICES = true
    }

    if(e.code ==='KeyR'){
        realGraph.graph.vertices = {}
        realGraph.graph.edges = new Set()
        realGraph.graph.triangles = new Set()
    }
    if(e.code === 'KeyI'){
        TOGGLE_INFO = !TOGGLE_INFO
    }

    if(e.code === 'Digit1'){
        MODE = 0
    }
    if(e.code === 'Digit2'){
        MODE = 1
    }
    if(e.code === 'Digit3'){
        MODE = 2
    }
    if(e.code === 'Digit4'){
        MODE = 3
    }
    if(e.code === 'Digit5'){
        MODE = 4
    }
    if(e.code === 'Digit6'){
        MODE = 5
    }
    if(e.code === 'ArrowUp'){
        N_NEIGHBORS += 1
        realGraph.graph.triangles = new Set()
        knnN = make_knn(N_NEIGHBORS)
        knnN(realGraph.graph.vertices)
        realGraph.n_neighbors = N_NEIGHBORS
        realGraph.computeFuzzySimplices()
        realGraph.eliminateDegenerates()
    }
    if(e.code === 'ArrowDown'){
        N_NEIGHBORS = Math.max(N_NEIGHBORS - 1, 1)
        realGraph.graph.triangles = new Set()
        knnN = make_knn(N_NEIGHBORS)
        knnN(realGraph.graph.vertices)
        realGraph.n_neighbors = N_NEIGHBORS
        realGraph.computeFuzzySimplices()
        realGraph.eliminateDegenerates()
    }
    
    
})

function loop(){
    
    c.fillStyle = bgColor
    c.fillRect(0, 0, canvas.width, canvas.height)
    realGraph.restoreVisuals()

    if(cont = realGraph.contains(MOUSE.x, MOUSE.y)){
        realGraph.graph.vertices[cont].color = selectedColor
        realGraph.graph.vertices[cont].r = realGraph.vertexRadius * 1.2
        if(TOGGLE_INFO){
            c.font = "30px Helvetica";
            c.fillStyle = 'black'
            realGraph.graph.vertices[cont].neighbors.map((n,i) => c.fillText(JSON.stringify(n), 10, canvas.height - (40 + 40*i)));
        }
    }

    if(TOGGLE_FUZZY_BALLS){
        realGraph.drawFuzzyBalls()
        c.font = "30px Helvetica";
        c.fillStyle = 'black'
        c.fillText('EPMet', 10, 130);
    }

    if(TOGGLE_FUZZY_SIMPLICES){
        realGraph.drawTriangles()
        realGraph.drawEdges()
        c.font = "30px Helvetica";
        c.fillStyle = 'black'
        c.fillText('sFuzz', 10, 170);
    }

    if(MODE === 1 && SELECTED.from != null && SELECTED.from != undefined){
        let l = new Line(realGraph.graph.vertices[SELECTED.from].x, realGraph.graph.vertices[SELECTED.from].y, MOUSE.x, MOUSE.y)
        l.draw()
    }

    // if(MODE === 4 && SELECTED_TRIANGLE.v1 != null && SELECTED_TRIANGLE.v1 != undefined){
    //     let l = new Line(realGraph.graph.vertices[SELECTED.from].x, realGraph.graph.vertices[SELECTED.from].y, MOUSE.x, MOUSE.y)
    //     l.draw()
    // }


    realGraph.drawVertices()
    if(TOGGLE_INFO){
        c.font = "10px Helvetica";
        c.fillStyle = 'black'
        Object.entries(realGraph.graph.vertices).map(k => c.fillText(k[0] + ' ' + realGraph.graph.edgesFrom(k[0]).map(e => ' ['+e[0]+','+e[1]+']' ), k[1].x + 10, k[1].y +10))
    }

    c.font = "30px Helvetica";
    c.fillStyle = 'black'
    c.fillText(['0S', '1S', '2S', 'M', 'D', 'DRAW FUZZY BALLS', 'DRAW FUZZY EDGES'][MODE], 10, 50);
    c.font = "30px Helvetica";
    c.fillStyle = 'black'
    c.fillText(`${N_NEIGHBORS}NN`, 10, 90);


    cursor.draw()
    cursor.update(MOUSE.x, MOUSE.y, CURSOR_COLORS[MODE])
    requestAnimationFrame(loop)
}

loop()
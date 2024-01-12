let dist = (a, b) => {
    return Math.sqrt( (a.x - b.x )**2 + (a.y - b.y )**2 )
}

let knn = (X, n) => {

    for(let x_i of Object.keys(X)){
        let x_neighbors = []
        for(let y_i of Object.keys(X)){
            if(x_i === y_i) continue
            x_neighbors.push({xi: y_i, d: dist(X[x_i], X[y_i])})
        }
        x_neighbors = [...x_neighbors].sort((a, b) => a.d - b.d)
        x_neighbors = x_neighbors.slice(0, n)
        X[x_i].neighbors = x_neighbors
        // console.log(X[x_i].neighbors)
    }
}

let make_knn = n => {
    return X => knn(X, n)
}

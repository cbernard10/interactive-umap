function Circle(x, y, r, color, id=null) {
    
    this.id = id
    this.x = x
    this.y = y
    this.startradius = r
    this.r = r
    this.color = color 
    this.hovered = false
    this.selected = false
    
    this.draw = () =>
    {
        c.beginPath()
        c.arc(this.x, this.y, this.r, 0, 2*Math.PI)
        c.fillStyle = this.color ?? '#555555'   
        c.fill()
    }

    this.isinside = (x, y) => {
        return Math.sqrt((this.x - x)**2 + (this.y - y)**2) < r
    }
}

function Line(x1, y1, x2, y2, color) {

    this.x1 = x1
    this.y1 = y1
    this.x2 = x2
    this.y2 = y2
    this.color = color
    this.draw = () => {
        
        
        c.beginPath()
        c.moveTo(x1, y1)
        c.lineTo(x2, y2)
        c.strokeStyle=this.color
        c.lineWidth=3
        c.stroke()
    }

}

function Triangle(x1, y1, x2, y2, x3, y3, color){

    this.draw = () => {
        
        c.beginPath()
        c.moveTo(x1, y1)
        c.lineTo(x2, y2)
        c.lineTo(x3, y3)
        c.closePath()
        c.fillStyle = color
        c.save()
        // c.globalAlpha = 0.2
        c.fill()
        c.restore()
        c.strokeStyle=color
        c.lineWidth = 1
        c.stroke()
    }
}

function FuzzyBall(x, y, innerRadius, outerRadius, color, tolerance){

    this.draw = () => {

        // c.globalCompositeOperation=('destination-out')
        const grd = c.createRadialGradient(x, y, innerRadius, x, y, outerRadius*tolerance)
        grd.addColorStop(0, hexToRGB(color, 0.8))
        grd.addColorStop(0.3, hexToRGB(color, 0.5))
        grd.addColorStop(1, hexToRGB(color, 0))

        c.beginPath()
        c.arc(x, y, outerRadius*tolerance, 0, 2*Math.PI)
        c.fillStyle=grd
        c.fill()
    }

}

function Cursor(x, y, color, alpha){

    this.x = x
    this.y = y
    this.color = color
    this.alpha = Math.max(Math.min(alpha, 1), 0)

    this.draw = () => {

        c.beginPath()
        c.moveTo(this.x-15, this.y)
        c.lineTo(this.x+15, this.y)
        c.strokeStyle = this.color
        c.lineWidth = 5
        c.save()
        c.globalAlpha = this.alpha
        c.stroke()
        c.restore()

        c.beginPath()
        c.moveTo(this.x, this.y-15)
        c.lineTo(this.x, this.y+15)
        c.strokeStyle = this.color
        c.lineWidth = 5
        c.save()
        c.globalAlpha = this.alpha
        c.stroke()
        c.restore()
    }

    this.update = (x, y, color) => {
        this.x = x
        this.y = y
        this.color = color
        this.draw()
    }
}

function hexToRGB(hex, alpha) {
    var r = parseInt(hex.slice(1, 3), 16),
        g = parseInt(hex.slice(3, 5), 16),
        b = parseInt(hex.slice(5, 7), 16);

    if (alpha || alpha===0) {
        return "rgba(" + r + ", " + g + ", " + b + ", " + alpha + ")";
    } else {
        return "rgb(" + r + ", " + g + ", " + b + ")";
    }
}


Isometric.Box = atom.Class(
/** @lends Isometric.Box.prototype */
{
    Implements: [Drawable, Animatable],

    /** @property {Isometric.Point3D} */
    coords: null,

    /** @property {Isometric.Map} */
    map: null,

    /** @property {LibCanvas.Shapes.Polygon[]} */
    shapes: null,

    /** @property {Array} */
    colors: ['white', 'white', 'white'],

    /** @property {number} */
    speed: 200,

    size: 3,

    /**
     * @constructs
     * @param {Isometric.Point3D} coordinates
     * @param map
     */
    initialize: function (coordinates, map) {
        this.coords = Isometric.Point3D( coordinates );
        this.map    = map;
        this.currentShift = new Point(0, 0);
        this.createShapes();
    },

    /**
     * @private
     * @returns {Isometric.Box}
     */
    createShapes: function () {
        var c = this.coords, s = {
            left: [
                [c.x, c.y, c.z  ],
                [c.x, c.y, c.z+this.size],
                [c.x, c.y+this.size, c.z+this.size],
                [c.x, c.y+this.size, c.z  ]
            ],
            right: [
                [c.x, c.y+this.size, c.z+this.size],
                [c.x, c.y+this.size, c.z  ],
                [c.x+this.size, c.y+this.size, c.z  ],
                [c.x+this.size, c.y+this.size, c.z+this.size]
            ],
            top: [
                [c.x, c.y, c.z+this.size],
                [c.x, c.y+this.size, c.z+this.size],
                [c.x+this.size, c.y+this.size, c.z+this.size],
                [c.x+this.size, c.y, c.z+this.size]
            ]
        };

        this.shapes = Object.map( s, function (coords) {
            return new Polygon(
                coords.map( this.map.toIsometric )
            ).move( this.currentShift );
        }.bind(this));
        return this;
    },

    /**
     * @param {LibCanvas.Point} shift
     * @returns {Isometric.Box}
     */
    shift: function (shift) {
        for (var i in this.shapes) {
            this.shapes[i].move( shift );
        }
        this.currentShift.move( shift );
        return this;
    },

    /**
     * @param {Isometric.Point3D} shift
     * @returns {Isometric.Box}
     */
    move: function (shift, onProcess, onFinish) {
        shift = Isometric.Point3D( shift );
        var newCoords = this.coords.clone().move( shift );
        if (newCoords.z < 0.02) newCoords.z = 0.02;

        if ( this.map.hasPoint( newCoords )) {
            var time = this.getTime( shift );
            if (!time) {
                if (onProcess) onProcess.apply( this, arguments );
                if (onFinish ) onFinish.apply( this, arguments );
                return this;
            }

            this.animate({
                fn   : 'linear',
                time : time,
                props: {
                    'coords.x': newCoords.x,
                    'coords.y': newCoords.y,
                    'coords.z': newCoords.z
                },
                onProcess: function () {
                    this.createShapes();
                    if (onProcess) onProcess.apply( this, arguments );
                },
                onFinish: onFinish
            });
        }
        return this;
    },

    /**
     * @private
     * @param {Isometric.Point3D} distance
     * @returns {number}
     */
    getTime: function (distance) {
        var time = this.speed * Math.sqrt(
            distance.x.pow(2) +
            distance.y.pow(2) +
            distance.z.pow(2)
        );
        return Math.max( time, this.speed );
    },

    /** @returns {Isometric.Box} */
    draw: function () {
        var
            c = this.coords,
            z  = c.z + this.size,
            zP = this.map.toIsometric([0,0,z]).y,
            s  = this.shapes,
            stroke = 'rgba(0,32,0,0.5)',
            zIndex = z*100;

        if(zIndex<0) { zIndex = 0; }
        this.setZIndex(zIndex);

        var text = c.x + ' ' + c.y;

        if(this.map.sun.shining) {
            this.drawShadow( this.map.sun.coords, stroke );
        }
        this.libcanvas.ctx
            .save()
//            .set({
//                shadowColor  : 'black',
//                shadowOffsetX: -24 * this.size,
//                shadowOffsetY: 24 * this.size,
//                shadowBlur   : z * 3
//            })
            .text({
                text: text,
                size: 32,
                padding: [0, 70],
                color: 'white',
                align: 'right'
            })
            .fill( s.top  , this.colors[0] )
            .restore()
            .fill( s.left , this.colors[1] )
            .fill( s.right, this.colors[2] )
            .stroke( s.top  , stroke )
            .stroke( s.left , stroke )
            .stroke( s.right, stroke );
        return this;
    },

    drawShadow: function(lightCoords, color) {
        var
            c = this.coords,
            z  = c.z + this.size

        var lightX = new Point(lightCoords.x, lightCoords.z);
        var lightY = new Point(lightCoords.y, lightCoords.z);
        var boxX = [new Point(c.x, z), new Point(c.x+this.size, z)];
        var boxY = [new Point(c.y, z), new Point(c.y+this.size, z)];
        var sunAngleX = [
            lightX.angleTo(boxX[0]),
            lightX.angleTo(boxX[1])
        ];
        var sunAngleY = [
            lightY.angleTo(boxY[0]),
            lightY.angleTo(boxY[1])
        ];
        var offsetX = [
            Math.abs(this.size/Math.tan(sunAngleX[0])),
            Math.abs(this.size/Math.tan(sunAngleX[1]))
        ];
        var offsetY =[
            Math.abs(this.size/Math.tan(sunAngleY[0])),
            Math.abs(this.size/Math.tan(sunAngleY[1]))
        ];
        var shadowCoords = [];
        var text = this.map.projection.factor.x;
        var xFactor = this.map.projection.factor.x*this.size;
        var yFactor = this.map.projection.factor.y*this.size;
        if(lightCoords.x>c.x && lightCoords.y<c.y) {
            shadowCoords = [
                [c.x, c.y, c.z],
                [c.x, c.y+this.size, c.z],
                [c.x+this.size, c.y+this.size, c.z],
                [c.x-offsetX[1]+xFactor, c.y+offsetY[1], c.z],
                [c.x-offsetX[0]+xFactor, c.y+offsetY[1], c.z],
                [c.x-offsetX[0]+xFactor, c.y+offsetY[0], c.z]
            ];
        } else if(lightCoords.x>c.x && lightCoords.y>c.y) {
            shadowCoords = [
                [c.x+this.size, c.y, c.z],
                [c.x, c.y, c.z],
                [c.x, c.y+this.size, c.z],
                [c.x-offsetX[0], c.y-offsetY[1], c.z],
                [c.x-offsetX[0], c.y-offsetY[0], c.z],
                [c.x-offsetX[1], c.y-offsetY[0], c.z]
            ];
        } else if(lightCoords.x<c.x && lightCoords.y>c.y) {
            shadowCoords = [
                [c.x, c.y, c.z],
                [c.x+this.size, c.y, c.z],
                [c.x+this.size, c.y+this.size, c.z],
                [c.x+offsetX[1]+xFactor, c.y-offsetY[1], c.z],
                [c.x+offsetX[1]+xFactor, c.y-offsetY[0], c.z],
                [c.x+offsetX[0]+xFactor, c.y-offsetY[0], c.z]
            ];
        } else if(lightCoords.x<c.x && lightCoords.y<c.y) {
            shadowCoords = [
                [c.x+this.size, c.y, c.z],
                [c.x+this.size, c.y+this.size, c.z],
                [c.x, c.y+this.size, c.z],
                [c.x+offsetX[0], c.y+offsetY[1], c.z],
                [c.x+offsetX[1], c.y+offsetY[1], c.z],
                [c.x+offsetX[1], c.y+offsetY[0], c.z]
            ];
        }
        var shadow = new Polygon( shadowCoords.map( this.map.toIsometric ) ).move( this.currentShift );

        this.libcanvas.ctx
            .text({
                text: text,
                size: 32,
                padding: [40, 70],
                color: 'white',
                align: 'right'
            }).fill(shadow, color);
    }
});

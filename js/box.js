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

    size: [1,1,1],

    /**
     * @constructs
     * @param {Isometric.Point3D} coordinates
     * @param map
     */
    initialize: function (coordinates, map, size) {
        this.size = Isometric.Point3D(size);
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
                [c.x, c.y, c.z+this.size.z],
                [c.x, c.y+this.size.y, c.z+this.size.z],
                [c.x, c.y+this.size.y, c.z  ]
            ],
            right: [
                [c.x, c.y+this.size.y, c.z+this.size.z],
                [c.x, c.y+this.size.y, c.z  ],
                [c.x+this.size.x, c.y+this.size.y, c.z  ],
                [c.x+this.size.x, c.y+this.size.y, c.z+this.size.z]
            ],
            top: [
                [c.x, c.y, c.z+this.size.z],
                [c.x, c.y+this.size.y, c.z+this.size.z],
                [c.x+this.size.x, c.y+this.size.y, c.z+this.size.z],
                [c.x+this.size.x, c.y, c.z+this.size.z]
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
            z  = c.z + this.size.z,
            zP = this.map.toIsometric([0,0,z]).y,
            s  = this.shapes,
            stroke = 'rgba(0,32,0,0.5)',
            zIndex = z*100;

        if(zIndex<0) { zIndex = 0; }
        this.setZIndex(zIndex);

        var text = c.x + ' ' + c.y;

        this.showProection();
        if(this.map.sun.shining) {
            this.drawShadow( stroke );
        }
        this.libcanvas.ctx
            .save()
//            .set({
//                shadowColor  : 'black',
//                shadowOffsetX: -24 * this.size.x,
//                shadowOffsetY: 24 * this.size.y,
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
    
    showProection: function() {
        var c = this.coords;
        var coords = [
            [c.x, c.y, 0],
            [c.x+this.size.x, c.y, 0],
            [c.x+this.size.x, c.y+this.size.y, 0],
            [c.x, c.y+this.size.y, 0]
        ];
        var polygon = new Polygon( coords.map( this.map.toIsometric ) ).move( this.currentShift );
        this.libcanvas.ctx.stroke( polygon, 'rgba(200,150,150,0.5)' );
    },

    drawShadow: function(color) {
        var debug = false;
        var c = this.coords;
        var sc = this.map.sun.coords,
            sunPoints = {
                        x:[
                                new Point(sc.x, sc.z),
                                new Point(sc.x+this.map.sun.size.x, sc.z)
                            ],
                        y:[
                                new Point(sc.y, sc.z),
                                new Point(sc.y+this.map.sun.size.y, sc.z)
                            ]
            };

        var points = [
            [c.x, c.y, c.z],
            [c.x, c.y+this.size.y, c.z],
            [c.x+this.size.x, c.y+this.size.y, c.z],
            [c.x+this.size.x, c.y, c.z],
            [c.x, c.y, c.z+this.size.z],
            [c.x, c.y+this.size.y, c.z+this.size.z],
            [c.x+this.size.x, c.y+this.size.y, c.z+this.size.z],
            [c.x+this.size.x, c.y, c.z+this.size.z]
        ];

        var shadowPoints = [];
        var cathetusPow = [];
        var text = '';
        for(var i=0;i<8;i++) {
            var
                pointX = new Point(points[i][0], points[i][2]),
                pointY = new Point(points[i][1], points[i][2]),
                lightX = Math.abs(sunPoints.x[0].x-pointX.x)<Math.abs(sunPoints.x[1].x-pointX.x) ? sunPoints.x[0] : sunPoints.x[1],
                lightY = Math.abs(sunPoints.y[0].x-pointY.x)<Math.abs(sunPoints.y[1].x-pointY.x) ? sunPoints.y[0] : sunPoints.y[1];
            cathetusPow.push( Math.pow(lightX.x-pointX.x, 2) + Math.pow(lightY.x-pointY.x, 2) - pointX.y );

            if(debug) {
                var poly = new Polygon(this.map.toIsometric(points[i]), this.map.toIsometric([lightX.x, lightY.x, sc.z])).move( this.currentShift );
                this.libcanvas.ctx.stroke(poly, 'rgba(200,200,150,0.5)');
            }

            var offsetX = Math.abs( points[i][2] / Math.tan( lightX.angleTo(pointX) ) );
            var offsetY = Math.abs( points[i][2] / Math.tan( lightY.angleTo(pointY) ) );
            var modX = lightX.x>points[i][0]?-1:1;
            var modY = lightY.x>points[i][1]?-1:1;
            shadowPoints[i] = [points[i][0]+(modX*offsetX), points[i][1]+(modY*offsetY), 0];
        }

        var minLight = [0],
            maxLight = [0];

        for(var i=1;i<8;i++) {
            if(cathetusPow[i]<=cathetusPow[minLight[0]]) {
                if(cathetusPow[i]==cathetusPow[minLight[0]]) {
                    minLight.push(i);
                } else {
                    minLight = [i];
                }
            } else if(cathetusPow[i]>=cathetusPow[maxLight[0]]) {
                if(cathetusPow[i]==cathetusPow[maxLight[0]]) {
                    maxLight.push(i);
                } else {
                    maxLight = [i];
                }
            }
        }
        for(var i=0;i<minLight.length;i++) {
            text += minLight[i] + ' ';
            shadowPoints[minLight[i]] = false;
        }
        for(var i=0;i<maxLight.length;i++) {
            text += maxLight[i] + ' ';
            shadowPoints[maxLight[i]] = false;
        }

        var topIzo = [];
        if(c.y<sc.y) {
            if(shadowPoints[4]) topIzo.push(this.map.toIsometric(shadowPoints[4]));
            if(shadowPoints[5]) topIzo.push(this.map.toIsometric(shadowPoints[5]));
            if(shadowPoints[0]) topIzo.push(this.map.toIsometric(shadowPoints[0]));
            if(shadowPoints[1]) topIzo.push(this.map.toIsometric(shadowPoints[1]));
            if(shadowPoints[2]) topIzo.push(this.map.toIsometric(shadowPoints[2]));
            if(shadowPoints[3]) topIzo.push(this.map.toIsometric(shadowPoints[3]));
            if(shadowPoints[6]) topIzo.push(this.map.toIsometric(shadowPoints[6]));
            if(shadowPoints[7]) topIzo.push(this.map.toIsometric(shadowPoints[7]));
        } else {
            if(shadowPoints[0]) topIzo.push(this.map.toIsometric(shadowPoints[0]));
            if(shadowPoints[1]) topIzo.push(this.map.toIsometric(shadowPoints[1]));
            if(shadowPoints[4]) topIzo.push(this.map.toIsometric(shadowPoints[4]));
            if(shadowPoints[5]) topIzo.push(this.map.toIsometric(shadowPoints[5]));
            if(shadowPoints[6]) topIzo.push(this.map.toIsometric(shadowPoints[6]));
            if(shadowPoints[7]) topIzo.push(this.map.toIsometric(shadowPoints[7]));
            if(shadowPoints[2]) topIzo.push(this.map.toIsometric(shadowPoints[2]));
            if(shadowPoints[3]) topIzo.push(this.map.toIsometric(shadowPoints[3]));
        }
        var poly = new Polygon(topIzo).move( this.currentShift );
        this.libcanvas.ctx.fill(poly,color);

        if(debug) {
            for(var i=0;i<8;i++) {
                if(shadowPoints[i]) {
                    var poly = new Polygon(this.map.toIsometric(points[i]), this.map.toIsometric(shadowPoints[i])).move( this.currentShift );
                    this.libcanvas.ctx.stroke(poly,color);
                }
            }
        }
    }
});

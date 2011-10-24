Isometric.Sun = atom.Class(
{
    Extends: Isometric.Box,

    size: 3,

    currentAngle: 0,

    shining: true,

    centerMap: [],
    /**
     * @constructs
     * @param {Isometric.Point3D} coordinates
     * @param map
     */
    initialize: function (coordinates, map) {
        this.coords = Isometric.Point3D( coordinates );
        this.map    = map;
        this.mapRadius = new Isometric.Point3D(this.map.size.x/2, this.map.size.y/2+this.size, this.map.size.z+this.size);
        this.mapCenter = new Isometric.Point3D(this.map.size.x/2, this.map.size.y/2, 0);
        this.currentShift = new Point(0, 0);
        this.createShapes();
    },

    /**
     * @private
     * @returns {Isometric.Sun}
     */
    createShapes: function () {
        var c = this.coords, s = {
            left: [
                [c.x-2, c.y-2, c.z-2],
                [c.x-2, c.y-2, c.z+1],
                [c.x-2, c.y+1, c.z+1],
                [c.x-2, c.y+1, c.z-2]
            ],
            right: [
                [c.x-2, c.y+1, c.z+1],
                [c.x-2, c.y+1, c.z-2],
                [c.x+1, c.y+1, c.z-2],
                [c.x+1, c.y+1, c.z+1]
            ],
            top: [
                [c.x-2, c.y-2, c.z+1],
                [c.x-2, c.y+1, c.z+1],
                [c.x+1, c.y+1, c.z+1],
                [c.x+1, c.y-2, c.z+1]
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
     * @returns {Isometric.Sun}
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
     * @returns {Isometric.Sun}
     */
    move: function (time) {
        this.currentAngle = this.currentAngle + time/2000;
        if(this.currentAngle>=360) {
            this.currentAngle = this.currentAngle - 360;
        }
        var newCoords = Isometric.Point3D( [
            this.mapCenter.x+this.mapRadius.x*Math.cos(this.currentAngle),
            this.mapCenter.y+this.mapRadius.y*Math.sin(this.currentAngle),
            this.mapCenter.z+this.mapRadius.z*Math.cos(this.currentAngle)
        ] );

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
                this.libcanvas.update();
            }
        });
        return this;
    },

    /** @returns {Isometric.Sun} */
    draw: function () {
        var
            z  = this.coords.z + 1,
            zP = this.map.toIsometric([0,0,z]).y,
            s  = this.shapes,
            stroke = 'rgba(0,32,0,0.5)';

        if(z>this.size) {
            this.shining = true;
            this.libcanvas.ctx
                .save()
                .set({
                    shadowColor  : 'black',
                    shadowOffsetY: -zP,
                    shadowOffsetX: 0,
                    shadowBlur   : z * 3
                })
                .fill( s.top  , this.colors[0] )
                .restore()
                .fill( s.left , this.colors[1] )
                .fill( s.right, this.colors[2] )
                .stroke( s.top  , stroke )
                .stroke( s.left , stroke )
                .stroke( s.right, stroke );
        } else {
            this.shining = false;
        }
        return this;
    }
});

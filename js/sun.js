Isometric.Sun = atom.Class(
{
    Extends: Isometric.Box,

    size: [3,3,3],

    currentAngle: 0,

    shining: true,

    /**
     * @constructs
     * @param {Isometric.Point3D} coordinates
     * @param map
     */
    initialize: function (coordinates, map, size) {
        this.parent(coordinates, map, size);
        this.mapRadius = new Isometric.Point3D(this.map.size.x/2, this.map.size.y/2+this.size.y, this.map.size.z+this.size.z);
        this.mapCenter = new Isometric.Point3D(this.map.size.x/2, this.map.size.y/2, 0);
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
        this.currentAngle = this.currentAngle + time/5000;
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

        if(z>this.size.z) {
            this.shining = true;
            this.showProection();
            this.libcanvas.ctx
                .save()
                //~ .set({
                    //~ shadowColor  : 'black',
                    //~ shadowOffsetY: -zP,
                    //~ shadowOffsetX: 0,
                    //~ shadowBlur   : z * 3
                //~ })
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

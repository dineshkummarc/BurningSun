
Isometric.Controller = atom.Class(
/** @lends Isometric.Controller.prototype */
{
    Static: {
        map: {
            proj : new Isometric.Projection([ 0.866, 0.5, 1 ]),
            size : new Isometric.Point3D( 32, 32, 8 ),
            shift: new Point( 40 , 380 ),
            cell : 16
        },
        box: {
            coords: new Isometric.Point3D( 16, 16, 0.12 ),
            colors: [ '#eaa', '#a66', '#733' ],
            size: [ 3,3,3 ]
        },
        box2: {
            coords: new Isometric.Point3D( Number.random(1,15), Number.random(1,15), 0.02 ),
            colors: [ '#eaa', '#a66', '#733' ],
            size: [ Number.random(1,5),Number.random(1,5),Number.random(1,5) ]
        },
        box4: {
            coords: new Isometric.Point3D( Number.random(15,25), Number.random(15,25), 0.02 ),
            colors: [ '#eaa', '#a66', '#733' ],
            size: [ Number.random(1,5),Number.random(1,5),Number.random(1,5) ]
        }
    },

    /** @property {Isometric.Map} */
    map: null,

    /**
     * @constructs
     * @param {string} element - link to dom element
     */
    initialize: function (element) {
        this.libcanvas = new LibCanvas( element )
            .listenMouse( )
            .listenKeyboard( )
            .size( 960, 700, true )
            .addEvent('ready', this.start.bind( this ))
            .start();
    },

    /** @private */
    start: function () {
        this.libcanvas
            .createLayer( 'map', 0 )
            .addElement( this.map = this.createMap(this.self.map) )
            .update();

        var sun  = this.createSun( {
            coords: new Isometric.Point3D( this.self.map.size.x/2, 0, 0 ), colors: [ '#ffc', '#ffc', '#ffc' ]
        }, 10, [3,3,3] );

        this.map.setSun( sun );
        var box  = this.createBox( this.self.box );
        var box2  = this.createBox( this.self.box2 );
        var box4  = this.createBox( this.self.box4 );
        this.addMouseControls( box );
        this.addKeyboardControls( box );
        this.libcanvas
                .addElement( box )
                .addElement( box2 )
                .addElement( box4 )
                .addElement( sun )
                .fpsMeter()
                .addFunc(
                    function (time) {
                        sun.move(time);
                    }
                )
                .update();
//        sun.move(1);
    },

    /**
     * @private
     * @param {Isometric.Point3D} coord
     * @returns {Isometric.Box}
     */
    createGhost: function (coord, size) {
        var
            color = 'rgba(200,240,255,0.3)',
            box   = this.map.box( coord, size );
        box.colors = [color, color, color];
        this.libcanvas.addElement( box ).update();
        return this.ghost = box;
    },

    /**
     * @private
     * @returns {Isometric.Controller}
     */
    removeGhost: function () {
        if (this.ghost) {
            this.libcanvas.rmElement( this.ghost ).update();
            delete this.ghost;
        }
        return this;
    },

    /**
     * @private
     * @param {Isometric.Box} elem
     * @returns {Isometric.Box}
     */
    addMouseControls: function (elem) {
        this.libcanvas.mouse.addEvent({
            click: function (e) {
                var newCoord = this.map.to3D( e.offset );

                if (!newCoord) return;
                newCoord.z = elem.coords.z;
                this.removeGhost().createGhost( newCoord, this.self.box.size );
                elem.move(
                    elem.coords.diff( this.ghost.coords ),
                    elem.libcanvas.update,
                    this.removeGhost.bind(this)
                );
            }.bind(this),
            wheel: function (e) {
                elem.move( [0,0,e.delta], this.libcanvas.update );
                this.removeGhost();
                e.preventDefault();
            }.bind(this)
        });

        return elem;
    },

    /**
     * @private
     * @param {Isometric.Box} elem
     * @returns {Isometric.Box}
     */
    addKeyboardControls: function (elem) {
        var move = function (x,y,z) {
            return function (e) {
                this.removeGhost();
                var shift = [x,y,z].mul( e.ctrlKey ? 2.3 : 0.78 );
                elem.move( shift, elem.libcanvas.update );
                e.preventDefault();
            }.bind(this);
        }.bind(this);

        this.libcanvas.keyboard.addEvent({
            np7: move( 0,-1, 0),
            np8: move( 1,-1, 0),
            np9: move( 1, 0, 0),
            np6: move( 1, 1, 0),
            np3: move( 0, 1, 0),
            np2: move(-1, 1, 0),
            np1: move(-1, 0, 0),
            np4: move(-1,-1, 0),

            h  : move( 0,-1, 0),
            j  : move( 1, 0, 0),
            m  : move( 0, 1, 0),
            n  : move(-1, 0, 0),

            a  : move( 0, 0, 1),
            z  : move( 0, 0,-1)
        });
        return elem;
    },

    /**
     * @private
     * @param {Object} boxCfg
     * @returns {Isometric.Box}
     */
    createBox: function (boxCfg) {
        var box  = this.map.box( boxCfg.coords, boxCfg.size );
        if (boxCfg.colors) box.colors = boxCfg.colors;
        return box;
    },
    /**
     * @private
     * @param {Object} sunCfg
     * @returns {Isometric.Sun}
     */
    createSun: function (sunCfg, zIndex, sunSize) {
        var sun  = this.map.sun( sunCfg.coords, sunSize ).setZIndex( zIndex );
        if (sunCfg.colors) sun.colors = sunCfg.colors;
        return sun;
    },

    /**
     * @private
     * @returns {Isometric.Map}
     */
    createMap: function (mapCfg) {
        return new Isometric.Map( mapCfg.proj, mapCfg.size, mapCfg.cell )
            .shift( mapCfg.shift );
    }

});

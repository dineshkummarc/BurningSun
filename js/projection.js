
Isometric.Projection = atom.Class(
/** @lends Isometric.Projection.prototype */
{

	/**
	 * factor (and default factor in proto)
	 * @property {Isometric.Point3D}
	 */
	factor: [0.866, 0.5, 0.866],

	/**
	 * @constructs
	 * @param {Isometric.Point3D} factor
	 */
	initialize: function (factor) {
		atom.Class.bindAll( this );
		this.factor = Isometric.Point3D( factor || this.factor );
	},

	/**
	 * @param {Isometric.Point3D} point3d
	 * @returns {LibCanvas.Point}
	 */
	toIsometric: function (point3d) {
		point3d = Isometric.Point3D( point3d );
		return new Point(
			(point3d.y + point3d.x) * this.factor.x,
			(point3d.y - point3d.x) * this.factor.y - point3d.z * this.factor.z
		);
	},

	/**
	 * @param {LibCanvas.Point} point
	 * @param {Number} z = 0
	 * @returns {Isometric.Point3D}
	 */
	to3D: function (point, z) {
		point = Point(point);
		z = Number(z) || 0;
		
		var
			dXY = (point.y + z * this.factor.z) / this.factor.y,
			pX  = (point.x / this.factor.x - dXY) / 2;

		return new Isometric.Point3D( pX, pX + dXY, z );
	}
});
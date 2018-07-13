//-----------------------------------------------------------------------------
// Copyright 2018 harlyq
// MIT license
const Tree = require("../lib/proctree.js")

const MESH = "mesh"
const TRUNK = "trunk"
const TWIGS = "twigs"

AFRAME.registerComponent("proctree", {
  schema: {
    seed: { type: "int", default: 262 },
    segments: { type: "int", default: 6 },
    levels: { type: "int", default: 5 },
    twigScale: { default: 0.39 },
    initialBranchLength: { default: 0.49 },
    lengthFalloffFactor: { default: 0.85 },
    lengthFalloffPower: { default: 0.99 },
    clumpMax: { default: 0.454 },
    clumpMin: { default: 0.404 },
    branchFactor: { default: 2.45 },
    dropAmount: { default: -0.1 },
		growAmount: { default: 0.235 },
		sweepAmount: { default: 0.01 },
		maxRadius: { default: 0.139 },
		climbRate: { default: 0.371 },
		trunkKink: { default: 0.093 },
		treeSteps: { type: "int", default: 5 },
		taperRate: { default: 0.947 },
		radiusFalloffRate: { default: 0.73 },
		twistRate: { default: 3.02 },
		trunkColor: { type: "color", default: "brown" },
		trunkLength: { default: 2.4 },
    vMultiplier: { default: 2.36 },
  },

  init() {
    this.trunkMat = new THREE.MeshLambertMaterial({color: "brown"})
    this.trunkMat.name = TRUNK
    this.twigsMat = new THREE.MeshLambertMaterial({color: "green" })
    this.twigsMat.name = TWIGS
  },

  update(oldData) {
    let params = Object.assign({}, this.data)
    if (params.seed < 0) params.seed = Math.random()*23748923

    let tree = new Tree(params)
    let trunkGeo = this.newGeo(tree.verts, tree.faces, tree.UV)
    let twigsGeo = this.newGeo(tree.vertsTwig, tree.facesTwig, tree.uvsTwig)

    trunkGeo = new THREE.BufferGeometry().fromGeometry(trunkGeo)
    twigsGeo = new THREE.BufferGeometry().fromGeometry(twigsGeo)

    // reuse the previous trunk material, this lets other components override the materials, and also
    // lets us keep material changes that are made through the inspector
    let trunkMat = this.el.getObject3D(TRUNK) ? this.el.getObject3D(TRUNK).material : this.trunkMat
    let twigsMat = this.el.getObject3D(MESH) ? this.el.getObject3D(MESH).material : this.twigsMat

    // change our trunkMat, so we don't alter the color if another component replaced the trunk material
    this.trunkMat.color.setStyle(this.data.trunkColor)

    let trunkMesh = new THREE.Mesh(trunkGeo, trunkMat)
    let twigsMesh = new THREE.Mesh(twigsGeo, twigsMat)

    this.el.setObject3D(TRUNK, trunkMesh) // need a special component to texture this
    this.el.setObject3D(MESH, twigsMesh) // can texture this with the material component
  },

  newGeo(verts, faces, uv) {
    let geo = new THREE.Geometry()
    geo.vertices = verts.map(v => new THREE.Vector3(v[0], v[1], v[2]))
    geo.faces = faces.map(f => new THREE.Face3(f[0], f[1], f[2]))
    geo.faceVertexUvs[0] = faces.map(f => f.map(v => new THREE.Vector2(uv[v][0], uv[v][1])))
    geo.computeFaceNormals()
    geo.computeVertexNormals()
    return geo
  }
})

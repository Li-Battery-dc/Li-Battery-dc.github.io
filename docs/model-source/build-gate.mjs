/** Rebuild with: node docs/model-source/build-gate.mjs
 * Proportional architectural study, not a measured survey or a replica.
 * Y up, facade faces +Z. Named independent meshes permit later editing in Blender.
 */
import * as T from '../../assets/js/vendor/three/three.module.min.js';
import { writeFileSync, readFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
const root = new T.Group(); root.name = 'Tsinghua_Second_Gate_Study';
const materials = [
  new T.MeshStandardMaterial({color:0xffffff, roughness:.92, metalness:0}),
  new T.MeshStandardMaterial({color:0xf5f4ec, roughness:.58, metalness:.03}),
  new T.MeshStandardMaterial({color:0xc7cdc7, roughness:.85, metalness:.02}),
  new T.MeshStandardMaterial({color:0xffffff, roughness:.78, metalness:0})
];
materials.forEach((m,i)=>m.name=['Grey_Brick','Cornice_Ivory','Base_Stone','Traditional_Plaque'][i]);
function add(name,geo,x=0,y=0,z=0,material=0){
 const mesh=new T.Mesh(geo,materials[material]);mesh.name=name;mesh.position.set(x,y,z);root.add(mesh);return mesh;
}
function box(name,w,h,d,x,y,z=0,mat=1){return add(name,new T.BoxGeometry(w,h,d),x,y,z,mat);}
function extrude(name,shape,depth,mat=0){
 const geo=new T.ExtrudeGeometry(shape,{depth,bevelEnabled:false,curveSegments:28,steps:1});
 geo.translate(0,0,-depth/2);return add(name,geo,0,0,0,mat);
}
// Open-bottom shapes form real arch openings, without CSG or hidden infill.
const central=new T.Shape();
central.moveTo(-2.62,.16);central.lineTo(-1.32,.16);central.lineTo(-1.32,2.75);
central.absarc(0,2.75,1.32,Math.PI,0,true);central.lineTo(1.32,.16);
central.lineTo(2.62,.16);central.lineTo(2.62,5.72);central.lineTo(-2.62,5.72);central.closePath();
extrude('Central_arch_wall',central,.76);
function archTrim(name,cx,r,spring,width,z){
 const s=new T.Shape();s.absarc(cx,spring,r+width,0,Math.PI,false);
 s.lineTo(cx-r,spring);s.absarc(cx,spring,r,Math.PI,0,true);s.closePath();
 const mesh=extrude(name,s,.07,1);mesh.position.z=z;
}
for(const z of [-.43,.43]){
 archTrim('Central_arch_moulding_'+(z>0?'front':'back'),0,1.32,2.75,.13,z);
 for(const sign of [-1,1])box('Central_arch_jamb_'+sign+'_'+z,.13,2.57,.09,sign*1.385,1.46,z);
 box('Keystone_'+z,.22,.36,.1,0,4.04,z);
 box('Inscription_panel_'+z,2.6,.76,.11,0,4.8,z,1);
 // White plaster surrounding the main arch, over the exposed brick structure.
 const spandrel=new T.Shape();spandrel.moveTo(-1.5,2.75);spandrel.lineTo(-1.32,2.75);
 spandrel.absarc(0,2.75,1.32,Math.PI,0,true);spandrel.lineTo(1.5,2.75);
 spandrel.lineTo(1.5,4.37);spandrel.lineTo(-1.5,4.37);spandrel.closePath();
 const surround=extrude('White_arch_surround_'+z,spandrel,.025,1);surround.position.z=Math.sign(z)*.399;
}
const plaque=add('Front_inscription_Qing_Hua_Yuan',new T.PlaneGeometry(2.52,.70),0,4.8,.515,3);
plaque.userData.inscription='清華園';plaque.userData.readingDirection='right-to-left';
for(const sign of [-1,1]){
 const suffix=sign<0?'left':'right';
 const wing=new T.Shape();
 wing.moveTo(2.62,.16);wing.lineTo(3.02,.16);wing.lineTo(3.02,1.36);
 wing.absarc(3.64,1.36,.62,Math.PI,0,true);wing.lineTo(4.26,.16);wing.lineTo(4.8,.16);
 wing.lineTo(4.8,2.93);wing.lineTo(2.62,2.93);wing.closePath();
 const mesh=extrude('Brick_side_arch_'+suffix,wing,.68);if(sign<0)mesh.rotation.y=Math.PI;
 const shoulder=new T.Shape();shoulder.moveTo(2.62,2.93);shoulder.lineTo(4.8,2.93);
 shoulder.lineTo(4.8,3.03);shoulder.bezierCurveTo(4.8,3.28,4.68,3.44,4.4,3.43);
 shoulder.bezierCurveTo(3.38,3.43,2.85,3.83,2.62,5.1);shoulder.closePath();
 const whiteWing=extrude('White_curved_wing_'+suffix,shoulder,.68,1);if(sign<0)whiteWing.rotation.y=Math.PI;
 for(const z of [-.39,.39]){
  archTrim('Side_arch_trim_'+suffix+'_'+z,sign*3.64,.62,1.36,.13,z);
  for(const offset of [-.685,.685])box('Side_jamb_'+suffix+'_'+offset+'_'+z,.13,1.2,.08,sign*3.64+offset,.76,z);
 }
 box('Side_cornice_'+suffix,2.28,.15,.86,sign*3.72,2.93);
 box('Side_cornice_lower_'+suffix,2.18,.09,.77,sign*3.72,2.8);
 // Shallow volute discs retain the recognisable curled shoulder silhouette.
 for(const z of [-.39,.39]){
  const scroll=add('Wing_volute_'+suffix+'_'+z,new T.CylinderGeometry(.22,.22,.075,24),sign*4.51,3.21,z,1);
  scroll.rotation.x=Math.PI/2;
 }
 for(const x of [1.77,2.3]){
  const px=sign*x;
  box('Column_pedestal_'+suffix+'_'+x,.46,.76,1.04,px,.54,0,2);
  box('Column_base_'+suffix+'_'+x,.48,.13,.4,px,.98,.44);
  add('Front_column_'+suffix+'_'+x,new T.CylinderGeometry(.16,.19,3.15,24),px,2.61,.48,1);
  add('Column_neck_'+suffix+'_'+x,new T.CylinderGeometry(.205,.205,.11,24),px,4.22,.48,1);
  box('Column_capital_'+suffix+'_'+x,.48,.16,.45,px,4.36,.46);
  box('Back_pilaster_'+suffix+'_'+x,.34,3.26,.23,px,2.63,-.45,1);
  box('Back_capital_'+suffix+'_'+x,.48,.16,.37,px,4.36,-.45);
 }
 box('Paired_column_entablature_'+suffix,1.13,.16,1.14,sign*2.035,4.51);
 box('Outer_foot_'+suffix,.58,.24,.92,sign*4.52,.18,0,2);
}
// Layered horizontal cornice and stepped upper parapet, kept intentionally plain.
box('Main_frieze',5.34,.39,.91,0,5.42,0,0);
box('Cornice_lower',5.62,.13,1.05,0,5.68);
box('Cornice_middle',5.78,.14,1.16,0,5.81);
box('Cornice_top',5.95,.12,1.28,0,5.94);
box('Parapet_body',5.34,.54,.84,0,6.25);
box('Parapet_ledge',5.46,.12,.98,0,6.55);
for(const x of [-2.28,2.28])box('Parapet_end_'+x,.63,.27,.95,x,6.72);
box('Parapet_center_step',1.42,.18,.9,0,6.7);
box('Parapet_center_crown',.82,.12,.9,0,6.85);
box('Study_plinth',10.05,.12,1.65,0,.03,0,2);
root.updateMatrixWorld(true);

// Self-contained glTF 2.0: UVs and PNG textures are embedded in the binary chunk.
const gltf={asset:{version:'2.0',generator:'Tsinghua gate procedural study v2'},scene:0,scenes:[{nodes:[]}],nodes:[],meshes:[],materials:materials.map(m=>({name:m.name,pbrMetallicRoughness:{baseColorFactor:[m.color.r,m.color.g,m.color.b,1],metallicFactor:m.metalness,roughnessFactor:m.roughness}})),buffers:[{byteLength:0}],bufferViews:[],accessors:[],images:[],textures:[],samplers:[{magFilter:9729,minFilter:9987,wrapS:10497,wrapT:10497},{magFilter:9729,minFilter:9987,wrapS:33071,wrapT:33071}]};
let offset=0;const chunks=[];
function accessor(array,type,target,limits){
 const bytes=Buffer.from(array.buffer,array.byteOffset,array.byteLength);const view=gltf.bufferViews.length;
 gltf.bufferViews.push({buffer:0,byteOffset:offset,byteLength:bytes.length,target});chunks.push(bytes);offset+=bytes.length;
 const padding=(4-offset%4)%4;if(padding){chunks.push(Buffer.alloc(padding));offset+=padding;}
 const id=gltf.accessors.length;gltf.accessors.push({bufferView:view,componentType:array instanceof Float32Array?5126:5125,count:array.length/({SCALAR:1,VEC2:2,VEC3:3,VEC4:4}[type]),type,...limits});return id;
}
for(const [file,sampler] of [['grey-brick-base.png',0],['grey-brick-normal.png',0],['qing-hua-yuan-plaque.png',1]]){
 const bytes=readFileSync(new URL('./textures/'+file,import.meta.url));
 const view=gltf.bufferViews.length;gltf.bufferViews.push({buffer:0,byteOffset:offset,byteLength:bytes.length});chunks.push(bytes);offset+=bytes.length;
 const padding=(4-offset%4)%4;if(padding){chunks.push(Buffer.alloc(padding));offset+=padding;}
 const source=gltf.images.length;gltf.images.push({name:file,bufferView:view,mimeType:'image/png'});gltf.textures.push({source,sampler});
}
gltf.materials[0].pbrMetallicRoughness.baseColorTexture={index:0};
gltf.materials[0].normalTexture={index:1,scale:.45};
gltf.materials[3].pbrMetallicRoughness.baseColorTexture={index:2};
// Preserve ink contrast under bright environment lighting in any GLB viewer.
gltf.extensionsUsed=['KHR_materials_unlit'];
gltf.materials[3].extensions={KHR_materials_unlit:{}};
let triangles=0;
root.children.forEach(mesh=>{
 const geo=mesh.geometry.clone();geo.applyMatrix4(mesh.matrixWorld);geo.deleteAttribute('uv');geo.computeBoundingBox();
 const position=accessor(geo.attributes.position.array,'VEC3',34962,{min:geo.boundingBox.min.toArray(),max:geo.boundingBox.max.toArray()});
 const normal=accessor(geo.attributes.normal.array,'VEC3',34962);
 const attributes={POSITION:position,NORMAL:normal};
 if(mesh.material===materials[0]||mesh.material===materials[3]){
  const uv=new Float32Array(geo.attributes.position.count*2);
  for(let i=0;i<geo.attributes.position.count;i++){
   const p=geo.attributes.position,n=geo.attributes.normal;
   if(mesh.material===materials[3]){uv[i*2]=(p.getX(i)+1.26)/2.52;uv[i*2+1]=1-(p.getY(i)-4.8+.35)/.70;}
   else{
    const nx=Math.abs(n.getX(i)),ny=Math.abs(n.getY(i)),nz=Math.abs(n.getZ(i));
    uv[i*2]=(ny>.8?p.getX(i):(nx>nz?p.getZ(i):p.getX(i)))/2.88;
    uv[i*2+1]=-(ny>.8?p.getZ(i):p.getY(i))/2.88;
   }
  }
  attributes.TEXCOORD_0=accessor(uv,'VEC2',34962);
  if(mesh.material===materials[0]){
   geo.setAttribute('uv',new T.BufferAttribute(uv,2));
   if(!geo.index)geo.setIndex(Array.from({length:geo.attributes.position.count},(_,i)=>i));
   geo.computeTangents();
   attributes.TANGENT=accessor(geo.attributes.tangent.array,'VEC4',34962);
  }
 }
 const indices=geo.index?Uint32Array.from(geo.index.array):Uint32Array.from({length:geo.attributes.position.count},(_,i)=>i);
 triangles+=indices.length/3;
 const index=accessor(indices,'SCALAR',34963);
 const meshId=gltf.meshes.length;gltf.meshes.push({name:mesh.name,primitives:[{attributes,indices:index,material:materials.indexOf(mesh.material)}]});
 gltf.scenes[0].nodes.push(gltf.nodes.length);gltf.nodes.push({name:mesh.name,mesh:meshId,...(mesh.userData.inscription?{extras:mesh.userData}:{})});geo.dispose();
});
gltf.buffers[0].byteLength=offset;
let json=Buffer.from(JSON.stringify(gltf));json=Buffer.concat([json,Buffer.alloc((4-json.length%4)%4,0x20)]);
const bin=Buffer.concat(chunks);const header=Buffer.alloc(12);header.writeUInt32LE(0x46546c67,0);header.writeUInt32LE(2,4);header.writeUInt32LE(28+json.length+bin.length,8);
function chunkHeader(size,magic){const b=Buffer.alloc(8);b.writeUInt32LE(size,0);b.writeUInt32LE(magic,4);return b;}
const output=fileURLToPath(new URL('../../assets/models/tsinghua-gate.glb',import.meta.url));
mkdirSync(fileURLToPath(new URL('../../assets/models/',import.meta.url)),{recursive:true});
writeFileSync(output,Buffer.concat([header,chunkHeader(json.length,0x4e4f534a),json,chunkHeader(bin.length,0x004e4942),bin]));
console.log(JSON.stringify({output,meshes:gltf.meshes.length,triangles,bytes:28+json.length+bin.length}));

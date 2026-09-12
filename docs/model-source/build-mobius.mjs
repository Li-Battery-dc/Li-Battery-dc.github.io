/** Closed, thin metallic Möbius ribbon. Run: node docs/model-source/build-mobius.mjs */
import * as T from '../../assets/js/vendor/three/three.module.min.js';
import {writeFileSync} from 'node:fs';
const N=240,R=1.62,W=.62,D=.033,positions=[],indices=[];
const sides=[{a:[-W,-D],b:[W,-D],steps:16},{a:[W,-D],b:[W,D],steps:1},{a:[W,D],b:[-W,D],steps:16},{a:[-W,D],b:[-W,-D],steps:1}];
for(const side of sides){
 const start=positions.length/3;
 for(let i=0;i<=N;i++){
  const u=i/N*Math.PI*2,cu=Math.cos(u),su=Math.sin(u),ch=Math.cos(u/2),sh=Math.sin(u/2);
  const center=new T.Vector3(R*cu,0,R*su);
  const width=new T.Vector3(ch*cu,sh,ch*su);
  const normal=new T.Vector3(-su,0,cu).cross(width).normalize();
  for(let j=0;j<=side.steps;j++){
   const t=j/side.steps,v=T.MathUtils.lerp(side.a[0],side.b[0],t),d=T.MathUtils.lerp(side.a[1],side.b[1],t);
   const p=center.clone().addScaledVector(width,v).addScaledVector(normal,d);positions.push(p.x,p.y,p.z);
  }
 }
 for(let i=0;i<N;i++)for(let j=0;j<side.steps;j++){
  const a=start+i*(side.steps+1)+j,b=a+side.steps+1;indices.push(a,b,a+1,b,b+1,a+1);
 }
}
const geometry=new T.BufferGeometry();geometry.setAttribute('position',new T.Float32BufferAttribute(positions,3));geometry.setIndex(indices);geometry.computeVertexNormals();
geometry.rotateX(Math.PI*.36);geometry.rotateZ(-.15);geometry.computeBoundingBox();geometry.translate(0,-geometry.boundingBox.min.y+.23,0);geometry.computeBoundingBox();
const json={asset:{version:'2.0',generator:'Procedural metallic Mobius study v1'},scene:0,scenes:[{nodes:[0]}],nodes:[{name:'Mobius_half_twist_ribbon',mesh:0,extras:{halfTwists:1,material:'dark grey metal'}}],meshes:[{name:'Mobius_ribbon',primitives:[]}],materials:[{name:'Graphite_Metal',doubleSided:true,pbrMetallicRoughness:{baseColorFactor:[.075,.078,.082,1],metallicFactor:.94,roughnessFactor:.23}}],buffers:[{byteLength:0}],bufferViews:[],accessors:[]};
let offset=0;const chunks=[];
function attribute(array,type,target,minmax={}){
 const bytes=Buffer.from(array.buffer,array.byteOffset,array.byteLength),view=json.bufferViews.length;
 json.bufferViews.push({buffer:0,byteOffset:offset,byteLength:bytes.length,target});chunks.push(bytes);offset+=bytes.length;
 const pad=(4-offset%4)%4;if(pad){chunks.push(Buffer.alloc(pad));offset+=pad;}
 const result=json.accessors.length;json.accessors.push({bufferView:view,componentType:array instanceof Float32Array?5126:5125,count:array.length/(type==='VEC3'?3:1),type,...minmax});return result;
}
const p=attribute(geometry.attributes.position.array,'VEC3',34962,{min:geometry.boundingBox.min.toArray(),max:geometry.boundingBox.max.toArray()});
const n=attribute(geometry.attributes.normal.array,'VEC3',34962),idx=attribute(Uint32Array.from(indices),'SCALAR',34963);
json.meshes[0].primitives.push({attributes:{POSITION:p,NORMAL:n},indices:idx,material:0});json.buffers[0].byteLength=offset;
let encoded=Buffer.from(JSON.stringify(json));encoded=Buffer.concat([encoded,Buffer.alloc((4-encoded.length%4)%4,32)]);
const data=Buffer.concat(chunks),header=Buffer.alloc(12);header.writeUInt32LE(0x46546c67);header.writeUInt32LE(2,4);header.writeUInt32LE(28+encoded.length+data.length,8);
function chunk(size,kind){const h=Buffer.alloc(8);h.writeUInt32LE(size);h.writeUInt32LE(kind,4);return h;}
const output=new URL('../../assets/models/mobius-metal.glb',import.meta.url);writeFileSync(output,Buffer.concat([header,chunk(encoded.length,0x4e4f534a),encoded,chunk(data.length,0x004e4942),data]));
console.log(JSON.stringify({output:output.pathname,triangles:indices.length/3,bytes:28+encoded.length+data.length}));

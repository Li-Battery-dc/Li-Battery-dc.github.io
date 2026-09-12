/** Rebuild embedded textures with Node and @napi-rs/canvas.
 * Optional CANVAS_MODULE_PATH points to an existing installed canvas module.
 * Only the rendered glyphs are embedded; no system font files are distributed.
 */
const {createCanvas,GlobalFonts}=require(process.env.CANVAS_MODULE_PATH || '@napi-rs/canvas');
const fs=require('node:fs'),path=require('node:path');
const out=path.join(__dirname,'textures');fs.mkdirSync(out,{recursive:true});
const size=512,cols=8,rows=24,bw=size/cols,bh=size/rows,scale=size/1024;
const canvas=createCanvas(size,size),ctx=canvas.getContext('2d');
const data=ctx.createImageData(size,size),height=new Float32Array(size*size);
let seed=1847;function random(){seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;}
const variation=Array.from({length:rows},()=>Array.from({length:cols},()=>random()*18-9));
for(let y=0;y<size;y++)for(let x=0;x<size;x++){
 const row=Math.floor(y/bh),offset=row%2*bw/2;
 const bx=(x+offset)%bw,by=y%bh,col=Math.floor(((x+offset)%size)/bw);
 const seam=Math.min(bx,bw-bx,by,bh-by),edge=Math.min(1,Math.max(0,(seam-1.3*scale)/(2.1*scale)));
 const noise=(random()-.5)*5;
 const base=95+variation[row][col]+noise;
 const mortar=156+noise;
 const i=(y*size+x)*4;
 data.data[i]=mortar*(1-edge)+(base-2)*edge;
 data.data[i+1]=mortar*(1-edge)+base*edge;
 data.data[i+2]=(mortar-3)*(1-edge)+(base+1)*edge;
 data.data[i+3]=255;height[y*size+x]=edge*.82;
}
ctx.putImageData(data,0,0);fs.writeFileSync(path.join(out,'grey-brick-base.png'),canvas.toBuffer('image/png'));
const normal=ctx.createImageData(size,size);
function h(x,y){return height[((y+size)%size)*size+(x+size)%size];}
for(let y=0;y<size;y++)for(let x=0;x<size;x++){
 const dx=(h(x+1,y)-h(x-1,y))*.6,dy=(h(x,y+1)-h(x,y-1))*.6;
 const len=Math.hypot(dx,dy,1),i=(y*size+x)*4;
 normal.data[i]=(-dx/len*.5+.5)*255;normal.data[i+1]=(dy/len*.5+.5)*255;normal.data[i+2]=(1/len*.5+.5)*255;normal.data[i+3]=255;
}
ctx.putImageData(normal,0,0);fs.writeFileSync(path.join(out,'grey-brick-normal.png'),canvas.toBuffer('image/png'));
const fontPath=process.env.GATE_FONT_PATH || 'C:/Windows/Fonts/simkai.ttf';
if(!fs.existsSync(fontPath))throw Error('Set GATE_FONT_PATH to a Chinese Kai-style font.');
GlobalFonts.registerFromPath(fontPath,'GateKai');
const plaque=createCanvas(2048,512),p=plaque.getContext('2d');
p.fillStyle='#f5f4ec';p.fillRect(0,0,2048,512);
p.fillStyle='#000000';p.strokeStyle='#000000';p.font='480px GateKai';p.textAlign='center';p.textBaseline='alphabetic';
p.lineWidth=7;p.lineJoin='round';
// Historic horizontal inscription reads 清華園 from right to left.
['園','華','清'].forEach((glyph,i)=>{
 const m=p.measureText(glyph),y=(512+m.actualBoundingBoxAscent-m.actualBoundingBoxDescent)/2;
 // Slightly strengthen the calligraphic strokes so they survive thumbnail mipmaps.
 p.strokeText(glyph,400+i*624,y);p.fillText(glyph,400+i*624,y);
});
fs.writeFileSync(path.join(out,'qing-hua-yuan-plaque.png'),plaque.toBuffer('image/png'));
console.log('Created grey brick albedo/normal maps and a traditional 清華園 plaque.');

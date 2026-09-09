// Local-only fixture. This module replaces Firebase in the browser test bundle.
let data={},listeners=[],sequence=0;
const parts=p=>p.split('/').filter(Boolean);
function read(p){return parts(p).reduce((v,k)=>v?.[k],data)??null}
function reference(path=''){path=parts(path).join('/');return {path,key:parts(path).at(-1)||null,get parent(){return reference(parts(path).slice(0,-1).join('/'))},toString(){return 'https://test.local/'+path}}}
function snapshot(p){const value=read(p);return {key:parts(p).at(-1),exists:()=>value!==null,val:()=>structuredClone(value)}}
function write(p,value){const keys=parts(p);let v=data;for(const k of keys.slice(0,-1))v=v[k]??={};if(value===null)delete v[keys.at(-1)];else v[keys.at(-1)]=structuredClone(value)}
exports.seed=value=>{data=value};exports.read=read;
exports.ref=(_db,p='')=>reference(p);exports.child=(r,p)=>reference(r.path+'/'+p);
exports.get=async r=>snapshot(r.path);exports.getDatabase=()=>({});
exports.runTransaction=async(r,fn)=>{const value=fn(structuredClone(read(r.path)));if(value===undefined)return {committed:false};await exports.set(r,value);return {committed:true,snapshot:snapshot(r.path)}};
exports.onValue=(r,fn)=>{const listener=()=>fn(snapshot(r.path));listeners.push(listener);queueMicrotask(listener);return()=>listeners=listeners.filter(x=>x!==listener)};
exports.onChildAdded=(r,fn)=>{queueMicrotask(()=>Object.keys(read(r.path)||{}).forEach(k=>fn(snapshot(r.path+'/'+k))));return()=>{}};
exports.onChildRemoved=exports.onChildChanged=()=>()=>{};
exports.update=async(r,patch)=>{for(const [p,v]of Object.entries(patch))write(r.path+'/'+p,v);queueMicrotask(()=>[...listeners].forEach(fn=>fn()))};
exports.set=(r,v)=>exports.update(reference(),{[r.path]:v});exports.remove=r=>exports.set(r,null);exports.push=r=>reference(r.path+'/new'+(++sequence));

exports.serverTimestamp=()=>Date.now();

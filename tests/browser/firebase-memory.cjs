// Local-only fixture. This module replaces Firebase in the browser test bundle.
let data={},listeners=[],sequence=0,activeSubscriptions=0,activePaths={},metrics={gets:[],subscriptions:[],sets:[],updates:[],transactions:[]};
const parts=p=>p.split('/').filter(Boolean);
function read(p){return parts(p).reduce((v,k)=>v?.[k],data)??null}
function reference(path=''){path=parts(path).join('/');return {path,key:parts(path).at(-1)||null,get parent(){return reference(parts(path).slice(0,-1).join('/'))},toString(){return 'https://test.local/'+path}}}
function snapshot(p){const value=read(p);return {key:parts(p).at(-1),exists:()=>value!==null,val:()=>structuredClone(value)}}
function write(p,value){const keys=parts(p);let v=data;for(const k of keys.slice(0,-1))v=v[k]??={};if(value===null)delete v[keys.at(-1)];else v[keys.at(-1)]=structuredClone(value)}
exports.seed=value=>{data=value};exports.read=read;
exports.resetMetrics=()=>{metrics={gets:[],subscriptions:[],sets:[],updates:[],transactions:[]}};
exports.getMetrics=()=>structuredClone({...metrics,activeSubscriptions,activePaths});
exports.ref=(_db,p='')=>reference(p);exports.child=(r,p)=>reference(r.path+'/'+p);
const bytes=value=>JSON.stringify(value)?.length||0;
exports.get=async r=>{metrics.gets.push({path:r.path,bytes:bytes(read(r.path))});return snapshot(r.path)};exports.getDatabase=()=>({});
exports.runTransaction=async(r,fn)=>{const input=structuredClone(read(r.path)),value=fn(input);metrics.transactions.push({path:r.path,readBytes:bytes(input),writeBytes:bytes(value)});if(value===undefined)return {committed:false};write(r.path,value);queueMicrotask(()=>[...listeners].forEach(listener=>listener()));return {committed:true,snapshot:snapshot(r.path)}};
const activate=path=>{activeSubscriptions++;activePaths[path]=(activePaths[path]||0)+1};
const deactivate=path=>{activeSubscriptions--;if(--activePaths[path]<=0)delete activePaths[path]};
exports.onValue=(r,fn)=>{metrics.subscriptions.push({path:r.path,initialBytes:bytes(read(r.path))});activate(r.path);const listener=()=>fn(snapshot(r.path));listeners.push(listener);queueMicrotask(listener);let active=true;return()=>{if(!active)return;active=false;deactivate(r.path);listeners=listeners.filter(x=>x!==listener)}};
const childSubscription=(r,type,initialBytes=0)=>{metrics.subscriptions.push({path:r.path,type,initialBytes});activate(r.path);let active=true;return()=>{if(active){active=false;deactivate(r.path)}}};
const trackedChildren=(r,type,fn,emitInitial,accept)=>{
  const stopMetric=childSubscription(r,type,emitInitial?bytes(read(r.path)):0);
  let previous=structuredClone(read(r.path)||{});
  const emit=()=>{
    const current=structuredClone(read(r.path)||{});
    for(const key of new Set([...Object.keys(previous),...Object.keys(current)])){
      if(accept(key,previous,current)){
        const value=current[key]??previous[key]??null;
        fn({key,exists:()=>value!==null,val:()=>structuredClone(value)});
      }
    }
    previous=current;
  };
  listeners.push(emit);if(emitInitial)queueMicrotask(()=>Object.keys(previous).forEach(key=>fn(snapshot(r.path+'/'+key))));
  return()=>{stopMetric();listeners=listeners.filter(listener=>listener!==emit)};
};
exports.onChildAdded=(r,fn)=>trackedChildren(r,'child-added',fn,true,(key,previous,current)=>!(key in previous)&&key in current);
exports.onChildRemoved=(r,fn)=>trackedChildren(r,'child-removed',fn,false,(key,previous,current)=>key in previous&&!(key in current));
exports.onChildChanged=(r,fn)=>trackedChildren(r,'child-changed',fn,false,(key,previous,current)=>key in previous&&key in current&&JSON.stringify(previous[key])!==JSON.stringify(current[key]));
exports.update=async(r,patch)=>{metrics.updates.push({path:r.path,paths:Object.keys(patch),writeBytes:bytes(patch)});for(const [p,v]of Object.entries(patch))write(r.path+'/'+p,v);queueMicrotask(()=>[...listeners].forEach(fn=>fn()))};
exports.set=async(r,v)=>{metrics.sets.push({path:r.path,writeBytes:bytes(v)});write(r.path,v);queueMicrotask(()=>[...listeners].forEach(fn=>fn()))};exports.remove=r=>exports.set(r,null);exports.push=r=>reference(r.path+'/new'+(++sequence));

exports.serverTimestamp=()=>Date.now();

exports.id=0,exports.modules={"./src/server/server.js":function(e,t,s){"use strict";s.r(t);var r=s("./build/contracts/FlightSuretyApp.json"),a=s("./src/server/config.json"),n=s("web3"),c=s.n(n),o=s("express"),l=s.n(o);let i=a.localhost,u=new c.a(new c.a.providers.WebsocketProvider(i.url.replace("http","ws")));u.eth.defaultAccount=u.eth.accounts[0];let p=new u.eth.Contract(r.abi,i.appAddress),h=20;var d=[],g=[];(async function(){let e=await u.eth.getAccounts();return e.length<h?(h=e.length,d=e):d=e.slice(20,20+h),d})().then(e=>{!async function(e){let t=await p.methods.REGISTRATION_FEE().call();for(let s=0;s<h;s++){await p.methods.registerOracle().send({from:e[s],value:t,gas:5e6,gasPrice:2e7});let r=await i.flightSuretyApp.getMyIndexes().call({from:e[s]});g.push(r)}}(e)});const f=l()();f.get("/api",(e,t)=>{t.send({message:"An API for use with your Dapp!"})}),t.default=f}};
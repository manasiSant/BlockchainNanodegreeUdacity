exports.id=0,exports.modules={"./src/server/server.js":function(e,t,r){"use strict";r.r(t);var s=r("./build/contracts/FlightSuretyApp.json"),a=r("./src/server/config.json"),n=r("web3"),c=r.n(n),o=r("express"),l=r.n(o);let i=a.localhost,u=new c.a(new c.a.providers.WebsocketProvider(i.url.replace("http","ws")));u.eth.defaultAccount=u.eth.accounts[0];let p=new u.eth.Contract(s.abi,i.appAddress),h=20;var d=[];(async function(){let e=await u.eth.getAccounts();return e.length<h?(h=e.length,d=e):d=e.slice(20,20+h),d})().then(e=>{!async function(e){let t=await p.methods.REGISTRATION_FEE().call();for(let r=0;r<h;r++){await i.flightSuretyApp.registerOracle().send({from:e[r],value:t,gas:5e6,gasPrice:2e7});await i.flightSuretyApp.getMyIndexes().call({from:e[r]})}}(e)});const g=l()();g.get("/api",(e,t)=>{t.send({message:"An API for use with your Dapp!"})}),t.default=g}};
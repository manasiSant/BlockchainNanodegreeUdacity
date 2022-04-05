exports.id=0,exports.modules={"./src/server/server.js":function(e,t,s){"use strict";s.r(t);var r=s("./build/contracts/FlightSuretyApp.json"),a=s("./src/server/config.json"),n=s("web3"),c=s.n(n),o=s("express"),l=s.n(o);let i=a.localhost,u=new c.a(new c.a.providers.WebsocketProvider(i.url.replace("http","ws")));u.eth.defaultAccount=u.eth.accounts[0];let p=new u.eth.Contract(r.abi,i.appAddress),h=20;var d=[];(async function(){let e=await u.eth.getAccounts();return e.length<h?(h=e.length,d=e):d=e.slice(20,20+h),d})().then(e=>{!async function(e){let t=await p.methods.REGISTRATION_FEE().call();for(let s=0;s<h;s++){await i.flightSuretyApp.methods.registerOracle().send({from:e[s],value:t,gas:5e6,gasPrice:2e7});await i.flightSuretyApp.getMyIndexes().call({from:e[s]})}}(e)});const g=l()();g.get("/api",(e,t)=>{t.send({message:"An API for use with your Dapp!"})}),t.default=g}};
exports.id=0,exports.modules={"./src/server/server.js":function(e,s,t){"use strict";t.r(s);var o=t("./build/contracts/FlightSuretyApp.json"),r=t("./src/server/config.json"),n=t("web3"),c=t.n(n),a=t("express"),l=t.n(a);let i=r.localhost,u=new c.a(new c.a.providers.WebsocketProvider(i.url.replace("http","ws")));u.eth.defaultAccount=u.eth.accounts[0];new u.eth.Contract(o.abi,i.appAddress);var p=[];(async function(){let e=await u.eth.getAccounts();console.log(e),p=e.slice(20,45),console.log(p)})().then(e=>{console.log(e)});const d=l()();d.get("/api",(e,s)=>{s.send({message:"An API for use with your Dapp!"})}),s.default=d}};
exports.id=0,exports.modules={"./src/server/server.js":function(e,t,s){"use strict";s.r(t);var r=s("./build/contracts/FlightSuretyApp.json"),o=s("./src/server/config.json"),a=s("web3"),n=s.n(a),l=s("express"),c=s.n(l);let i=o.localhost,u=new n.a(new n.a.providers.WebsocketProvider(i.url.replace("http","ws")));u.eth.defaultAccount=u.eth.accounts[0];let h=new u.eth.Contract(r.abi,i.appAddress),d=20;var g=[],f=new Map;function p(e,t,s,r,o){var a=10*(Math.floor(Math.random()*Math.floor(4))+1)+10;h.methods.submitOracleResponse(t,s,r,o,a).send({from:e,gas:5e5,gasPrice:2e7},(e,t)=>{e&&console.log(e,r)})}(async function(){let e=await u.eth.getAccounts();return e.length<d?(d=e.length,g=e):g=e.slice(20,20+d),g})().then(e=>{!async function(e){let t=await h.methods.REGISTRATION_FEE().call();for(let s=0;s<d;s++){await h.methods.registerOracle().send({from:e[s],value:t,gas:5e6,gasPrice:281088582});let r=await h.methods.getMyIndexes().call({from:e[s]});f.set(e[s],r)}}(e)}),h.events.OracleRequest({fromBlock:"latest"},(function(e,t){e&&console.log(e),console.log(t);let s=t.returnValues.index;for(let e=0;e<g.length;e++){f.get(g[e]).forEach(e=>{s==e&&(console.log(`Oracle: ${thisOracle} invoked. Index: ${s}.`),p(thisOracle,s,t.returnValues.airline,t.returnValues.flight,t.returnValues.timestamp))})}}));const m=c()();m.get("/api",(e,t)=>{t.send({message:"An API for use with your Dapp!"})}),t.default=m}};
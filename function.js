let merchants = [];

exports.handler = async function(event) {
  const { fn } = event.queryStringParameters || {};

  if(fn === "register") {
    const body = JSON.parse(event.body);
    const { username, password } = body;
    if(!username||!password) return {statusCode:400, body:JSON.stringify({error:"Missing fields"})};
    if(merchants.find(m=>m.username===username)) return {statusCode:400, body:JSON.stringify({error:"User exists"})};
    const newM = { id: Date.now(), username, password, products: []};
    merchants.push(newM);
    return {statusCode:200, body:JSON.stringify({message:"ok", merchant:newM})};
  }

  if(fn === "login") {
    const body = JSON.parse(event.body);
    const { username, password } = body;
    const m = merchants.find(x=>x.username===username&&x.password===password);
    return m 
      ? {statusCode:200, body:JSON.stringify({merchant:m})}
      : {statusCode:401, body:JSON.stringify({error:"invalid"})};
  }

  if(fn === "getProducts") {
    const mid = event.queryStringParameters.merchantId;
    const m = merchants.find(x=>x.id==mid);
    return m
      ? {statusCode:200, body:JSON.stringify({products:m.products})}
      : {statusCode:404, body:JSON.stringify({error:"no merchant"})};
  }

  if(fn === "addProduct") {
    const body = JSON.parse(event.body);
    const {merchantId,name,price} = body;
    const m = merchants.find(x=> x.id==merchantId);
    if(!m) return {statusCode:404, body:JSON.stringify({error:"no merchant"})};
    const prod = { id:Date.now(), name, price };
    m.products.push(prod);
    return {statusCode:200, body:JSON.stringify({product:prod})};
  }

  if(fn === "createPayment") {
    const body = JSON.parse(event.body);
    const {merchantId,amount,method,productName} = body;
    const m = merchants.find(x=>x.id==merchantId);
    if(!m) return {statusCode:404, body:JSON.stringify({error:"no merchant"})};
    const link = `https://pay.mock/${merchantId}/${method}/${productName}`;
    return {statusCode:200, body:JSON.stringify({paymentLink:link})};
  }

  return { statusCode:400, body:JSON.stringify({error:"fn missing"}) };
};

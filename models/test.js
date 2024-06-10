const productModel = require("../models/productModel");

async function testingZZZ() {
   let res = await productModel.getProductPrice(["aligator 21 onz"])
   console.log(res)
   console.log(res.precio_prod);
}

testingZZZ()
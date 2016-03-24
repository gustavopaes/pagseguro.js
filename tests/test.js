var assert = require('assert');
var pagseguro = require('../lib/pagseguro');
var _transactions = process.env.PAGSEGURO_CODES && process.env.PAGSEGURO_CODES.split(',') || [];
var _seller = {
  'name' : 'loja teste pagseguro.js',
  'email': process.env.PAGSEGURO_EMAIL,
  'token': process.env.PAGSEGURO_TOKEN
};

// Testa o preenchimento dos dados do vendedor
var compra = pagseguro(_seller);
assert.equal( compra.seller.name, _seller.name);
assert.equal( compra.seller.email, _seller.email);
assert.equal( compra.seller.token, _seller.token);

// Testa o preenchimento e tratamento dos dados dos produtos
var _product_1 = {
  'id': 'Livro - A Lei de Parkinson',
  'description': 'A "Lei de Parkinson" é um achado genial de transparente simplicidade.',
  'amount': 35.9,
  'quantity': 1,
  'weight': 30
};

var _product_2 = {
  'id': 'Caneta marca texto',
  'description': 'Cor azul, número 2',
  'amount': 3,
  'quantity': 2,
  'shippingCost': 1.7
};

compra.product.add(_product_1);
assert.equal( compra.product._products.itemId1, _product_1.id )
assert.equal( compra.product._products.itemDescription1, _product_1.description )
assert.strictEqual( compra.product._products.itemAmount1, '35.90' )
assert.equal( compra.product._products.itemQuantity1, _product_1.quantity )
assert.equal( compra.product._products.itemWeight1, _product_1.weight )
assert.equal( compra.product._products.itemShippingCost1, _product_1.shippingCost )

compra.product.add(_product_2);
assert.equal( compra.product._products.itemId2, _product_2.id )
assert.equal( compra.product._products.itemDescription2, _product_2.description )
assert.strictEqual( compra.product._products.itemAmount2, '3.00' )
assert.equal( compra.product._products.itemQuantity2, _product_2.quantity )
assert.equal( compra.product._products.itemWeight2, _product_2.weight )
assert.strictEqual( compra.product._products.itemShippingCost2, '1.70' )


var _sender = {
  'name': 'João da Silva',
  'email': 'comprador@uol.com.br',
  'areaCode': 11,
  'phone': '3030-3344',
  'document': '99999999999',
  'born': '01/02/1987'
};

compra.sender.set(_sender);

assert.equal( compra.sender._sender.senderName, _sender.name )
assert.equal( compra.sender._sender.senderEmail, _sender.email )
assert.equal( compra.sender._sender.senderAreaCode, _sender.areaCode )
assert.equal( compra.sender._sender.senderPhone, '30303344' )
assert.equal( compra.sender._sender.senderCPF, _sender.document )
assert.equal( compra.sender._sender.senderBornDate, _sender.born )


var _shipping = {
  'type': 3,
  'cost': 5.60,
  'postalCode': '01001-000',
  'state': 'SP',
  'city': 'São Paulo',
  'district': 'Sé',
  'street': 'Praça da Sé',
  'number': '500',
  'complement': 'Lado Impar'
};

compra.shipping.set(_shipping);

assert.equal( compra.shipping._shipping.shippingType, _shipping.type )
assert.equal( compra.shipping._shipping.shippingCost, _shipping.cost )
assert.equal( compra.shipping._shipping.shippingAddressPostalCode, _shipping.postalCode )
assert.equal( compra.shipping._shipping.shippingAddressState, _shipping.state )
assert.equal( compra.shipping._shipping.shippingAddressCity, _shipping.city )
assert.equal( compra.shipping._shipping.shippingAddressDistrict, _shipping.district )
assert.equal( compra.shipping._shipping.shippingAddressStreet, _shipping.street )
assert.equal( compra.shipping._shipping.shippingAddressNumber, _shipping.number )
assert.equal( compra.shipping._shipping.shippingAddressComplement, _shipping.complement )

compra.checkout(function(err, res, body) {
  assert.strictEqual( !!err, false, err );
  assert.strictEqual( typeof body, 'object', 'Retorno deve ser objeto, veio: ' + body);
  assert.strictEqual( !!body.errors, false, (function() {
    if(!!body.errors === true) {
      console.log('Erro no retorno da API. Mensagem retornada:');
      console.log(body.errors);
      process.exit(1);
    }
  }()));
  assert.strictEqual( res.statusCode, 200, res.statusCode );
})

_transactions.forEach(function(transaction) {
  compra.transactions(transaction, function(err, res, result) {
    assert.strictEqual( !!err, false, err );
    assert.strictEqual( res.statusCode, 200, res.statusCode );
  })
})

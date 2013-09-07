`// exemplo de uso
var compra = pagseguro({
  'name': 'Nome da loja',
  'email': 'email@nopagseguro.com.br',
  'token': 'TOKEN DE ACESSO'
});

// definições do frete
compra.shipping
  // sem definição do tipo de frete
  .setType(3)
  // define valor fixo para o frete
  .setCost(5)
  // dados de entrega
  .setPostalCode('01001-000')
  .setState('SP')
  .setCity('São Paulo')
  .setDistrict('Sé')
  .setStreet('Praça da Sé')
  .setComplement('Lado Ímpar')
;

// definições do comprador
compra.sender
  .setName("João da Silva")
  .setPhone(11, '1111-9999')
  .setEmail('joao@nsa.com');

// definição dos produtos
compra.product.add({
  'id': 'Livro - Lei de Parkinson, A',
  'description': 'A "Lei de Parkinson" é um achado genial de transparente simplicidade.',
  'amount': 35.90,
  'quantity': 1
})

/**
 * Possíveis retornos do body:
 * {
 *   "checkout": {
 *     "code": "XXXXXXXXXXXXX",
 *     "date": "YYYY-MM-DDTHH:MM:SS.000-03.00"
 *   }
 * }
 */
compra.checkout(function(err, res, body) {
  if( !!body.errors === true ) {
    var err;
    for(err in body.errors) {
      console.log( body.errors[err] )
    }
  }
  else {
    // 
    console.log( body.checkout );
  }
});`
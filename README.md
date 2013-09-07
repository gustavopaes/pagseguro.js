## pagseguro.js

Lib NodeJS que integra o serviço de pagamentos online do PagSeguro.

### Exemplos

#### Iniciando uma instância

`var pagseguro = require('pagseguro');

// Ao iniciar a instância deve-se passar os dados do
// vendedor para obter acesso à API.
var compra = pagseguro({
  'name': 'Nome da loja',
  'email': 'email@nopagseguro.com.br',
  'token': 'TOKEN DE ACESSO'
});`

#### Adicionando um produto

`compra.product.set({
  'id': 'Livro - A Lei de Parkinson',
  'description': 'A "Lei de Parkinson" é um achado genial de transparente simplicidade.',
  'amount': 35.90,
  'quantity': 1
});

compra.product.add({
  'id': 'Caneta marca texto',
  'description': 'Cor azul, número 2',
  'amount': 3,30,
  'quantity': 2
});`

#### Definições de endereço de entrega e frete

`compra.shipping.set({
  'type': 3,
  'cost': 5.60,
  'postalCode': '01001-000',
  'state': 'SP',
  'city': 'São Paulo',
  'district': 'Sé',
  'street': 'Praça da Sé',
  'complement': 'Lado Impar',
  'number': '500'
});`

#### Efetuando o request e recebendo o código de compra

`compra.checkout(function(err, res, body) {
  if( !!err === false && !!body.errors === false ) {
    // grava os dados no banco de dados
    mongodb.save( body.checkout );

    // redireciona o usuário para pagamento
    res.redirect('https://pagseguro.uol.com.br/v2/checkout/payment.html?code=' + body.checkout.code);
  }
});`

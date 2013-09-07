## pagseguro.js

Lib NodeJS que integra o serviço de pagamentos online do PagSeguro.


### Instalando

A lib ainda não está no `npm`, por isso, para instalar, clone o repositório e use `npm install` para obter as dependências.

    git clone git@github.com:gustavopaes/pagseguro.js.git
    npm install

### Exemplos

#### Iniciando uma instância

    var pagseguro = require('pagseguro');
    
    // Ao iniciar a instância deve-se passar os dados do
    // vendedor para obter acesso à API.
    var compra = pagseguro({
      'name': 'Nome da loja',
      'email': 'email@nopagseguro.com.br',
      'token': 'TOKEN DE ACESSO'
    });

#### Adicionando um produto

    compra.product.add({
      'id': 'Livro - A Lei de Parkinson',
      'description': 'A "Lei de Parkinson" é um achado genial de transparente simplicidade.',
      'amount': 35.9,
      'quantity': 1,
      'weight': 30
    });

    compra.product.add({
      'id': 'Caneta marca texto',
      'description': 'Cor azul, número 2',
      'amount': 3,
      'quantity': 2,
      'shippingCost': 1.7
    });

#### Definições do comprador

    compra.sender({
      'name': 'João da Silva',
      'email': 'comprador@uol.com.br',
      'areaCode': 11,
      'phone': '3030-3344',
      'document': '99999999999',
      'born': 'dd/MM/yyyy'
    });

#### Definições de endereço de entrega e frete

    compra.shipping.set({
      'type': 3,
      'cost': 5.60,
      'postalCode': '01001-000',
      'state': 'SP',
      'city': 'São Paulo',
      'district': 'Sé',
      'street': 'Praça da Sé',
      'number': '500',
      'complement': 'Lado Impar'
    });

#### Efetuando o request e recebendo o código de compra

    compra.checkout(function(err, res, body) {
      if( !!err === false && !!body.errors === false ) {
        // grava os dados no banco de dados
        mongodb.save( body.checkout );

        // redireciona o usuário para pagamento
        res.redirect('https://pagseguro.uol.com.br/v2/checkout/payment.html?code=' + body.checkout.code);
      }
    });

### Efetuando testes

Para fazer os testes, edite o arquivo `tests/token.json` com as informações de acesso ao PagSeguro:

    {
      'name': '',  // Nome da loja (opcional)
      'email': '', // Seu e-mail de acesso ao PagSeguro
      'token': ''  // Token de segurança para usar a API
    }

Para validar o acesso, execute:
`node tests/test.js`

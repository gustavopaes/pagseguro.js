module.exports = (function() {
  "use strict";

  // dependências
  var request = require('request'),
    querystring = require('querystring'),
    xml2js = require('xml2js');

  var parseXML = new xml2js.Parser({ explicitArray: false }).parseString;

  /**
   * Faz um dê-para dos dados recebidos para os dados que serão
   * enviados à API do PagSeguro.
   * @param {Object} base Hash com o dê-para dos dados
   * @param {Object} data Dados que foram inputados e serão enviados
   * @param {Object} target Objeto destino
   * @returns {Object} targeet
   */
  var register = function(base, data, target, suffix) {
    var attr;
    for(attr in data) {
      if( data.hasOwnProperty(attr) === true ) {
        target[base[attr] + (suffix || '')] = validate(attr, data[attr]);
      }
    }

    return target;
  }

  /**
   * Faz a validação dos dados de entrada.
   * @param {String} attr Nome do campo
   * @param {String|Number} value Valor para validar
   * @returns {String} valor validado
   */
  var validate = function(attr, value) {
    value = value.toString();

    switch(attr) {
      case 'phone':
        return value.replace(/[^\d]/g, '');
      break;

      case 'cost':
      case 'amount':
      case 'shippingCost':
        return parseFloat(value).toFixed(2);
      break;

      default:
        return value;
      break;
    }
  }

  /**
   * Módulo do pagseguro
   */
  var pagseguro = function(seller) {
    if( this instanceof pagseguro === false )
      return new pagseguro(seller);

    /**
     * Dados do vendedor
     */
    this.seller = seller;

    /**
     * Url base, define se está na Sandbox ou não
     * @type {string}
       */
    this.baseUri = 'https://ws.pagseguro.uol.com.br';

    if (process.env.PAGSEGURO_TEST) {
      this.baseUri = 'https://ws.sandbox.pagseguro.uol.com.br';
    }

    this.checkout = function(callback) {
      // cria a query de post com os dados informados
      var data = '';
      data += querystring.stringify(this.product._products);
      data += '&'+querystring.stringify(this.sender._sender);
      data += '&'+querystring.stringify(this.shipping._shipping);

      var options = {
        uri: this.baseUri + '/v2/checkout?'+querystring.stringify(this.seller),
        method: 'POST',
        body: data,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8',
          'Content-Length': data.length
        }
      };

      request.post(options, function(err, res, body) {
        if( !!err === false ) {
          var body = parseXML(body, function(err_x, json) {
            callback(err, res, json);
          });
        }
        else {
          callback(err, res, body);
        }
      });
    };

    this.transactions = function(code, callback) {
      var uri = this.baseUri + '/v2/transactions/'+ code + '?'+ querystring.stringify(this.seller);

      var options = {
        uri: uri,
        method: 'GET',
        headers: {
          'Content-Type': 'application/text-plain; charset=utf-8'
        }
      };

      request.get(uri, options, function(err, res, body) {
        if( !!err === false ) {
          var body = parseXML(body, function(err_x, json) {
            callback(err, res, json);
          });
        }
        else {
          callback(err, res, body);
        }
      });
    };

    return this;
  };

  /**
   * Métodos para registrar os dados do comprador.
   */
  pagseguro.prototype.sender = {
    _sender: {
      'documents': {}
    },

    base: {
      'name': 'senderName',
      'email': 'senderEmail',
      'areaCode': 'senderAreaCode',
      'phone': 'senderPhone',
      'document': 'senderCPF',
      'born': 'senderBornDate'
    },

    set: function(data) {
      register(this.base, data, this._sender);
    }
  };

  pagseguro.prototype.product = {
    id: 1,

    _products: {
      // Prazo de validade do código de pagamento.
      'maxAge': 600,
      // Moeda de compra
      'currency': 'BRL'
    },

    base: {
      'id': 'itemId',
      'description': 'itemDescription',
      'amount': 'itemAmount',
      'quantity': 'itemQuantity',
      'shippingCost': 'itemShippingCost',
      'weight': 'itemWeight'
    },

    add: function(data) {
      register(this.base, data, this._products, this.id++);
    }
  };

  /**
   * Métodos para registrar o endereço de entrega do produto.
   */
  pagseguro.prototype.shipping = {
    _shipping: {
      'shippingAddressCountry': 'BRA'
    },

    base: {
      'type': 'shippingType',
      'cost': 'shippingCost',
      'country': 'shippingAddressCountry',
      'state': 'shippingAddressState',
      'city': 'shippingAddressCity',
      'postalCode': 'shippingAddressPostalCode',
      'district': 'shippingAddressDistrict',
      'street': 'shippingAddressStreet',
      'number': 'shippingAddressNumber',
      'complement': 'shippingAddressComplement'
    },

    set: function(data) {
      register(this.base, data, this._shipping);
    }
  };

  return pagseguro;
}());
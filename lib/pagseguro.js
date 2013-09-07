module.exports = (function() {
  "use strict";

  // dependências
  var request = require('request'),
    querystring = require('querystring'),
    xml2js = require('xml2js');

  var parseXML = new xml2js.Parser({ explicitArray: false }).parseString;

  /**
   * Extend um objeto em outro objeto.
   * @param {Object} target Objeto destino
   * @param {Object} obj Objeto que será copiado
   * @returns {Object}
   */
  var extend = function(target, obj) {
    var attr;
    // extend obj attributes to target object
    for(attr in obj) {
      if( obj.hasOwnProperty(attr) === true && target.hasOwnProperty(attr) === false )
        target[attr] = obj[attr];
    }

    return target;
  }

  /**
   * Faz um dê-para dos dados recebidos para os dados que serão
   * enviados à API do PagSeguro.
   * @param {Object} base Hash com o dê-para dos dados
   * @param {Object} data Dados que foram inputados e serão enviados
   * @param {Object} target Objeto destino
   * @returns {Object} targeet
   */
  var register = function(base, data, target) {
    var attr;
    for(attr in data) {
      if( data.hasOwnProperty(attr) === true ) {
        target[base[attr]] = validate(attr, data[attr]);
      }
    }

    return target;
  }

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

    this.send = {};

    /**
     * Dados do vendedor
     */
    this.seller = {};

    extend(this.seller, seller);

    this.checkout = function(callback) {
      // cria a query de post com os dados informados
      var data = '';
      data += querystring.stringify(this.product._products);
      data += '&'+querystring.stringify(this.sender._sender);
      data += '&'+querystring.stringify(this.shipping._shipping);

      var options = {
        uri: 'https://ws.pagseguro.uol.com.br/v2/checkout?'+querystring.stringify(this.seller),
        method: 'POST',
        body: data,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
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
      'born': 'bornDate'
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
      var attr;
      for(attr in data) {
        if( data.hasOwnProperty(attr) === true ) {
          this._products[ this.base[attr] + this.id.toString() ] = validate(attr, data[attr]);
        }
      }

      this.id += 1;
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
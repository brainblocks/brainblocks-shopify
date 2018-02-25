function nanoShopify (opts) {
  opts = opts || {}

  var thanksEl
  var brainblocksContainer
  var thanksTitleEl
  var shopifyToken

  this.loadScript = function (url, done) {
    var script = document.createElement('script')
    script.src = url
    script.onload = done
    document.querySelector('html>head,body').appendChild(script)
  }

  this.showErrors = function (errs) {
    errs = typeof(errs) == 'string' ? [errs] : errs
    brainblocksContainer.innerHTML = '<div class="alert alert-danger">' + errs.join('<br />') + '</div>'
  }

  this.showXHRErrors = function (xhr) {
    var body = xhr.responseJSON
    this.showErrors(body.error)
  }

  //Get the order information based on token
  this.getOrder = function (done) {
    $.ajax({
      url: opts.endpoint + '/order/' + shopifyToken,
      dataType: 'json',
      success: function (order) {
        done(null, order)
      }.bind(this),
      error: function (xhr) {
        this.showXHRErrors(xhr)
      }.bind(this)
    });
  }

  //Confirm the nano payment, which will also mark it paid
  this.confirmPayment = function (data) {
    var brainblocksToken = data.token
    $.ajax({
      method: 'POST',
      url: opts.endpoint + '/order/' + shopifyToken + '/confirm/' + brainblocksToken,
      dataType: 'json',
      success: function (json) {
        console.log('json',json);
        thanksTitleEl.innerHTML = 'Nano received'
        brainblocksContainer.innerHTML = 'Payment received.'
      },
      error: function (xhr) {
        console.log('xhr',xhr);
        this.showXHRErrors(xhr)
      }.bind(this)
    })

  }

  this.start = function () {
    console.log('START');
    if (!window.brainblocks) {
      return this.loadScript('https://brainblocks.io/brainblocks.min.js', function () {
        this.start(opts)
      }.bind(this))
    }

    if (!window.$) {
      return this.loadScript('https://code.jquery.com/jquery-3.3.1.min.js', function () {
        this.start(opts)
      }.bind(this))
    }

    console.log('starting');
    thanksEl = document.querySelector('.os-step__special-description')
    thanksTitleEl = document.querySelector('.os-step__title')
    brainblocksContainer = document.createElement('div')
    brainblocksContainer.setAttribute('id', 'brainblocks-shopify-container')
    thanksEl.appendChild(brainblocksContainer)

    var parts = window.location
    var url = window.location.href
    var parts = window.location.pathname.split('/')
    shopifyToken = parts[3]

    thanksEl.classList.toggle('loading', true)
    thanksTitleEl.innerHTML = 'Loading...'

    this.getOrder(function (err, order) {
      console.log('order',order);
      thanksEl.classList.toggle('loading', false)
      if (err) {
        return this.showErrors(err)
      }

      if (order.financial_status == 'pending') {
        thanksTitleEl.innerHTML = 'Awaiting Nano payment'
        brainblocksContainer.innerHTML = '<div id="brainblocks-button"></div>'

        var currency = opts.currency
        var total = order.total_price
        var rendered = true
        try {
          brainblocks.Button.render({
            payment: {
              destination: opts.destination,
              currency: currency,
              amount: total
            },
            onPayment: function(data) {
              console.log('data',data)
              this.confirmPayment(data)
            }.bind(this)
          }, '#brainblocks-button');
        }
        catch (ex) {
          this.showErrors(ex.toString())
          rendered = false
        }
      }
      else if(order.financial_status == 'paid') {
        thanksTitleEl.innerHTML = 'Nano received'
        brainblocksContainer.innerHTML = '<div class="brainblocks-confirmed">Nano payment received.</div>'
      }
      else {
        thanksTitleEl.innerHTML = 'Status: ' + order.financial_status
        brainblocksContainer.innerHTML = '<div class="">Contact support</div>'
      }
    }.bind(this))

  }
}

function nanoShopify (opts) {
  opts = opts || {}

  var defaults = {
  }

  opts = Object.assign(defaults, opts)

  var thanksEl
  var brainblocksContainer
  var thanksTitleEl
  var shopifyToken
  var buttonContainer

  this.loadScript = function (url, done) {
    var script = document.createElement('script')
    script.src = url
    script.onload = done
    document.querySelector('html>head,body').appendChild(script)
  }

  this.showErrors = function (errs) {
    errs = typeof(errs) == 'string' ? [errs] : errs
    brainblocksContainer.innerHTML = '<div class="nano-shopify-errors">' + errs.join('<br />') + '</div>'
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
    thanksEl.classList.toggle('nano-shopify-loading', true)
    buttonContainer.setAttribute('style', 'display: none;')
    var brainblocksToken = data.token
    $.ajax({
      method: 'POST',
      url: opts.endpoint + '/order/' + shopifyToken + '/confirm/' + brainblocksToken,
      dataType: 'json',
      success: function (json) {
        thanksEl.classList.toggle('nano-shopify-loading', false)
        this.showPaymentReceived()
      }.bind(this),
      error: function (xhr) {
        thanksEl.classList.toggle('nano-shopify-loading', false)
        this.showXHRErrors(xhr)
      }.bind(this)
    })
  }

  this.showPaymentReceived = function () {
    thanksTitleEl.innerHTML = 'Nano received'
    brainblocksContainer.innerHTML = '<div class="nano-shopify-confirmed"><strong>Paid!</strong> Your Nano payment has been received.</div>'
  }

  this.start = function () {
    var paymentMethodEl = document.querySelector('.payment-method-list__item__info')

    if( !paymentMethodEl) {
      setTimeout(function () {
        this.start()
      }.bind(this), 5)
      return
    }

    var text = paymentMethodEl.innerText;

    if (text.toLowerCase().indexOf('nano') == -1) {
      return
    }

    if (!window.brainblocks) {
      return this.loadScript('https://brainblocks.io/brainblocks.min.js', function () {
        this.start()
      }.bind(this))
    }

    if (!window.$) {
      return this.loadScript('https://code.jquery.com/jquery-3.3.1.min.js', function () {
        this.start()
      }.bind(this))
    }

    thanksEl = document.querySelector('.os-step__special-description')
    thanksTitleEl = document.querySelector('.os-step__title')
    brainblocksContainer = document.createElement('div')
    brainblocksContainer.setAttribute('id', 'nano-shopify-shopify-container')

    brainblocksContainer.innerHTML = `
<div class="nano-shopify-loading-container">
  <img src="data:image/svg+xml;base64,PHN2ZyB4bWxuczpzdmc9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB2ZXJzaW9uPSIxLjAiIHdpZHRoPSIyNXB4IiBoZWlnaHQ9IjI1cHgiIHZpZXdCb3g9IjAgMCAxMjggMTI4IiB4bWw6c3BhY2U9InByZXNlcnZlIj48Zz48cGF0aCBkPSJNNzguNzUgMTYuMThWMS41NmE2NC4xIDY0LjEgMCAwIDEgNDcuNyA0Ny43SDExMS44YTQ5Ljk4IDQ5Ljk4IDAgMCAwLTMzLjA3LTMzLjA4ek0xNi40MyA0OS4yNUgxLjhhNjQuMSA2NC4xIDAgMCAxIDQ3LjctNDcuN1YxNi4yYTQ5Ljk4IDQ5Ljk4IDAgMCAwLTMzLjA3IDMzLjA3em0zMy4wNyA2Mi4zMnYxNC42MkE2NC4xIDY0LjEgMCAwIDEgMS44IDc4LjVoMTQuNjNhNDkuOTggNDkuOTggMCAwIDAgMzMuMDcgMzMuMDd6bTYyLjMyLTMzLjA3aDE0LjYyYTY0LjEgNjQuMSAwIDAgMS00Ny43IDQ3Ljd2LTE0LjYzYTQ5Ljk4IDQ5Ljk4IDAgMCAwIDMzLjA4LTMzLjA3eiIgZmlsbD0iIzgxY2RmMSIgZmlsbC1vcGFjaXR5PSIxIi8+PGFuaW1hdGVUcmFuc2Zvcm0gYXR0cmlidXRlTmFtZT0idHJhbnNmb3JtIiB0eXBlPSJyb3RhdGUiIGZyb209Ii05MCA2NCA2NCIgdG89IjAgNjQgNjQiIGR1cj0iNDAwbXMiIHJlcGVhdENvdW50PSJpbmRlZmluaXRlIj48L2FuaW1hdGVUcmFuc2Zvcm0+PC9nPjwvc3ZnPg==" />
</div>
<div class="nano-shopify-button-container">
  <div id="nano-shopify-button"></div>
</div>
`
    thanksEl.appendChild(brainblocksContainer)
    buttonContainer = document.querySelector('.nano-shopify-button-container')

    var styles = document.createElement('style')
    styles.innerHTML = `
.nano-shopify-confirmed {
  color: green;
}
#nano-shopify-shopify-container {
}
.nano-shopify-loading-container {
  display: none;
  text-align: center;
  padding: 10px 0;
}
.nano-shopify-loading .nano-shopify-loading-container {
  display: block;
}
.nano-shopify-loading-container img {
  width: 50px;
}
`
    document.querySelector('body,html').appendChild(styles)

    var parts = window.location
    var url = window.location.href
    var parts = window.location.pathname.split('/')
    shopifyToken = parts[3]

    thanksEl.classList.toggle('nano-shopify-loading', true)
    thanksTitleEl.innerHTML = 'Loading...'

    this.getOrder(function (err, order) {
      thanksEl.classList.toggle('nano-shopify-loading', false)
      if (err) {
        return this.showErrors(err)
      }

      if (order.financial_status == 'pending') {
        thanksTitleEl.innerHTML = 'Awaiting Nano payment'

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
              this.confirmPayment(data)
            }.bind(this)
          }, '#nano-shopify-button');
        }
        catch (ex) {
          this.showErrors(ex.toString())
          rendered = false
        }
      }
      else if(order.financial_status == 'paid') {
        this.showPaymentReceived()
      }
      else {
        thanksTitleEl.innerHTML = 'Status: ' + order.financial_status
        this.showErrors('Error with your order. Contact support.')
      }
    }.bind(this))

  }
}

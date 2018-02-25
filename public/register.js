$(document).ready(function () {
  var shopUrl = ''
  var numSteps = $('.step').length

  //TESTING ONLY
  $('[name=shopUrl]').val('https://vindexus-nano-dev-store.myshopify.com')
  $('[name=apiKey]').val('98bdbfe0a021fc24703d97356601566c')
  $('[name=destination]').val('xrb_14z4kpjm5q1z7n5uk5jfikk6cxk384wdiz8ut5b8n57r3patutxwf6ux8ghb')
  $('[name=password]').val('b763a70e363f5e55b755ed53324a009f')

  $('[name=shopUrl]').focus()

  function showStep (step) {
    var perPer = Math.round((100 / numSteps))
    $('.progress-bar').css('width', (perPer * step) + '%').text('Step ' + step + '/' + numSteps)
    $('.step:not(.step-' + step + ')').slideUp().removeClass('active')
    $('.step-' + step).slideDown().addClass('active')
  }

  function showErrors (errors) {
    errors = typeof(errors) == 'string' ? [errors] : errors
    $('[role=errors]').html(errors.join('<br />')).show()
  }

  function hideErrors () {
    $('[role=errors]').hide()
  }

  $('form[role=enter-url]').submit(function (e) {
    e.preventDefault()
    hideErrors()
    shopUrl = $('[name=shopUrl]').val()

    if (shopUrl.indexOf('http') != 0) {
      showErrors('Invalid shop url')
      return
    }

    if (shopUrl.indexOf('myshopify.com') == -1) {
      showErrors('Make sure you use you my-shop.myshopify.com')
      return
    }

    var createUrl = shopUrl + '/admin/apps/private/new'
    $('[role=create-private-app]').attr('href', createUrl)
    $('[role=go-to-checkout-settings]').attr('href', shopUrl + '/admin/settings/checkout#settings-order-processing')
    $('[role=go-to-payment-settings]').attr('href', shopUrl + '/admin/settings/payments')
    $('[role=private-app-url]').text(createUrl)
    showStep(2)
    $('[role=done-step-2]').focus()
  })

  $('[role=done-step-2]').click(function (e) {
    e.preventDefault()
    showStep(3)
    $('[name=apiKey]').focus()
  })

  $('[role=done-step-4]').click(function (e) {
    e.preventDefault()
    showStep(5)
  })

  $('[role=cody-code]').click(function (e) {
    var copyText = document.getElementById("code");
    copyText.select();
    document.execCommand("Copy");
  })

  $('[role=back]').click(function (e) {
    e.preventDefault()
    var step =$('.step.active').attr('data-step')
    step = parseInt(step) - 1
    showStep(step)
  })

  $('form[role=register]').submit(function (e) {
    e.preventDefault()
    hideErrors()
    var data = {
      shopUrl: shopUrl,
      apiKey: $('[name=apiKey]').val(),
      password: $('[name=password]').val(),
      destination: $('[name=destination]').val(),
      currency: $('[name=currency]').val()
    }

    if (!data.apiKey) {
      showErrors('API Key is required')
      return
    }

    if (!data.password) {
      showErrors('Password is required')
      return
    }

    if (!data.destination) {
      showErrors('Destination is required')
      return
    }

    if (!data.currency) {
      showErrors('Currency is required')
      return
    }

    $(this).find('button').attr('disabled', 'disabled')

    $.ajax({
      method: 'POST',
      url: '/register',
      data: JSON.stringify(data),
      dataType: 'json',
      contentType: 'application/json',
      success: function (json) {
        $(this).find('button').removeAttr('disabled')

        var html = `<script type="text/javascript" src="` + json.src + `"></script>
<script type="text/javascript">
var nano = new nanoShopify({
  currency: '` + json.currency + `',
  endpoint: '` + json.endpoint + `',
  key: '` + json.key + `',
  destination: '` + json.destination + `'
})
nano.start()
</script>`
        $('textarea').val(html).focus()
        showStep(4)
      }.bind(this),
      error: function (xhr) {
        $(this).find('button').removeAttr('disabled')
        if (!xhr.responseJSON) {
          showErrors(xhr.statusText)
        }
        else {
          showErrors(xhr.responseJSON.error)
        }
      }.bind(this)
    })
  })
})
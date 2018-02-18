$(document).ready(function () {
  var amount
  var symbol

  function copyCode () {
    $('#discount-code')[0].select();

    var successful;
    try {
      successful = document.execCommand('copy');
    } catch (err) {
      successful = false
    }

    if (successful) {
      $('.step-3 .alert-success').show()
    }
    else {
      $('.step-3 .alert-success').hide()
    }

    return successful
  }

  function showStep (step) {
    $('.progress-bar').css('width', (step * '33.33') + '%').text('Step ' + step + '/3')
    $('.step:not(.step-' + step + ')').slideUp()
    $('.step-' + step).slideDown()
  }

  function showErrors (errors) {
    errors = typeof(errors) == 'string' ? [errors] : errors
    $('[role=errors]').html(errors.join('<br />')).show()
  }

  function hideErrors () {
    $('[role=errors]').hide()
  }

  function createCode (token) {
    showStep(3)

    $.ajax('/create-code', {
      data: JSON.stringify({
        amount: amount,
        token: token
      }),
      contentType: 'application/json',
      type: 'POST',
      success: function(data, status, xhr){
        $('#discount-code').val(data.shopifyCode)
        $('[role=amount]').text(data.amount)
        $('.loading').hide()
        $('.loaded').show()
      },
      error: function (xhr) {
        var data = JSON.parse(xhr.responseText);
        showErrors(data.errors)
        $('.loading').hide()
      }
    })
  }


  $('#copy-code').click(function () {
    if (!copyCode()) {
      if (!prompt("Copy this code:", $('#brainblocks-discount-code').val())) {
        return
      }
    }
  })

  $('form').submit(function (e) {
    hideErrors()
    e.preventDefault()

    amount = $('#amount').val()
    amount = parseFloat(amount)

    if (!amount || typeof(amount) !== 'number') {
      showErrors('Please enter a valid amount.')
      return
    }

    $('#brainblocks-container').html('<div id="brainblocks-button"></div>')
    $('[role=amount]').text(amount)

    var rendered = true
    try {
      brainblocks.Button.render({
        payment: {
          destination: $('#destination').val(),
          currency: CURRENCY,
          amount: amount
        },
        onPayment: function(data) {
          createCode(data.token)
        }
      }, '#brainblocks-button');
    }
    catch (ex) {
      showErrors(ex.toString())
      rendered = false
    }

    if (rendered) {
      showStep(2)
    }
  })

  $('.btn-cancel').click(function () {
    showStep(1)
    $('#amount').val('')
  })
})

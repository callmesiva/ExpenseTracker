
document.getElementById('checkout').onclick = function(e){
    
    var options = {
       "key": "rzp_test_y2rhyNcdmxHGW8",
       "currency": "INR",
       "name": "Razor Tutorial",
       "description": "Razor Test Transaction",
       "order_id": document.getElementById('orderid').value,
       "handler": function (response){
            document.getElementById('orderid1').value=response.razorpay_order_id;   
            document.getElementById('paymentid').value=response.razorpay_payment_id;
            document.getElementById('signature').value=response.razorpay_signature;
        },

        "theme": {
            "color": "#1c2c45"
        } 

    };

    var rzp1 = new Razorpay(options);
    rzp1.open();
    e.preventDefault();
                    
    document.getElementById('show').style.display = 'block';
}

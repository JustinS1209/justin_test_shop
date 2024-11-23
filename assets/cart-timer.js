// cart-timer.js

(function () {
    // Function to start the countdown
    function startCountdown(duration, display) {
        var timer = duration, minutes, seconds;
        var countdownInterval = setInterval(function () {
            minutes = parseInt(timer / 60, 10);
            seconds = parseInt(timer % 60, 10);

            minutes = minutes < 10 ? '0' + minutes : minutes;
            seconds = seconds < 10 ? '0' + seconds : seconds;

            display.textContent = minutes + 'm ' + seconds + 's';

            if (--timer < 0) {
                clearInterval(countdownInterval);
                // Optionally, handle cart expiration here
                display.textContent = 'Your reservation has expired.';
                // You can also clear the cart by making an AJAX call
                // clearCart();
            }
        }, 1000);
    }

    // Function to initialize or retrieve the expiration time
    function initializeTimer() {
        var now = Math.floor(Date.now() / 1000);
        var expirationTime = localStorage.getItem('cartExpiration');

        if (!expirationTime || expirationTime <= now) {
            // Set expiration time for 15 minutes from now
            expirationTime = now + 15 * 60;
            localStorage.setItem('cartExpiration', expirationTime);
        }

        var timeLeft = expirationTime - now;
        var display = document.getElementById('countdown-timer');
        if (display) {
            startCountdown(timeLeft, display);
        }
    }

    // Function to clear the cart (optional)
    function clearCart() {
        fetch('/cart/clear.js', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        })
            .then(function (response) {
                return response.json();
            })
            .then(function (data) {
                console.log('Cart cleared:', data);
                // Optionally, refresh the page or redirect the user
                window.location.reload();
            });
    }

    // Event listener for page load
    document.addEventListener('DOMContentLoaded', function () {
        // Only initialize timer if there are items in the cart
        fetch('/cart.js')
            .then(function (response) {
                return response.json();
            })
            .then(function (cart) {
                if (cart.item_count > 0) {
                    initializeTimer();
                } else {
                    // Clear the expiration time if the cart is empty
                    localStorage.removeItem('cartExpiration');
                }
            });
    });

    // TODO: Check how this is done if there is no custom AJAX event
    // Listen for cart update events (e.g., adding or removing items)
    document.addEventListener('cart:updated', function () {
        // Reset the expiration time
        localStorage.removeItem('cartExpiration');
        initializeTimer();
    });
})();

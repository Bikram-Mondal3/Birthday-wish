// Check if service workers are supported
if ('serviceWorker' in navigator && 'Notification' in window) {
    window.addEventListener('load', () => {
        // Register service worker
        navigator.serviceWorker.register('service-worker.js')
            .then((registration) => {
                console.log('Service Worker registered with scope:', registration.scope);

                // Request notification permission
                Notification.requestPermission().then(permission => {
                    if (permission === 'granted') {
                        console.log('Notification permission granted.');
                        scheduleBirthdayNotification();

                        // Set up periodic checks
                        if ('periodicSync' in registration) {
                            registration.periodicSync.register('birthday-check', {
                                minInterval: 24 * 60 * 60 * 1000 // Once a day
                            }).catch(error => {
                                console.error('Periodic Sync could not be registered:', error);
                            });
                        } else {
                            // Fall back to background sync when possible
                            setupBackgroundCheck();
                        }
                    } else {
                        console.log('Notification permission denied.');
                    }
                });
            })
            .catch(err => {
                console.error('Service Worker registration failed:', err);
            });
    });
}

// Set up background check using sync or intervals
function setupBackgroundCheck() {
    // Try to use Background Sync API
    if ('SyncManager' in window) {
        navigator.serviceWorker.ready
            .then(registration => {
                registration.sync.register('birthday-notification-sync')
                    .then(() => {
                        console.log('Background sync registered');
                    })
                    .catch(err => {
                        console.error('Background sync registration failed:', err);
                        setupFallbackCheck();
                    });
            });
    } else {
        // Fall back to other methods
        setupFallbackCheck();
    }
}

// Fallback method for checking if it's the birthday
function setupFallbackCheck() {
    // Store last check time in localStorage
    const lastCheck = localStorage.getItem('lastBirthdayCheck');
    const now = new Date().getTime();

    if (!lastCheck || (now - parseInt(lastCheck)) > (12 * 60 * 60 * 1000)) { // Check twice a day
        checkIfBirthday();
        localStorage.setItem('lastBirthdayCheck', now.toString());
    }

    // Set up interval for when tab is open
    setInterval(() => {
        const now = new Date().getTime();
        const lastCheck = localStorage.getItem('lastBirthdayCheck');

        if (!lastCheck || (now - parseInt(lastCheck)) > (12 * 60 * 60 * 1000)) {
            checkIfBirthday();
            localStorage.setItem('lastBirthdayCheck', now.toString());
        }
    }, 1 * 60 * 60 * 1000); // Check every hour when tab is open
}

// Check if today is the birthday
function checkIfBirthday() {
    const today = new Date();
    const day = today.getDate();
    const month = today.getMonth(); // 0-based (0-11)

    // Check for May 12th (month 4, day 12)
    if (day === 12 && month === 4) {
        showBirthdayNotification();
    }
}

// Show birthday notification
function showBirthdayNotification() {
    if (navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
            type: 'SHOW_BIRTHDAY_NOTIFICATION',
            title: 'Happy Birthday Bristi! 🎂',
            body: 'Wishing you a day filled with joy and beautiful memories! ❤️',
            url: window.location.href
        });
    } else if ('Notification' in window && Notification.permission === 'granted') {
        // Fallback to regular notification if service worker is not controlling the page
        new Notification('Happy Birthday Bristi! 🎂', {
            body: 'Wishing you a day filled with joy and beautiful memories! ❤️',
            icon: 'favicon.ico'
        });
    }
}

// Schedule birthday notification
function scheduleBirthdayNotification() {
    const birthdayDate = new Date(2006, 4, 12); // May 12, 2006 (month is 0-indexed)
    const currentDate = new Date();

    // Check if we should show notification now (simulate specific date for testing)
    // To test - uncomment the following line and replace with today's date
    // currentDate = new Date(2006, 4, 12);

    const isBirthday = currentDate.getDate() === 12 && currentDate.getMonth() === 4;

    if (isBirthday) {
        showBirthdayNotification();

        // Save to localStorage that we showed notification today
        localStorage.setItem('lastBirthdayNotification', currentDate.getTime().toString());
    }

    // Set up for next check
    setupBackgroundCheck();
}

// Function to get specific date (May 12, 2006) in user's local timezone
function getBirthdayDate() {
    // Create date object for May 12, 2006
    return new Date(2006, 4, 12); // May is 4 (zero-indexed)
}
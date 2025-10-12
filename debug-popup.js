// Debug script for newsletter popup
// Run this in browser console on http://localhost:3001

console.log('🔍 Starting newsletter popup debug...');

// Check if functions exist
console.log('showNewsletterModal:', typeof window.showNewsletterModal);
console.log('testNewsletterModal:', typeof window.testNewsletterModal);
console.log('closeNewsletterModal:', typeof window.closeNewsletterModal);
console.log('handleNewsletterSubmit:', typeof window.handleNewsletterSubmit);

// Test API
async function testNewsletterAPI() {
    try {
        const response = await fetch('/api/newsletter/test');
        const data = await response.json();
        console.log('✅ Newsletter API test:', data);
    } catch (error) {
        console.error('❌ Newsletter API error:', error);
    }
}

// Test popup creation
function testPopupCreation() {
    console.log('🧪 Testing popup creation...');
    
    if (typeof window.showNewsletterModal === 'function') {
        console.log('✅ showNewsletterModal function exists');
        try {
            window.showNewsletterModal();
            console.log('✅ Popup created successfully');
        } catch (error) {
            console.error('❌ Error creating popup:', error);
        }
    } else {
        console.error('❌ showNewsletterModal function not found');
    }
}

// Check tab switching
function testTabSwitching() {
    console.log('🧪 Testing tab switching...');
    
    const eventsTab = document.querySelector('.nav-tab[data-tab="events"]');
    if (eventsTab) {
        console.log('✅ Events tab found');
        eventsTab.click();
        console.log('✅ Events tab clicked');
        
        // Check if timer is set
        setTimeout(() => {
            console.log('⏰ 5 seconds after clicking events tab');
        }, 5000);
        
        setTimeout(() => {
            console.log('⏰ 10 seconds after clicking events tab - popup should appear now');
        }, 10000);
    } else {
        console.error('❌ Events tab not found');
    }
}

// Run all tests
async function runAllTests() {
    console.log('🚀 Running all newsletter popup tests...');
    
    await testNewsletterAPI();
    testPopupCreation();
    testTabSwitching();
    
    console.log('✅ All tests completed. Check results above.');
}

// Auto run tests
runAllTests();

console.log('📋 Manual test commands:');
console.log('- testNewsletterAPI()');
console.log('- testPopupCreation()');
console.log('- testTabSwitching()');
console.log('- runAllTests()');

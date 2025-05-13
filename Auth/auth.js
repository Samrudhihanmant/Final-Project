// Common functions
function showError(elementId, message) {
    const element = document.getElementById(elementId);
    element.textContent = message;
    element.style.display = 'block';
  }
  
  function hideError(elementId) {
    document.getElementById(elementId).style.display = 'none';
  }
  
  // Sign up function
  function signUp() {
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    const confirmPassword = document.getElementById('signup-confirm-password').value;
    const username = document.getElementById('signup-username').value;
  
    // Reset errors
    hideError('signup-error');
    hideError('signup-email-error');
    hideError('signup-password-error');
    hideError('signup-confirm-error');
  
    // Validation
    if (!email) {
      showError('signup-email-error', 'Email is required');
      return;
    }
  
    if (!password) {
      showError('signup-password-error', 'Password is required');
      return;
    }
  
    if (password.length < 6) {
      showError('signup-password-error', 'Password must be at least 6 characters');
      return;
    }
  
    if (password !== confirmPassword) {
      showError('signup-confirm-error', 'Passwords do not match');
      return;
    }
  
    // Create user with Firebase Auth
    auth.createUserWithEmailAndPassword(email, password)
      .then((userCredential) => {
        // Signed up successfully
        const user = userCredential.user;
        
        // Optional: Save additional user data to Firestore
        return db.collection('users').doc(user.uid).set({
          username: username,
          email: email,
          createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
      })
      .then(() => {
        // Redirect to dashboard
        window.location.href = 'dashboard.html';
      })
      .catch((error) => {
        showError('signup-error', error.message);
      });
  }
  
  // Login function
  function login() {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
  
    // Reset errors
    hideError('login-error');
    hideError('login-email-error');
    hideError('login-password-error');
  
    // Validation
    if (!email) {
      showError('login-email-error', 'Email is required');
      return;
    }
  
    if (!password) {
      showError('login-password-error', 'Password is required');
      return;
    }
  
    // Sign in with Firebase Auth
    auth.signInWithEmailAndPassword(email, password)
      .then(() => {
        // Redirect to dashboard
        window.location.href = 'dashboard.html';
      })
      .catch((error) => {
        showError('login-error', error.message);
      });
  }
  
  // Check auth state
  function checkAuthState() {
    auth.onAuthStateChanged((user) => {
      if (user) {
        // User is signed in
        if (window.location.pathname.includes('login.html') || 
            window.location.pathname.includes('signup.html')) {
          window.location.href = 'dashboard.html';
        }
      } else {
        // User is signed out
        if (window.location.pathname.includes('dashboard.html')) {
          window.location.href = 'login.html';
        }
      }
    });
  }
  
  // Logout function
  function logout() {
    auth.signOut()
      .then(() => {
        window.location.href = 'login.html';
      })
      .catch((error) => {
        console.error('Logout error:', error);
      });
  }
  
  // Initialize auth check when page loads
  document.addEventListener('DOMContentLoaded', checkAuthState);
// loadingHelper.js
// Global loading indicator helper functions

function showLoading(message = "Loading... Please Check Your Internet Connection") {
  const overlay = document.getElementById("loadingOverlay");
  const loadingText = overlay?.querySelector(".loading-text");
  
  if (overlay) {
    if (loadingText) {
      loadingText.textContent = message;
    }
    overlay.classList.remove("d-none");
  }
  
  // Disable all buttons to prevent multiple clicks
  document.querySelectorAll("button").forEach(btn => {
    btn.dataset.originalDisabled = btn.disabled;
    btn.disabled = true;
  });
}

function hideLoading() {
  const overlay = document.getElementById("loadingOverlay");
  if (overlay) {
    overlay.classList.add("d-none");
  }
  
  // Re-enable buttons that weren't originally disabled
  document.querySelectorAll("button").forEach(btn => {
    if (btn.dataset.originalDisabled !== "true") {
      btn.disabled = false;
    }
    delete btn.dataset.originalDisabled;
  });
}
const openLoginWindow = (event) => {
  event.preventDefault(); // Prevent form submission issues

  if (!baseUrl) {
    alert("Please enter the Base URL first.");
    return;
  }

  const loginUrl = `${baseUrl}/service/initiateLogin`;

  // Open a new window directly inside the event handler
  const newWindow = window.open(loginUrl, '_blank', 'width=600,height=600');

  if (!newWindow) {
    alert("Popup blocked! Please allow popups and try again.");
    return;
  }

  setLoginWindow(newWindow);

  // Polling to check login completion
  const interval = setInterval(() => {
    try {
      if (!newWindow || newWindow.closed) {
        clearInterval(interval);
        console.log("Login window closed");
        return;
      }

      if (newWindow.location.href.includes("ticket=")) {
        const urlParams = new URLSearchParams(newWindow.location.search);
        const ticket = urlParams.get("ticket");

        if (ticket) {
          console.log("Extracted ticket:", ticket);
          view.submit({ ticket });
          newWindow.close();
          clearInterval(interval);
        }
      }
    } catch (error) {
      // Expected cross-origin errors
    }
  }, 1000);
};

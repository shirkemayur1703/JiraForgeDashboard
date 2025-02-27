import React, { useEffect, useState } from 'react';
import { view } from '@forge/bridge';

function decodeHtmlEntities(text) {
  const parser = new DOMParser();
  return parser.parseFromString(text, "text/html").body.textContent;
}

function View() {
  const [context, setContext] = useState();
  const [generatedUrl, setGeneratedUrl] = useState('');
  const [baseUrl, setBaseUrl] = useState('');

  useEffect(() => {
    view.getContext().then((ctx) => {
      setContext(ctx);
      const rawUrl = ctx.extension.gadgetConfiguration?.generatedUrl || '';
      const decodedUrl = decodeHtmlEntities(rawUrl);
      setGeneratedUrl(decodedUrl);
      setBaseUrl(decodedUrl.split('?')[0]); // Extract base URL
      checkForAuthentication(decodedUrl.split('?')[0]);
    });
  }, []);

  function checkForAuthentication(baseUrl) {
    if (!baseUrl) return;

    let tokenData = sessionStorage.getItem("oAuthTokenData");
    if (tokenData) {
      tokenData = JSON.parse(tokenData);
      if (tokenData[baseUrl]) {
        console.log("Token exists for baseUrl:", baseUrl);
        return;
      }
    }
    console.log("No token found, initiating login...");
    initiateLogin(baseUrl);
  }

  function initiateLogin(baseUrl) {
    if (!baseUrl) return;
    
    window.addEventListener("message", receiveMessage, false);
    
    const form = document.createElement("form");
    form.method = "POST";
    form.action = `${baseUrl}/services/initiateLogin`;
    form.target = "_blank";
    
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = "loginCompleteURL";
    input.value = `Integration/validate_complete.jsp?SPURL=${encodeURIComponent(window.location.href)}`;
    form.appendChild(input);
    
    document.body.appendChild(form);
    form.submit();
  }

  function receiveMessage(event) {
    if (!baseUrl || !event.data) return;

    if (event.data === "MULTIPLE_USERS" || event.data === "9097") {
      console.error("Multiple users detected. Log out and try again.");
      window.removeEventListener("message", receiveMessage);
      return;
    }

    const token = event.data;
    if (token) {
      let tokenData = sessionStorage.getItem("oAuthTokenData") ? JSON.parse(sessionStorage.getItem("oAuthTokenData")) : {};
      tokenData[baseUrl] = token;
      sessionStorage.setItem("oAuthTokenData", JSON.stringify(tokenData));
      console.log("Token stored successfully:", token);
      window.removeEventListener("message", receiveMessage);
    }
  }

  if (!context) {
    return 'Loading...';
  }

  return (
    <div>
      {generatedUrl ? (
        <iframe 
          src={generatedUrl} 
          width="100%" 
          height="500px" 
          title="Generated View"
          key={generatedUrl} 
        ></iframe>
      ) : (
        'No URL generated yet.'
      )}
    </div>
  );
}

export default View;
function initiateLogin(baseUrl) {
    if (!baseUrl) return;

    window.addEventListener("message", receiveMessage, false);

    const loginUrl = `${baseUrl}/services/initiateLogin`;
    const loginCompleteURL = `Integration/validate_complete.jsp?SPURL=${encodeURIComponent(window.location.href)}`;

    // Open the login URL in a new tab with the necessary parameters
    const fullUrl = `${loginUrl}?loginCompleteURL=${encodeURIComponent(loginCompleteURL)}`;
    
    window.open(fullUrl, "_blank"); // ✅ Opens login page in a new tab
}

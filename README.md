import React from 'react';
import Form, { Field } from '@atlaskit/form';
import TextField from '@atlaskit/textfield';
import Button, { ButtonGroup } from '@atlaskit/button';
import { view } from '@forge/bridge';

function Edit() {
  const onSubmit = (formData) => {
    const { baseUrl } = formData;
    if (!baseUrl) return;

    // Construct the login URL
    const generatedUrl = `${baseUrl}/services/initiateLogin`;

    // Pass the generated URL back to the View component
    view.submit({ generatedUrl });
    console.log("Generated URL:", generatedUrl);
  };

  return (
    <Form onSubmit={onSubmit}>
      {({ formProps, submitting }) => (
        <form {...formProps}>
          <Field name="baseUrl" label="Base URL" isRequired>
            {({ fieldProps }) => <TextField {...fieldProps} />}
          </Field>
          <br />
          <ButtonGroup>
            <Button type="submit" isDisabled={submitting}>Load Login Page</Button>
            <Button appearance="subtle" onClick={view.close}>Cancel</Button>
          </ButtonGroup>
        </form>
      )}
    </Form>
  );
}

export default Edit;


import React, { useEffect, useState } from 'react';
import { view } from '@forge/bridge';

function View() {
  const [context, setContext] = useState();
  const [generatedUrl, setGeneratedUrl] = useState('');
  const [authTicket, setAuthTicket] = useState('');

  useEffect(() => {
    view.getContext().then((ctx) => {
      setContext(ctx);
      const rawUrl = ctx.extension.gadgetConfiguration?.generatedUrl || '';
      setGeneratedUrl(rawUrl);
      console.log("Generated URL:", rawUrl);
    });

    // Listen for messages from the iframe
    const handleMessage = (event) => {
      if (!event.origin.includes('your-eQube-domain.com')) return; // Replace with actual domain

      console.log("Received postMessage:", event.data);

      if (event.data?.ticket) {
        setAuthTicket(event.data.ticket);
        console.log("Auth Ticket Received:", event.data.ticket);
      }
    };

    window.addEventListener('message', handleMessage);

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  if (!context) {
    return 'Loading...';
  }

  return (
    <div>
      {generatedUrl ? (
        <>
          <iframe 
            src={generatedUrl} 
            width="100%" 
            height="500px" 
            title="Login Page"
            key={generatedUrl} 
          ></iframe>
          {authTicket && <p>Auth Ticket: {authTicket}</p>}
        </>
      ) : (
        'No URL generated yet.'
      )}
    </div>
  );
}

export default View;


const fetchData = async () => {
  if (!authTicket) return;

  try {
    const response = await fetch('your-api-endpoint', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authTicket}`
      }
    });

    const data = await response.json();
    console.log("API Response:", data);
  } catch (error) {
    console.error("API Error:", error);
  }
};

useEffect(() => {
  fetchData();
}, [authTicket]); // Fetch data when authTicket is received

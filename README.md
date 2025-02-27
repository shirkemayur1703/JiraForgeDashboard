import React from 'react';
import Form, { Field } from '@atlaskit/form';
import TextField from '@atlaskit/textfield';
import Select from '@atlaskit/select';
import Button, { ButtonGroup } from '@atlaskit/button';
import { view } from '@forge/bridge';

function Edit() {
  const onSubmit = (formData) => {
    const { baseUrl, title, action } = formData;

    if (action?.value === 'login') {
      const loginUrl = `${baseUrl}/service/initiateLogin`;
      const loginWindow = window.open(loginUrl, '_blank');

      if (!loginWindow) {
        alert("Popup blocked! Please allow popups and try again.");
        return;
      }

      // Polling to check for URL change in the login tab
      const interval = setInterval(() => {
        try {
          if (!loginWindow || loginWindow.closed) {
            clearInterval(interval);
            console.log("Login window closed");
            return;
          }

          // Check if login tab redirects to a known URL format containing a ticket
          if (loginWindow.location.href.includes("ticket=")) {
            const urlParams = new URLSearchParams(loginWindow.location.search);
            const ticket = urlParams.get("ticket");

            if (ticket) {
              console.log("Extracted ticket:", ticket);
              view.submit({ ticket });
              loginWindow.close();
              clearInterval(interval);
            }
          }
        } catch (error) {
          // Expected cross-origin errors when accessing another domain
        }
      }, 1000); // Check every second

      return;
    }

    let generatedUrl = `${baseUrl}`;
    const params = new URLSearchParams();
    if (title) params.append('title', title);
    if (action) params.append('action', action.value);

    if (params.toString()) {
      generatedUrl += `?${params.toString()}`;
    }

    view.submit({ generatedUrl });
    console.log(generatedUrl);
  };

  return (
    <Form onSubmit={onSubmit}>
      {({ formProps, submitting }) => (
        <form {...formProps}>
          <Field name="baseUrl" label="Base URL" isRequired>
            {({ fieldProps }) => <TextField {...fieldProps} />}
          </Field>
          <Field name="title" label="Title">
            {({ fieldProps }) => <TextField {...fieldProps} />}
          </Field>
          <Field name="action" label="Action">
            {({ fieldProps }) => (
              <Select
                {...fieldProps}
                options={[
                  { label: 'History', value: 'history' },
                  { label: 'Future', value: 'future' },
                  { label: 'Login', value: 'login' } // New option for login
                ]}
                isClearable
              />
            )}
          </Field>
          <br/>
          <ButtonGroup>
            <Button type="submit" isDisabled={submitting}>Load the URL</Button>
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
  const [authTicket, setAuthTicket] = useState(null);

  useEffect(() => {
    view.getContext().then((ctx) => {
      setContext(ctx);
      const rawUrl = ctx.extension.gadgetConfiguration?.generatedUrl || '';
      setGeneratedUrl(decodeURIComponent(rawUrl));

      if (ctx.extension.gadgetConfiguration?.ticket) {
        setAuthTicket(ctx.extension.gadgetConfiguration.ticket);
      }
    });
  }, []);

  if (!context) {
    return 'Loading...';
  }

  return (
    <div>
      {authTicket ? <p>Authenticated with Ticket: {authTicket}</p> : null}
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

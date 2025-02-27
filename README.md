import React, { useState } from 'react';
import Form, { Field } from '@atlaskit/form';
import TextField from '@atlaskit/textfield';
import Select from '@atlaskit/select';
import Button, { ButtonGroup } from '@atlaskit/button';
import { view } from '@forge/bridge';

function Edit() {
  const [baseUrl, setBaseUrl] = useState('');
  const [loginWindow, setLoginWindow] = useState(null);

  const openLoginWindow = () => {
    if (!baseUrl) {
      alert("Please enter the Base URL first.");
      return;
    }

    const loginUrl = `${baseUrl}/service/initiateLogin`;
    const newWindow = window.open(loginUrl, '_blank');

    if (!newWindow) {
      alert("Popup blocked! Please allow popups and try again.");
      return;
    }

    setLoginWindow(newWindow);

    // Polling to check when login is completed
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
        // Expected cross-origin errors when accessing another domain
      }
    }, 1000);
  };

  const onSubmit = (formData) => {
    setBaseUrl(formData.baseUrl); // Store baseUrl for login use

    let generatedUrl = `${formData.baseUrl}`;
    const params = new URLSearchParams();
    if (formData.title) params.append('title', formData.title);
    if (formData.action) params.append('action', formData.action.value);

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
            {({ fieldProps }) => <TextField {...fieldProps} onChange={(e) => setBaseUrl(e.target.value)} />}
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
                  { label: 'Future', value: 'future' }
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
          <br/>
          <Button onClick={openLoginWindow} appearance="primary">Login</Button>
        </form>
      )}
    </Form>
  );
}

export default Edit;

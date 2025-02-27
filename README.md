import React, { useState } from 'react';
import Form, { Field } from '@atlaskit/form';
import TextField from '@atlaskit/textfield';
import Button, { ButtonGroup } from '@atlaskit/button';
import { router, view } from '@forge/bridge';

function Edit() {
  const [baseUrl, setBaseUrl] = useState('');

  const openLoginWindow = () => {
    if (!baseUrl) {
      alert("Please enter the Base URL first.");
      return;
    }

    const loginUrl = `${baseUrl}/service/initiateLogin`;
    router.open(loginUrl); // Opens the login page in a new tab
  };

  const onSubmit = (formData) => {
    setBaseUrl(formData.baseUrl); // Store baseUrl for login use

    let generatedUrl = `${formData.baseUrl}`;
    const params = new URLSearchParams();
    if (formData.title) params.append('title', formData.title);

    if (params.toString()) {
      generatedUrl += `?${params.toString()}`;
    }

    view.submit({ generatedUrl });
  };

  return (
    <Form onSubmit={onSubmit}>
      {({ formProps, submitting }) => (
        <form {...formProps}>
          <Field name="baseUrl" label="Base URL" isRequired>
            {({ fieldProps }) => (
              <TextField {...fieldProps} onChange={(e) => setBaseUrl(e.target.value)} />
            )}
          </Field>
          <br />
          <ButtonGroup>
            <Button type="submit" isDisabled={submitting}>Load the URL</Button>
            <Button appearance="subtle" onClick={view.close}>Cancel</Button>
          </ButtonGroup>
          <br />
          <Button onClick={openLoginWindow} appearance="primary">Login</Button>
        </form>
      )}
    </Form>
  );
}

export default Edit;

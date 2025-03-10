import React from 'react';
import Form, { Field } from '@atlaskit/form';
import TextField from '@atlaskit/textfield';
import Select from '@atlaskit/select';
import Button, { ButtonGroup } from '@atlaskit/button';
import { view } from '@forge/bridge';

function Edit() {
  const onSubmit = (formData) => {
    const { baseUrl, title, action } = formData;
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
                options={[{ label: 'History', value: 'history' }, { label: 'Future', value: 'future' }]}
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

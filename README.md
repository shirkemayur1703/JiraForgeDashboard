import React, { useEffect, useState } from 'react';
import Form, { Field } from '@atlaskit/form';
import TextField from '@atlaskit/textfield';
import Button from '@atlaskit/button';
import { view } from '@forge/bridge';

function Edit() {
  const [generatedUrl, setGeneratedUrl] = useState('');
  const [authToken, setAuthToken] = useState('');
  const [reports, setReports] = useState([]);

  useEffect(() => {
    const handleMessage = (event) => {
      if (!event.origin.includes('your-eQube-domain.com')) return; // Replace with actual domain

      try {
        const parsedData = JSON.parse(event.data);
        if (parsedData?.data?.oAuthToken) {
          setAuthToken(parsedData.data.oAuthToken);
          console.log("OAuth Token Received:", parsedData.data.oAuthToken);
        }
      } catch (error) {
        console.error("Error parsing event.data:", error);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // Fetch reports after login
  useEffect(() => {
    if (!authToken || !generatedUrl) return;

    const baseUrl = new URL(generatedUrl).origin;

    const fetchReports = async () => {
      try {
        const response = await fetch(`${baseUrl}/webpart/reportConfig`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Requested-With": "XMLHttpRequest",
            "ticket": authToken,
          },
          credentials: "include",
          body: JSON.stringify({ searchType: "Report", type: "SearchCriteriaWidget" }),
        });

        const data = await response.json();
        console.log("Report List:", data.reportList);
        setReports(data.reportList || []);
      } catch (error) {
        console.error("Error fetching reports:", error);
      }
    };

    fetchReports();
  }, [authToken, generatedUrl]);

  const onSubmit = (formData) => {
    const { baseUrl } = formData;
    if (!baseUrl) return;
    setGeneratedUrl(`${baseUrl}/services/initiateLogin`);
  };

  return (
    <Form onSubmit={onSubmit}>
      {({ formProps, submitting }) => (
        <form {...formProps}>
          {!authToken ? (
            <>
              <Field name="baseUrl" label="Base URL" isRequired>
                {({ fieldProps }) => <TextField {...fieldProps} />}
              </Field>
              <Button type="submit" isDisabled={submitting}>Load Login</Button>
              {generatedUrl && (
                <iframe 
                  src={generatedUrl} 
                  width="100%" 
                  height="500px" 
                  title="Login Page"
                ></iframe>
              )}
            </>
          ) : (
            <>
              <p>Login Successful!</p>
              {reports.length > 0 ? (
                <Field name="report" label="Select Report">
                  {({ fieldProps }) => (
                    <select {...fieldProps}>
                      {reports.map((report, index) => (
                        <option key={index} value={report.id || report.name}>
                          {report.name}
                        </option>
                      ))}
                    </select>
                  )}
                </Field>
              ) : (
                <p>No reports available.</p>
              )}
            </>
          )}
        </form>
      )}
    </Form>
  );
}

export default Edit;

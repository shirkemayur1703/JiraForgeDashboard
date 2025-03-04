import React, { useEffect, useState } from 'react';
import { view } from '@forge/bridge';

function decodeHtmlEntities(text) {
  const parser = new DOMParser();
  return parser.parseFromString(text, "text/html").body.textContent;
}

function View() {
  const [context, setContext] = useState();
  const [generatedUrl, setGeneratedUrl] = useState('');

  useEffect(() => {
    view.getContext().then((ctx) => {
      setContext(ctx);
      const rawUrl = ctx.extension.gadgetConfiguration?.generatedUrl || '';
      const decodedUrl = decodeHtmlEntities(rawUrl);
      setGeneratedUrl(decodedUrl);
      console.log("Generated URL for iframe:", decodedUrl);
    });
  }, []);

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
          title="Report View"
          key={generatedUrl} 
        ></iframe>
      ) : (
        'No URL generated yet.'
      )}
    </div>
  );
}

export default View;


import React, { useEffect, useState } from 'react';
import Form, { Field } from '@atlaskit/form';
import TextField from '@atlaskit/textfield';
import Button from '@atlaskit/button';
import Select from '@atlaskit/select';
import { view } from '@forge/bridge';

function Edit() {
  const [generatedUrl, setGeneratedUrl] = useState('');
  const [authToken, setAuthToken] = useState('');
  const [reports, setReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [reportUrl, setReportUrl] = useState('');

  useEffect(() => {
    const handleMessage = (event) => {
      console.log("Message received:", event);
      if (!event.origin.includes('your-eQube-domain.com')) return; // Replace with actual domain

      try {
        const parsedData = JSON.parse(event.data);
        console.log("Parsed data:", parsedData);

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

  const generateReportURL = () => {
    if (!selectedReport) {
      alert("Please select a report first.");
      return;
    }

    const baseUrl = new URL(generatedUrl).origin;
    const reportID = selectedReport.value;
    const reportType = selectedReport.type || "default";

    const url = `${baseUrl}/integration?reportId=${reportID}&reportType=${reportType}&applicationType=webparts&showLoginInPopUp=true`;
    setReportUrl(url);

    // Send URL to View.js
    view.submit({ generatedUrl: url });
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
              <Field name="report" label="Select Report">
                {({ fieldProps }) => (
                  <Select
                    {...fieldProps}
                    options={reports.map((report) => ({
                      label: report.name,
                      value: report.id || report.name,
                      type: report.type || "default"
                    }))}
                    isClearable
                    onChange={(selected) => setSelectedReport(selected)}
                  />
                )}
              </Field>
              <Button onClick={generateReportURL} appearance="primary">Generate Report URL</Button>
              {reportUrl && (
                <p>
                  <strong>Generated Report URL:</strong> 
                  <br />
                  <a href={reportUrl} target="_blank" rel="noopener noreferrer">{reportUrl}</a>
                </p>
              )}
            </>
          )}
        </form>
      )}
    </Form>
  );
}

export default Edit;

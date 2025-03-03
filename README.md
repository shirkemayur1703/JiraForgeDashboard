const reportUnsecure = async (oAuthToken, baseUrl) => {
  try {
    const response = await fetch(`${baseUrl}/webpart/reportConfig`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Requested-With": "XMLHttpRequest",
        "ticket": oAuthToken,
      },
      credentials: "include",
      body: JSON.stringify({
        SubscriptionType: "",
        alerts: "",
        categories: [],
        connection: "",
        creationDateType: "Day",
        cubeName: "",
        date1: "",
        date2: "",
        dateFormat: "",
        dimensionName: "",
        id: "SearchCriteriaWidget",
        lastNDays: "",
        layout: {},
        measureName: "",
        name: "",
        owner: "",
        pages: "",
        reportType: [],
        searchType: "Report",
        type: "SearchCriteriaWidget",
      }),
    });

    const data = await response.json();
    console.log("Response Data:", data); // Just prints the response data
  } catch (error) {
    console.error("Error in fetching reports:", error);
  }
};
useEffect(() => {
  if (!authToken || !generatedUrl) return;

  const baseUrl = new URL(generatedUrl).origin;
  reportUnsecure(authToken, baseUrl);
}, [authToken, generatedUrl]);

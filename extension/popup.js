document.getElementById("extract-btn").addEventListener("click", async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: extractJobInfo,
  }, ([result]) => {
    document.getElementById("output").textContent = JSON.stringify(result.result, null, 2);
  });
});

function extractJobInfo() {
  const getText = (selector) => {
    const el = document.querySelector(selector);
    return el ? el.innerText.trim() : "";
  };

  const jobData = {
    title: getText('[id^="jd-job-title-"]'),
    company: getText('[class^="EmployerProfile_employerNameHeading"]'),
    location: getText('[data-test="location"]'),
    salary: getText('[class^="SalaryEstimate_salaryRange"]'),
    description: getText('[class^="JobDetails_jobDescription"]')
  };

  return jobData;
}




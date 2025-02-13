import React, { useState } from 'react';

const GenerateReport = () => {
  const [reportData, setReportData] = useState<string | null>(null);

  const handleGenerateReport = () => {
    // Example logic for generating a report
    const sampleReport = `
      Report Generated on ${new Date().toLocaleString()}
      ==================================
      - Total Attendance Sessions: 10
      - Average Attendance: 85%
      - Students with Perfect Attendance: 5
    `;
    setReportData(sampleReport);
  };

  return (
    <div>
      <p>Generate detailed attendance reports for analysis and record-keeping.</p>
      <button onClick={handleGenerateReport}>Generate Report</button>

      {reportData && (
        <div className="report-output">
          <h5>Report:</h5>
          <pre>{reportData}</pre>
        </div>
      )}
    </div>
  );
};

export default GenerateReport;

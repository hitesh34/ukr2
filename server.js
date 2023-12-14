const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const puppeteer = require('puppeteer');
const app = express();
const cors = require('cors'); // Added for CORS support


app.use(bodyParser.urlencoded({ extended: true }));

const transporter = nodemailer.createTransport({
  service: 'npro9.fcomet.com',
  auth: {
    user: 'admin@cloud.uk-residency.com',
    pass: 'UKRclient@2023!',
  },
});

async function sendEmailWithPDF(pdfBuffer, subject, email) {
  try {
    const info = await transporter.sendMail({
      from: 'admin@cloud.uk-residency.com',
      to: email,
      subject: subject,
      text: 'Please find the attached PDF that includes your work expansion family visa cost estimate.',
      attachments: [
        {
          filename: 'VisaEstimation.pdf',
          content: pdfBuffer,
          encoding: 'base64',
        },
      ],
    });

    console.log('Email sent:', info.response);
  } catch (error) {
    console.error('Error sending email:', error);
  }
}

async function generatePDF(htmlContent) {
  const browser = await puppeteer.launch({
    headless: true,
  });
  const page = await browser.newPage();

  const fullHTML = `
    <html>
      <head>
        <title>Estimation Report</title>
        <style>
          body {
            font-family: Arial, sans-serif;
          }
        </style>
      </head>
      <body>
        ${htmlContent}
      </body>
    </html>
  `;

  await page.setContent(fullHTML);
  const pdfBuffer = await page.pdf();

  await browser.close();

  return pdfBuffer;
}
function calculateVisaCost(includeSpouse, numberOfChildren, isExpedited, legalFees, companyLicenseFee, registeredAdviceFees, accountsFee) {
  const applicationFee = 259;
  const healthcareSurcharge = 624;
  const spouseApplicationFee = 285;
  const spouseHealthcareSurcharge = 624;
  const childApplicationFee = 315;
  const additionalChildFee = 200;
  const childHealthcareSurcharge = 624;
  const mainApplicantHealthcareSurcharge = 624;
  const sponsorLicenseApplicantFee = 536.00; // New fee

  const expediteSponsorFeeAmount = isExpedited ? 500 : 0;

  const parsedLegalFees = parseFloat(legalFees) || 0;
  const parsedCompanyLicenseFee = parseFloat(companyLicenseFee) || 0;
  const parsedRegisteredAdviceFees = parseFloat(registeredAdviceFees) || 0;
  const parsedAccountsFee = parseFloat(accountsFee) || 0;

  const spouseCost = includeSpouse === 'Yes' ? spouseApplicationFee + spouseHealthcareSurcharge : 0;
  const childCost = numberOfChildren > 0 ? childApplicationFee + (numberOfChildren - 1) * additionalChildFee : 0;

  const dependentsHealthcareSurcharge = (includeSpouse === 'Yes' ? spouseHealthcareSurcharge : 0) + (numberOfChildren > 0 ? numberOfChildren * childHealthcareSurcharge : 0);
  const expediteSponsorFee = isExpedited ? expediteSponsorFeeAmount : 0;

  const totalCost =
    applicationFee +
    sponsorLicenseApplicantFee +
    dependentsHealthcareSurcharge +
    spouseCost +
    childCost +
    expediteSponsorFee +
    parsedLegalFees +
    parsedCompanyLicenseFee +
    parsedRegisteredAdviceFees +
    parsedAccountsFee;

  return {
    applicationFee,
    healthcareSurcharge: dependentsHealthcareSurcharge,
    spouseCost,
    childCost,
    spouseApplicationFee,
    spouseHealthcareSurcharge,
    childApplicationFee,
    childHealthcareSurcharge,
    mainApplicantHealthcareSurcharge,
    expediteSponsorFee,
    legalFees: parsedLegalFees.toFixed(2),
    sponsorLicenseApplicantFee: sponsorLicenseApplicantFee.toFixed(2),
    companyLicenseFee: parsedCompanyLicenseFee.toFixed(2),
    registeredAdviceFees: parsedRegisteredAdviceFees.toFixed(2),
    accountsFee: parsedAccountsFee.toFixed(2),
    totalCost: totalCost.toFixed(2),
  };
}




function generateVisaHTML(includeSpouse, numberOfChildren, expediteSponsorFee, legalFees, isExpedited, companyLicenseFee, registeredAdviceFees, accountsFee) {
  const visaCostDetails = calculateVisaCost(
    includeSpouse,
    numberOfChildren,
    isExpedited,
    legalFees,
    companyLicenseFee,
    registeredAdviceFees,
    accountsFee
  );
  const totalCost = parseFloat(visaCostDetails.totalCost);
  const currentDate = new Date();
  const formattedDate = `${currentDate.getDate()}th ${getMonthName(currentDate.getMonth())} ${currentDate.getFullYear()}`;
  const updatedHTMLContent = `
  <div style="text-align: center;">
    <img src="https://ukrgroup.com/wp-content/uploads/2021/10/UKR-Group-Logo-01-1.png" alt="UKR Logo" style="max-width: 200px; margin-top: 20px;">
    <h1 style="color: #c50404;">UK Worker Expansion Estimate</h1>
    <p>Number of Applicants(${1 + numberOfChildren + (includeSpouse === 'Yes' ? 1 : 0)})</p>
    <p>${1} Main${includeSpouse === 'Yes' ? ', 1 Spouse' : ''}${numberOfChildren > 0 ? `, ${numberOfChildren} Children` : ''}</p>
    <p style="font-weight: bold;">Prepared on: ${formattedDate}</p>
    <div class="results-container" style="border: 1px solid #ccc; padding: 15px; border-radius: 10px; display: inline-block; background-color: #f9f9f9;">
      <h3 style="font-weight: bold; text-decoration: underline;">UK EXPANSION QUOTATION</h3>
      <table class="result-table" style="width: 100%; border-collapse: collapse; margin-top: 10px; border: 1px solid #ddd;">
        <thead>
          <tr style="background-color: #4CAF50; color: black; border: 1px solid #ddd;">
            <th style="padding: 10px; border: 1px solid #ddd;"><strong>Description</strong></th>
            <th style="padding: 10px; border: 1px solid #ddd;"><strong>Amount (£)</strong></th>
          </tr>
        </thead>
        <tbody>
        <tr>
        <td colspan="2" style="padding: 10px; text-align: center; border: 1px solid #ddd; font-weight: bold;">Legal Fees</td>
      </tr>
      <tr>
        <td style="padding: 10px; text-align: left; border: 1px solid #ddd;">Entire Application</td>
        <td style="padding: 10px; border: 1px solid #ddd;"><strong>£ ${formatNumber(visaCostDetails.legalFees, 2)}</strong></td>
      </tr>
          <tr>
            <td colspan="2" style="padding: 10px; text-align: center; border: 1px solid #ddd; font-weight: bold;">Business Expansion Fees</td>
          </tr>
          <tr>
  <td style="padding: 10px; text-align: left; border: 1px solid #ddd;">Sponsor License Application Fees</td>
  <td style="padding: 10px; border: 1px solid #ddd;"><strong>£ ${formatNumber(visaCostDetails.sponsorLicenseApplicantFee, 2)}</strong></td>
</tr>
          ${isExpedited ? `<tr>
          <td style="padding: 10px; text-align: left; border: 1px solid #ddd;">Expedited Sponsor License Fees</td>
          <td style="padding: 10px; border: 1px solid #ddd;"><strong>£ ${formatNumber(visaCostDetails.expediteSponsorFee, 2)}</strong></td>
        </tr>` : ''}
        ${visaCostDetails.companyLicenseFee !== undefined && visaCostDetails.companyLicenseFee !== 'string' && parseFloat(visaCostDetails.companyLicenseFee) > 0 ? `<tr>
          <td style="padding: 10px; text-align: left; border: 1px solid #ddd;">Company Incorporation Fees</td>
          <td style="padding: 10px; border: 1px solid #ddd;"><strong>£ ${formatNumber(parseFloat(visaCostDetails.companyLicenseFee), 2)}</strong></td>
        </tr>` : ''}
        ${visaCostDetails.registeredAdviceFees !== undefined && visaCostDetails.registeredAdviceFees !== 'string' && parseFloat(visaCostDetails.registeredAdviceFees) > 0 ? `<tr>
          <td style="padding: 10px; text-align: left; border: 1px solid #ddd;">Registered Business Address Fees</td>
          <td style="padding: 10px; border: 1px solid #ddd;"><strong>£ ${formatNumber(parseFloat(visaCostDetails.registeredAdviceFees), 2)}</strong></td>
        </tr>` : ''}
        ${visaCostDetails.accountsFee !== undefined && visaCostDetails.accountsFee !== 'string' && parseFloat(visaCostDetails.accountsFee) > 0 ? `<tr>
          <td style="padding: 10px; text-align: left; border: 1px solid #ddd;">Accountancy Fees</td>
          <td style="padding: 10px; border: 1px solid #ddd;"><strong>£ ${formatNumber(parseFloat(visaCostDetails.accountsFee), 2)}</strong></td>
        </tr>` : ''}
        <tr>
  <td colspan="2" style="padding: 10px; text-align: center; border: 1px solid #ddd; font-weight: bold;">Main Applicant Government Fees</td>
</tr>
<tr>
  <td style="padding: 10px; text-align: left; border: 1px solid #ddd;">Application Fees</td>
  <td style="padding: 10px; border: 1px solid #ddd;"><strong>£ ${formatNumber(visaCostDetails.applicationFee, 2)}</strong></td>
</tr>
<tr>
  <td style="padding: 10px; text-align: left; border: 1px solid #ddd;">Immigration Healthcare Surcharge</td>
  <td style="padding: 10px; border: 1px solid #ddd;"><strong>£ ${formatNumber(visaCostDetails.mainApplicantHealthcareSurcharge, 2)}</strong></td>
</tr>
<tr>
  <td colspan="2" style="padding: 10px; text-align: center; border: 1px solid #ddd; font-weight: bold;">Dependent Government Fees</td>
</tr>
${(includeSpouse === 'Yes' || numberOfChildren > 0) ? `<tr>
  <td style="padding: 10px; text-align: left; border: 1px solid #ddd;">Application Fees</td>
  <td style="padding: 10px; border: 1px solid #ddd;"><strong>£ ${formatNumber((includeSpouse === 'Yes' ? 1 : 0) * visaCostDetails.spouseApplicationFee + numberOfChildren * visaCostDetails.childApplicationFee, 2)}</strong></td>
</tr>` : ''}
${(includeSpouse === 'Yes' || numberOfChildren > 0) ? `<tr>
  <td style="padding: 10px; text-align: left; border: 1px solid #ddd;">Immigration Healthcare Surcharge</td>
  <td style="padding: 10px; border: 1px solid #ddd;"><strong>£ ${formatNumber((includeSpouse === 'Yes' ? 1 : 0) * visaCostDetails.spouseHealthcareSurcharge + numberOfChildren * visaCostDetails.childHealthcareSurcharge, 2)}</strong></td>
</tr>` : ''}
<tr>
  <td style="padding: 10px; text-align: left; border: 1px solid #ddd;"><strong>Total Fees</strong></td>
  <td style="padding: 10px; border: 1px solid #ddd;"><strong>£ ${formatNumber(totalCost, 2)}</strong></td>
</tr>
      </tbody>
    </table>
  </div>
</div>
`;

function formatNumber(value, decimalPlaces = 0) {
  return new Intl.NumberFormat('en-GB', {
    minimumFractionDigits: decimalPlaces,
    maximumFractionDigits: decimalPlaces,
  }).format(value);
}
  const paymentPlanHTML = `
<div style="page-break-before: always;"></div>
<div style="margin-top: 20px; text-align: center;">
  <h3 style="font-weight: bold; text-decoration: underline;">Payment Plan</h3>
  <table style="width: 60%; margin: auto; border-collapse: collapse; border: 1px solid #ddd;">
    <thead>
      <tr style="background-color: #4CAF50; color: black; border: 1px solid #ddd;">
        <th style="padding: 10px; border: 1px solid #ddd;"><strong>Payment Plan</strong></th>
        <th style="padding: 10px; border: 1px solid #ddd;"><strong>Details</strong></th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td style="padding: 10px; text-align: left; border: 1px solid #ddd;"><strong>Stage 1</strong></td>
        <td style="padding: 10px; text-align: left; border: 1px solid #ddd;">25% of Legal Fees Due</td>
      </tr>
      <tr>
        <td style="padding: 10px; text-align: left; border: 1px solid #ddd;"><strong>Stage 2</strong></td>
        <td style="padding: 10px; text-align: left; border: 1px solid #ddd;">
          25% of Legal Fees Due<br>
          Business Expansion Fees Due<br>
        </td>
      </tr>
      <tr>
        <td style="padding: 10px; text-align: left; border: 1px solid #ddd;"><strong>Stage 3</strong></td>
        <td style="padding: 10px; text-align: left; border: 1px solid #ddd;">
          25% of Legal Fees Due<br>
          Main Applicant Government Fees Due<br>
        </td>
      </tr>
      <tr>
        <td style="padding: 10px; text-align: left; border: 1px solid #ddd;"><strong>Stage 4</strong></td>
        <td style="padding: 10px; text-align: left; border: 1px solid #ddd;">
          25% of Legal Fees Due<br>
          Dependent Government Fees<br>
        </td>
      </tr>
    </tbody>
  </table>
  <p style="margin-top: 20px; font-size: 14px; text-align: left;">
    This quotation has been prepared by the UKR Group.<br><br>
    The content of this quotation is confidential and should not be shared with others.<br><br>
    The timeframe is an estimate based on our experience and best practice.<br><br>
    This quotation is valid for 7 days from the date of preparation.<br><br><br><br>
    <ol style="font-size: 14px; text-align: left;">
<li>£259 is the government application fees.</li>
        <li>The current Healthcare surcharge is £624 per year, but subject to increase.</li>
        <li>Maintain at least £1,270 for your support upon arrival (unless exempt), maintain the required funds for at least 28 consecutive days within 31 days of applying.</li>
        <li>Your partner and children can apply to join you as 'dependants' if eligible.</li>
        <li>Dependants' visas usually end on the same date as yours.</li>
        <li>If parents have visas with different expiry dates, the child’s visa will end on the earlier date.</li>
        <li>A dependant partner or child includes your spouse, civil partner, unmarried partner, child under 18, or child over 18 currently in the UK as your dependant.</li>
        <li>Specific amounts required: £285 for your partner, £315 for one child, £200 for each additional child.</li>
        <li>Need to provide proof of funds unless all have been in the UK with a valid visa for at least 12 months.</li>
        <li>If applying at different times, partners or children need to show enough money for support if in the UK for less than 1 year.</li>
        <li>All Home Office exchange rates are set between 4 to 5% above the Oanda live bid rates.</li>
</ol>

  </p>
</div>
`;



// Concatenate the payment plan HTML to the existing HTML
  const updatedHTMLContentWithPaymentPlan = updatedHTMLContent + paymentPlanHTML;



  
  function getMonthName(month) {
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    return monthNames[month];
  }
  
  return updatedHTMLContentWithPaymentPlan;
}
  
app.get('/', (req, res) => {
  const formHTML = `
    <style>
      body {
        font-family: Arial, sans-serif;
        background-color: #f4f4f4;
        text-align: center;
      }

      form {
        max-width: 400px;
        margin: 20px auto;
        padding: 20px;
        border: 1px solid #ccc;
        border-radius: 10px;
        background-color: #fff;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
      }

      label {
        display: block;
        margin-bottom: 8px;
        font-size: 16px;
        font-weight: bold;
      }

      input, select {
        width: 100%;
        padding: 10px;
        margin-bottom: 16px;
        box-sizing: border-box;
        font-size: 14px;
      }

      input[type="submit"] {
        background-color: #4CAF50;
        color: white;
        padding: 12px 20px;
        font-size: 16px;
        border: none;
        border-radius: 5px;
        cursor: pointer;
      }

      input[type="submit"]:hover {
        background-color: #45a049;
      }
    </style>

    <form action="/calculate" method="post">

    <img src="https://ukrgroup.com/wp-content/uploads/2021/10/UKR-Group-Logo-01-1.png" alt="UKR Logo" style="max-width: 200px; margin-top: 20px;">  
  <h2 style="color: #c50404;">UK Worker Expansion Estimate</h2>
  <style>
  label {
    display: inline-block;
    margin-right: 5px; /* Adjust the margin as needed */
  }

  input[type="radio"] {
    display: inline-block;
    margin-right: 5px; /* Adjust the margin as needed */
  }
</style>

<!-- Your existing HTML code -->
<label for="includeSpouse">Include Spouse:</label>
<input type="radio" name="includeSpouse" value="Yes" required> Yes
<input type="radio" name="includeSpouse" value="No" required> No<br style="margin-bottom: 16px;">

  <label for="numberOfChildren">Number of Children:</label>
  <input type="number" name="numberOfChildren" value="0" required><br>

  <label for="legalFees">Legal Fee (£):</label>
  <input type="number" name="legalFees" required><br>

  <!-- Add the new fields for company license fee, registered advice fees, and accounts fee -->
  <label for="companyLicenseFee">Company License Fee (£):</label>
  <input type="number" name="companyLicenseFee" value="0"><br>

  <label for="registeredAdviceFees">Registered Advice Fees (£):</label>
  <input type="number" name="registeredAdviceFees" value="0"><br>

  <label for="accountsFee">Accounts Fee (£):</label>
  <input type="number" name="accountsFee" value="0"><br>

  <!-- Add the email input field -->
  <label for="email">Email:</label>
  <input type="email" name="email" required><br>

  

  <label for="expediteSponsorFee">Expedite Sponsor Fee:</label>
  <input type="checkbox" name="expediteSponsorFee" value="Yes"> Yes<br>

  <input type="submit" value="Calculate">
</form>

  `;

  res.send(formHTML);
});
app.post('/calculate', async (req, res) => {
  try {
    const { includeSpouse, numberOfChildren, expediteSponsorFee, legalFees, companyLicenseFee, registeredAdviceFees, accountsFee, email } = req.body;

    // Convert the checkbox value to a boolean
    const isExpedited = expediteSponsorFee === 'Yes';

    // Parse legalFees, companyLicenseFee, registeredAdviceFees, and accountsFee as floats (assuming they're in pounds)
    const parsedLegalFees = parseFloat(legalFees) || 0;
    const parsedCompanyLicenseFee = parseFloat(companyLicenseFee) || 0;
    const parsedRegisteredAdviceFees = parseFloat(registeredAdviceFees) || 0;
    const parsedAccountsFee = parseFloat(accountsFee) || 0;

    console.log('Input values:', {
      includeSpouse,
      numberOfChildren,
      expediteSponsorFee,
      legalFees,
      parsedLegalFees,
      companyLicenseFee,
      registeredAdviceFees,
      accountsFee,
      parsedCompanyLicenseFee,
      parsedRegisteredAdviceFees,
      parsedAccountsFee,
      email,
    });

    if (isNaN(parsedLegalFees)) {
      return res.status(400).send('Legal Fees must be a valid number');
    }

    const htmlContent = generateVisaHTML(
      includeSpouse,
      parseInt(numberOfChildren, 10),
      isExpedited,
      parsedLegalFees,
      isExpedited,
      parsedCompanyLicenseFee,
      parsedRegisteredAdviceFees,
      parsedAccountsFee, 
    );
    const pdfBuffer = await generatePDF(htmlContent);

    // Send the email to the specified address
    await sendEmailWithPDF(pdfBuffer, 'UK Family Visa Estimate', email);

    res.send('Calculation successful! Check your email for the Visa Estimate.');
  } catch (error) {
    console.error('Error: ', error);
    res.status(500).send('An error occurred during calculation and email sending.');
  }
});

const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});


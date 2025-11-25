const express = require("express");
const axios = require("axios");
const bodyParser = require("body-parser");
const cors = require("cors");
const xml2js = require("xml2js");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// -------- LOGIN ENDPOINT --------

app.post("/login", async (req, res) => {
    console.log("Received Login Request:", req.body);

    const { customer_id, password } = req.body;

    const sapUrl = "http://172.17.19.24:8000/sap/bc/srt/scs/sap/zrd_login_valid_rfc_proj1?sap-client=100";

    const soapXML = `
    <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" 
                      xmlns:urn="urn:sap-com:document:sap:rfc:functions">
        <soapenv:Header/>
        <soapenv:Body>
            <urn:ZFM_LOGIN_PROJ1>
                <CUSTOMER_ID>${customer_id}</CUSTOMER_ID>
                <PASSWORD>${password}</PASSWORD>
            </urn:ZFM_LOGIN_PROJ1>
        </soapenv:Body>
    </soapenv:Envelope>`;

    try {
        const response = await axios.post(sapUrl, soapXML, {
            auth: { username: "K901765", password: "Hobbitbattle123" },
            headers: {
                "Content-Type": "text/xml",
                "SOAPAction": "urn:sap-com:document:sap:rfc:functions:ZFM_LOGIN_PROJ1",
            },
            timeout: 20000,
        });

        const match = response.data.match(/<STATUS>(.*?)<\/STATUS>/);
        const status = match ? match[1] : "UNKNOWN";

        return res.json({ status, customer_id });

    } catch (err) {
        console.log("SAP CALL FAILED:", err.message);
        return res.json({
            status: "ERROR",
            message: err.message,
            sap_response: err.response ? err.response.data : null
        });
    }
});

// -------- PROFILE ENDPOINT --------

app.post("/profile", async (req, res) => {
    const { customer_id } = req.body;

    if (!customer_id) {
        return res.status(400).json({ error: "Customer ID missing" });
    }

    const sapUrl = "http://172.17.19.24:8000/sap/bc/srt/scs/sap/zrd_profile_rfc_proj1?sap-client=100";

    const soapXML = `<?xml version="1.0" encoding="UTF-8"?>
    <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
                      xmlns:tns="urn:sap-com:document:sap:rfc:functions">
        <soapenv:Header/>
        <soapenv:Body>
            <tns:ZRD_PROFILE_FM2_PROJ1>
                <CUSTOMER_ID>${customer_id}</CUSTOMER_ID>
            </tns:ZRD_PROFILE_FM2_PROJ1>
        </soapenv:Body>
    </soapenv:Envelope>`;

    try {
        const response = await axios.post(sapUrl, soapXML, {
            auth: { username: "K901765", password: "Hobbitbattle123" },
            headers: {
                "Content-Type": "text/xml",
                SOAPAction: "urn:sap-com:document:sap:rfc:functions:ZRD_PROFILE_FM2_PROJ1"
            },
            timeout: 20000,
        });

        xml2js.parseString(response.data, { explicitArray: false }, (err, result) => {
            if (err) return res.status(500).json({ error: "Failed to parse SAP response" });

            try {
                const profile =
                    result["soap-env:Envelope"]["soap-env:Body"]["n0:ZRD_PROFILE_FM2_PROJ1Response"]["ES_PROFILE"];

                res.json(profile);

            } catch (e) {
                res.status(500).json({ error: "Invalid SAP response structure" });
            }
        });

    } catch (err) {
        console.log("SAP PROFILE CALL FAILED:", err.message);
        res.status(500).json({ error: "Failed to fetch profile from SAP" });
    }
});

// -------- INQUIRY ENDPOINT --------
app.post("/inquiry", async (req, res) => {
    const { customer_id } = req.body;

    if (!customer_id) {
        return res.status(400).json({ error: "Customer ID missing" });
    }

    const sapUrl = "http://172.17.19.24:8000/sap/bc/srt/scs/sap/zrd_get_inquiry_rfc_proj1?sap-client=100";

    const soapXML = `<?xml version="1.0" encoding="UTF-8"?>
    <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
                      xmlns:tns="urn:sap-com:document:sap:rfc:functions">
        <soapenv:Header/>
        <soapenv:Body>
            <tns:ZRD_GET_INQUIRY_FM3_PROJ1>
                <CUSTOMER_ID>${customer_id}</CUSTOMER_ID>
            </tns:ZRD_GET_INQUIRY_FM3_PROJ1>
        </soapenv:Body>
    </soapenv:Envelope>`;

    try {
        const response = await axios.post(sapUrl, soapXML, {
            auth: { username: "K901765", password: "Hobbitbattle123" },
            headers: {
                "Content-Type": "text/xml",
                SOAPAction: "urn:sap-com:document:sap:rfc:functions:ZRD_GET_INQUIRY_FM3_PROJ1"
            },
            timeout: 20000
        });

        // Parse XML
        xml2js.parseString(response.data, { explicitArray: false }, (err, result) => {
            if (err) return res.status(500).json({ error: "Failed to parse SAP response" });

            try {
                let inquiries = result["soap-env:Envelope"]["soap-env:Body"]["n0:ZRD_GET_INQUIRY_FM3_PROJ1Response"]["ET_INQUIRY"]["item"];
                
                // If only 1 item, wrap in array
                if (!Array.isArray(inquiries)) inquiries = [inquiries];

                res.json(inquiries);
            } catch (e) {
                res.status(500).json({ error: "Invalid SAP response structure" });
            }
        });

    } catch (err) {
        console.log("SAP INQUIRY CALL FAILED:", err.message);
        res.status(500).json({ error: "Failed to fetch inquiry from SAP" });
    }
});

// -------- SALES ENDPOINT --------
app.post("/sales", async (req, res) => {
    console.log("Sales request body:", req.body); // debug
    const { customer_id } = req.body;

    if (!customer_id) {
        return res.status(400).json({ error: "Customer ID missing" });
    }

    const sapUrl = "http://172.17.19.24:8000/sap/bc/srt/scs/sap/zrd_get_sales_order_rfc_proj1?sap-client=100";

    const soapXML = `<?xml version="1.0" encoding="UTF-8"?>
    <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
                      xmlns:tns="urn:sap-com:document:sap:rfc:functions">
        <soapenv:Header/>
        <soapenv:Body>
            <tns:ZRD_GET_SALES_ORDER_FM4_PROJ1>
                <CUSTOMER_ID>${customer_id}</CUSTOMER_ID>
            </tns:ZRD_GET_SALES_ORDER_FM4_PROJ1>
        </soapenv:Body>
    </soapenv:Envelope>`;

    try {
        const response = await axios.post(sapUrl, soapXML, {
            auth: { username: "K901765", password: "Hobbitbattle123" },
            headers: {
                "Content-Type": "text/xml",
                SOAPAction: "urn:sap-com:document:sap:rfc:functions:ZRD_GET_SALES_ORDER_FM4_PROJ1"
            },
            timeout: 20000
        });

        // Parse XML
        xml2js.parseString(response.data, { explicitArray: false }, (err, result) => {
            if (err) return res.status(500).json({ error: "Failed to parse SAP response" });

            try {
                let sales = result["soap-env:Envelope"]["soap-env:Body"]["n0:ZRD_GET_SALES_ORDER_FM4_PROJ1Response"]["ET_SALESORDER"]["item"];
                
                // Wrap single item in array
                if (!Array.isArray(sales)) sales = [sales];

                res.json(sales);
            } catch (e) {
                res.status(500).json({ error: "Invalid SAP response structure" });
            }
        });

    } catch (err) {
        console.log("SAP SALES CALL FAILED:", err.message);
        res.status(500).json({ error: "Failed to fetch sales data" });
    }
});

// -------- DELIVERY ENDPOINT --------
app.post('/delivery', async (req, res) => {
  const { customer_id } = req.body; // Use lowercase to match your frontend POST

  if (!customer_id) {
    return res.status(400).json({ error: "Customer ID missing" });
  }

  const sapUrl = "http://172.17.19.24:8000/sap/bc/srt/scs/sap/zrd_get_delivery_rfc_proj1?sap-client=100";

  const soapXML = `<?xml version="1.0" encoding="UTF-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
                  xmlns:tns="urn:sap-com:document:sap:rfc:functions">
  <soapenv:Header/>
  <soapenv:Body>
    <tns:ZRD_GET_DELIVERY_FM5_PROJ1>
      <CUSTOMER_ID>${customer_id}</CUSTOMER_ID>
    </tns:ZRD_GET_DELIVERY_FM5_PROJ1>
  </soapenv:Body>
</soapenv:Envelope>`;

  try {
    const response = await axios.post(sapUrl, soapXML, {
      auth: { username: "K901765", password: "Hobbitbattle123" },
      headers: {
        "Content-Type": "text/xml",
        SOAPAction: "urn:sap-com:document:sap:rfc:functions:ZRD_GET_DELIVERY_FM5_PROJ1"
      },
      responseType: 'text',
      timeout: 20000
    });

    xml2js.parseString(response.data, { explicitArray: false }, (err, result) => {
      if (err) return res.status(500).json({ error: "Failed to parse SAP response" });

      try {
        let deliveries = result["soap-env:Envelope"]["soap-env:Body"]["n0:ZRD_GET_DELIVERY_FM5_PROJ1Response"]["ET_DELIVERY"]["item"];
        if (!Array.isArray(deliveries)) deliveries = [deliveries]; // wrap single item in array
        res.json(deliveries);
      } catch (e) {
        res.status(500).json({ error: "Invalid SAP response structure" });
      }
    });

  } catch (error) {
    console.error("SAP DELIVERY CALL FAILED:", error.message);
    res.status(500).json({ error: "Failed to fetch delivery data from SAP", details: error.message });
  }
});


// -------- PAYMENT ENDPOINT --------
app.post('/payment', async (req, res) => {
  const { customer_id } = req.body;
  if (!customer_id) return res.status(400).json({ error: "customer_id required" });

  const xmlRequest = `<?xml version="1.0" encoding="UTF-8"?>
  <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
                    xmlns:tns="urn:sap-com:document:sap:rfc:functions">
    <soapenv:Header/>
    <soapenv:Body>
      <tns:ZRD_GET_PAYMENTAGING_FM7_PROJ1>
        <CUSTOMER_ID>${customer_id}</CUSTOMER_ID>
      </tns:ZRD_GET_PAYMENTAGING_FM7_PROJ1>
    </soapenv:Body>
  </soapenv:Envelope>`;

  try {
    const response = await axios.post(
      "http://172.17.19.24:8000/sap/bc/srt/scs/sap/zrd_get_paymentaging_rfc_proj1?sap-client=100",
      xmlRequest,
      {
        auth: { username: "K901765", password: "Hobbitbattle123" },
        headers: { 'Content-Type': 'text/xml', 'SOAPAction': '' },
        responseType: 'text',
        timeout: 20000
      }
    );

    xml2js.parseString(response.data, { explicitArray: false }, (err, result) => {
      if (err) return res.status(500).json({ error: "Failed to parse SAP response" });

      try {
        const body = result?.['soap-env:Envelope']?.['soap-env:Body']?.['n0:ZRD_GET_PAYMENTAGING_FM7_PROJ1Response'];
        if (!body || !body['ET_PAYMENTS_AGING']) {
          return res.status(500).json({ error: "Invalid SAP response structure" });
        }

        let items = body['ET_PAYMENTS_AGING']['item'] || [];
        if (!Array.isArray(items)) items = [items]; // wrap single item in array
        res.json(items);

      } catch (e) {
        console.error("Error extracting payments:", e);
        res.status(500).json({ error: "Failed to extract payments from SAP response" });
      }
    });

  } catch (err) {
    console.error('SAP payment error:', err.message);
    res.status(500).json({ error: 'Failed to fetch payment details', details: err.message });
  }
});



// -------- OVERALL SALES ENDPOINT --------
app.post('/overall-sales', async (req, res) => {
  const { customer_id } = req.body;
  if (!customer_id) return res.status(400).json({ error: "customer_id required" });

  const xmlRequest = `<?xml version="1.0" encoding="UTF-8"?>
  <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
                    xmlns:tns="urn:sap-com:document:sap:rfc:functions">
    <soapenv:Header/>
    <soapenv:Body>
      <tns:ZRD_GET_SALESSUMMARY_FM9_PROJ1>
        <CUSTOMER_ID>${customer_id}</CUSTOMER_ID>
      </tns:ZRD_GET_SALESSUMMARY_FM9_PROJ1>
    </soapenv:Body>
  </soapenv:Envelope>`;

  try {
    const response = await axios.post(
      "http://172.17.19.24:8000/sap/bc/srt/scs/sap/zrd_get_salessummary_rfc_proj1?sap-client=100",
      xmlRequest,
      {
        auth: { username: "K901765", password: "Hobbitbattle123" },
        headers: { 'Content-Type': 'text/xml', 'SOAPAction': '' },
        responseType: 'text',
        timeout: 20000
      }
    );

    xml2js.parseString(response.data, { explicitArray: false }, (err, result) => {
      if (err) return res.status(500).json({ error: "Failed to parse SAP response" });

      try {
        const body = result?.['soap-env:Envelope']?.['soap-env:Body']?.['n0:ZRD_GET_SALESSUMMARY_FM9_PROJ1Response'];
        if (!body || !body['ET_SALES_SUMMARY']) {
          return res.status(500).json({ error: "Invalid SAP response structure" });
        }

        let items = body['ET_SALES_SUMMARY']['item'] || [];
        if (!Array.isArray(items)) items = [items]; // wrap single item in array

        res.json(items);

      } catch (e) {
        console.error("Error extracting sales summary:", e);
        res.status(500).json({ error: "Failed to extract sales summary from SAP response" });
      }
    });

  } catch (err) {
    console.error('SAP overall-sales error:', err.message);
    res.status(500).json({ error: 'Failed to fetch overall sales', details: err.message });
  }
});


// -------- CREDIT-DEBIT ENDPOINT --------
app.post('/credit-debit', async (req, res) => {
  const { customer_id } = req.body;
  if (!customer_id) return res.status(400).json({ error: "customer_id required" });

  const xmlRequest = `<?xml version="1.0" encoding="UTF-8"?>
  <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
                    xmlns:tns="urn:sap-com:document:sap:rfc:functions">
    <soapenv:Header/>
    <soapenv:Body>
      <tns:ZRD_GET_MEMO_FM8_PROJ1>
        <CUSTOMER_ID>${customer_id}</CUSTOMER_ID>
      </tns:ZRD_GET_MEMO_FM8_PROJ1>
    </soapenv:Body>
  </soapenv:Envelope>`;

  try {
    const response = await axios.post(
      "http://172.17.19.24:8000/sap/bc/srt/scs/sap/zrd_get_memo_rfc_proj1?sap-client=100",
      xmlRequest,
      {
        auth: { username: "K901765", password: "Hobbitbattle123" },
        headers: { 'Content-Type': 'text/xml', 'SOAPAction': '' },
        responseType: 'text',
        timeout: 20000
      }
    );

    const xml2js = require('xml2js');
    xml2js.parseString(response.data, { explicitArray: false }, (err, result) => {
      if (err) return res.status(500).json({ error: "Failed to parse SAP response" });

      try {
        const body = result?.['soap-env:Envelope']?.['soap-env:Body']?.['n0:ZRD_GET_MEMO_FM8_PROJ1Response'];
        if (!body || !body['ET_MEMOS']) {
          return res.status(500).json({ error: "Invalid SAP response structure" });
        }

        let items = body['ET_MEMOS']['item'] || [];
        if (!Array.isArray(items)) items = [items]; // wrap single item in array

        res.json(items);

      } catch (e) {
        console.error("Error extracting credit-debit data:", e);
        res.status(500).json({ error: "Failed to extract credit-debit from SAP response" });
      }
    });

  } catch (err) {
    console.error('SAP credit-debit error:', err.message);
    res.status(500).json({ error: 'Failed to fetch credit-debit', details: err.message });
  }
});



// -------- INVOICE LIST ENDPOINT --------
app.post('/invoice', async (req, res) => {
  const { customer_id } = req.body;
  if (!customer_id) return res.status(400).json({ error: "customer_id required" });

  const xmlRequest = `<?xml version="1.0" encoding="UTF-8"?>
  <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
                    xmlns:tns="urn:sap-com:document:sap:rfc:functions">
    <soapenv:Header/>
    <soapenv:Body>
      <tns:ZRD_GET_INVOICE_FM6_PROJ1>
        <I_CUSTOMER>${customer_id}</I_CUSTOMER>
      </tns:ZRD_GET_INVOICE_FM6_PROJ1>
    </soapenv:Body>
  </soapenv:Envelope>`;

  try {
    const response = await axios.post(
      "http://172.17.19.24:8000/sap/bc/srt/scs/sap/zrd_get_invoice_rfc_proj1?sap-client=100",
      xmlRequest,
      {
        auth: { username: "K901765", password: "Hobbitbattle123" },
        headers: { 'Content-Type': 'text/xml', 'SOAPAction': '' },
        responseType: 'text'
      }
    );

    xml2js.parseString(response.data, { explicitArray: false }, (err, result) => {
      if (err) return res.status(500).json({ error: "XML Parse Failed" });

      const body =
        result?.['soap-env:Envelope']?.['soap-env:Body']?.['n0:ZRD_GET_INVOICE_FM6_PROJ1Response'];

      if (!body || !body['E_INVOICES'])
        return res.status(500).json({ error: "Invalid SAP Response" });

      let items = body['E_INVOICES']['item'] || [];
      if (!Array.isArray(items)) items = [items];

      res.json(items);
    });

  } catch (err) {
    console.error("INVOICE LIST error:", err.message);
    res.status(500).json({ error: "Failed to fetch invoices", details: err.message });
  }
});


// -------- INVOICE FORM (PDF) ENDPOINT --------
app.post('/invoice-form', async (req, res) => {
  const { vbeln } = req.body;
  if (!vbeln) return res.status(400).json({ error: "VBELN required" });

  console.log("VBELN received:", vbeln);

  const xmlRequest = `<?xml version="1.0" encoding="UTF-8"?>
  <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
                    xmlns:tns="urn:sap-com:document:sap:rfc:functions">
    <soapenv:Header/>
    <soapenv:Body>
      <tns:ZRD_GET_INVOICE_FORM_FM6_PROJ1>
        <P_VBELN>${vbeln}</P_VBELN>
      </tns:ZRD_GET_INVOICE_FORM_FM6_PROJ1>
    </soapenv:Body>
  </soapenv:Envelope>`;

  try {
    const response = await axios.post(
      "http://172.17.19.24:8000/sap/bc/srt/scs/sap/zrd_get_invoice_form_rfc_proj1?sap-client=100",
      xmlRequest,
      {
        auth: { username: "K901765", password: "Hobbitbattle123" },
        headers: { "Content-Type": "text/xml", SOAPAction: "" },
        responseType: "text",
        timeout: 20000
      }
    );

    xml2js.parseString(response.data, { explicitArray: false }, (err, result) => {
      if (err) {
        console.error("XML Parse Error:", err);
        return res.status(500).json({ error: "XML Parse Failed" });
      }

      console.log("SAP RAW response:", response.data);

      const body = result?.["soap-env:Envelope"]?.["soap-env:Body"]?.["n0:ZRD_GET_INVOICE_FORM_FM6_PROJ1Response"];

      if (!body || !body["X_PDF"]) {
        console.error("X_PDF not found in response");
        return res.status(500).json({ error: "X_PDF not found in SAP Response" });
      }

      const base64PDF = body["X_PDF"];
      const pdfBuffer = Buffer.from(base64PDF, "base64");

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename=${vbeln}.pdf`);
      res.send(pdfBuffer);
    });

  } catch (err) {
    console.error("SAP ERROR RAW:", err.response?.data || err.message);
    res.status(500).json({ error: "Failed to fetch invoice PDF", details: err.message });
  }
});





// -------- SERVER START --------

app.listen(3000, () => {
    console.log("Backend running at http://localhost:3000");
});

# Demo to MC team

## Tenderbot

Tender bot is a AI automated tender responding bot. It will provided the technical solution proposal and project candidates based on the tender brief of work.
  <!-- @import "./tender/demo.md" -->
  @import "./tender/demo-v2.md"

## HR Interview Automation
Interview bot is an Interview question form generator. It will generate a Google Form with your finalized interview questions and provided required testing. An auotmated assessment report will be generated to the HR manager for any completed interview questons submission. 
  <!-- @import "./interview/procedure.md" -->
  @import "./interview/procedure-v2.md"

## 3. Auto Load Test
1. Package the code with [Repomix](https://github.com/yamadashy/repomix) 
1. Use Claude.ai or VScode to develop the api testing document with the packaged code
1. Use Claude.ai or VScode to develop the test app. (Example: [AI model testers](https://localhost:3000)) with the api testing doc
3. Create monitoring and upload the code to [GCP Sythetics Monitoring](https://console.cloud.google.com/monitoring/synthetic-monitoring?referrer=search&inv=1&invt=AbirKw&project=plated-analyzer-226005o) for loading testing (USD1.2/1000 executions) 
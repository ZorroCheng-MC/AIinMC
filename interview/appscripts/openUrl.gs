// === openUrl.gs ===
// function openGeneratedUrl(url) {
//   var html = HtmlService.createHtmlOutput(
//     `<script>
//       window.open("${url}", "_blank");
//       google.script.host.close();
//     </script>`
//   )
//   .setWidth(100)
//   .setHeight(50);
    
//   SpreadsheetApp.getUi().showModalDialog(html, 'Opening form...');
// }
function openLink() {
  // Replace with your desired URL
  var url = "https://www.google.com";
  
  // Create and open the URL viewer
  var html = HtmlService.createHtmlOutput(`
    <html>
      <body>
        <p>Opening URL...</p>
        <script>
          window.open('${url}');
          setTimeout(function() {
            google.script.host.close();
          }, 1000);
        </script>
      </body>
    </html>
  `);
  
  SpreadsheetApp.getActiveSpreadsheet().show(html);
}
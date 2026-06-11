// md-to-pdf with Chinese font support
module.paths.unshift('C:/Users/HUAWEI/.workbuddy/binaries/node/workspace/node_modules');
const { mdToPdf } = require('md-to-pdf');
const path = require('path');

const mdFilePath = 'C:/Users/HUAWEI/WorkBuddy/2026-06-11-13-29-33/NIHO_PRD.md';
const pdfOutputPath = 'C:/Users/HUAWEI/WorkBuddy/2026-06-11-13-29-33/NIHO_PRD.pdf';

const cssPath = 'C:/Users/HUAWEI/WorkBuddy/2026-06-11-13-29-33/pdf-style.css';

(async () => {
  console.log('Converting MD to PDF...');
  console.log('Source:', mdFilePath);

  const pdf = await mdToPdf(
    { path: mdFilePath },
    {
      launch_options: {
        executablePath: 'C:/Users/HUAWEI/.cache/puppeteer/chrome/win64-149.0.7827.22/chrome-win64/chrome.exe',
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
      },
      pdf_options: {
        format: 'A4',
        margin: { top: '25mm', right: '20mm', bottom: '25mm', left: '20mm' },
        printBackground: true,
        displayHeaderFooter: false,
      },
      stylesheet: [cssPath],
    }
  );

  if (pdf && pdf.content) {
    require('fs').writeFileSync(pdfOutputPath, pdf.content);
    console.log('PDF generated successfully!');
    console.log('Output:', pdfOutputPath);
  }
  process.exit(0);
})();

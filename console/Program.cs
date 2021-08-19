using System.IO;
using DocumentFormat.OpenXml;
using DocumentFormat.OpenXml.Packaging;
using DocumentFormat.OpenXml.Wordprocessing;
using HtmlToOpenXml;

namespace DotnetHtmlToDocx
{
    class Program
    {
        static void Main(string[] args)
        {
            const string filename = "test.docx";
            string html = @"
                <!DOCTYPE HTML PUBLIC
                <html>
                    <head>
                        <title></title>
                    </head>
                    <body>
                        Looks how cool is <font size='x-large'><b>Open Xml</b></font>.
                        Now with <font color='red'><u>HtmlToOpenXml</u></font>, it nevers been so easy to convert html.
                        <p>
                            If you like it, add me a rating on <a href='https://github.com/onizet/html2openxml'>github</a>
                        </p>
                        <hr>
                    </body>
                </html>
            ";

            if (File.Exists(filename)) File.Delete(filename);

            using (MemoryStream generatedDocument = new MemoryStream())
            {
                using (WordprocessingDocument package = WordprocessingDocument.Create(generatedDocument, WordprocessingDocumentType.Document))
                {
                    MainDocumentPart mainPart = package.MainDocumentPart;
                    if (mainPart == null)
                    {
                        mainPart = package.AddMainDocumentPart();
                        new Document(new Body()).Save(mainPart);
                    }

                    HtmlConverter converter = new HtmlConverter(mainPart);
                    converter.ParseHtml(html);

                    mainPart.Document.Save();
                }

                File.WriteAllBytes(filename, generatedDocument.ToArray());
            }
        }


    }
}
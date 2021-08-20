using ApiHtmlToDocx.Helpers;
using ApiHtmlToDocx.Models;
using DocumentFormat.OpenXml;
using DocumentFormat.OpenXml.Packaging;
using DocumentFormat.OpenXml.Validation;
using DocumentFormat.OpenXml.Wordprocessing;
using HtmlToOpenXml;
using Microsoft.AspNetCore.Mvc;
using System;
using System.IO;

namespace ApiHtmlToDocx.Controllers
{
	[ApiController]
	[Route("[controller]")]
	public class GeradorController : ControllerBase
	{
		[HttpPost]
		public string Post([FromBody] ParametrosDocx parametros)
		{
			var filename = parametros?.Filename ?? "geradoBackend.docx";
			string html = parametros?.Html ?? "<h1>Paramâmetro Não Existe</h1>";

			//Ajusta o css vindo do html
			var result = PreMailer.Net.PreMailer.MoveCssInline(html);


			if (System.IO.File.Exists(filename)) System.IO.File.Delete(filename);

			using (MemoryStream generatedDocument = new())
			{
				using (WordprocessingDocument package = WordprocessingDocument.Create(generatedDocument, WordprocessingDocumentType.Document))
				{
					MainDocumentPart mainPart = package.MainDocumentPart;
					if (mainPart == null)
					{
						mainPart = package.AddMainDocumentPart();
						new Document(new Body()).Save(mainPart);
					}

					HtmlConverter converter = new(mainPart);
					converter.ParseHtml(result.Html);
					converter.RefreshStyles();

					mainPart.Document.Save();
				}

				System.IO.File.WriteAllBytes(filename, generatedDocument.ToArray());
			}

			return result.Html;
		}


		[HttpPost("template")]
		public string PostWithTemplate([FromBody] ParametrosDocx parametros)
		{
			var filename = parametros?.Filename ?? "geradoBackendTemplate.docx";
			string html = parametros?.Html ?? "<h1>Paramâmetro Não Existe</h1>";

			//Ajusta o css vindo do html
			var result = PreMailer.Net.PreMailer.MoveCssInline(html);

			if (System.IO.File.Exists(filename)) System.IO.File.Delete(filename);

			using (MemoryStream generatedDocument = new ())
			{
				using (var buffer = ResourceHelper.GetStream("Resources.template.docx"))
				{
					buffer.CopyTo(generatedDocument);
				}

				generatedDocument.Position = 0L;
				using (WordprocessingDocument package = WordprocessingDocument.Open(generatedDocument, true))
				{
					MainDocumentPart mainPart = package.MainDocumentPart;
					if (mainPart == null)
					{
						mainPart = package.AddMainDocumentPart();
						new Document(new Body()).Save(mainPart);
					}

					HtmlConverter converter = new HtmlConverter(mainPart);
					converter.ParseHtml(result.Html);
					converter.RefreshStyles();

					Body body = mainPart.Document.Body;

					mainPart.Document.Save();

					AssertThatOpenXmlDocumentIsValid(package);
				}


				System.IO.File.WriteAllBytes(filename, generatedDocument.ToArray());
			}

			return result.Html;
		}

		private void AssertThatOpenXmlDocumentIsValid(WordprocessingDocument wpDoc)
		{
			var validator = new OpenXmlValidator(FileFormatVersions.Office2007);
			var errors = validator.Validate(wpDoc);

			if (!errors.GetEnumerator().MoveNext())
				return;

			Console.ForegroundColor = ConsoleColor.Red;
			Console.WriteLine("The document doesn't look 100% compatible with Office 2007.\n");

			Console.ForegroundColor = ConsoleColor.Gray;
			foreach (ValidationErrorInfo error in errors)
			{
				Console.Write("{0}\n\t{1}", error.Path.XPath, error.Description);
				Console.WriteLine();
			}

			Console.ReadLine();
		}
	}
}

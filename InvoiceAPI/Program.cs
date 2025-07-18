using QuestPDF.Fluent;
using InvoiceAPI;

var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

var invoice = (new Invoice()).GeneratePdf();

app.MapGet("/invoices", () => Results.File(invoice, "application/pdf", "invoice.pdf"));

app.Run();

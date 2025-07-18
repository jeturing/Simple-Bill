using QuestPDF.Drawing;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace InvoiceAPI
{
    class Invoice : IDocument
    {
        public DocumentMetadata GetMetadata() => DocumentMetadata.Default;

        public void Compose(IDocumentContainer container)
        {
            container.Page(page =>
            {
                page.Size(PageSizes.A7);
                page.Margin(0.2f, Unit.Centimetre);
                page.DefaultTextStyle(x => x.FontSize(8));

                page.Header().Element(ComposeHeader);
                page.Content().Element(ComposeContent);

            });
        }

        void ComposeHeader(IContainer container)
        {
            container.Column(column =>
            {
                column.Item().Text(text =>
                {
                    text.Line("CLOUD 9").SemiBold();
                    text.Line("RNC F00000031").SemiBold();
                    text.Line("Tel. 809-214-4659").SemiBold();
                    text.AlignCenter();
                });
            });
        }

        void ComposeContent(IContainer container)
        {
            container.Column(column =>
            {
                column.Item().Text(text =>
                    {
                        text.EmptyLine();

                        text.Span("Factura No: ").SemiBold();
                        text.Span("F00000031");

                        text.EmptyLine();

                        text.Span("Fecha: ").SemiBold();
                        text.Span("16/02/2023");

                        text.EmptyLine();

                        text.Span("Vencimiento: ").SemiBold();
                        text.Span("16/02/2023");

                        text.EmptyLine();

                        text.Span("Cliente: ").SemiBold();
                        text.Span("Genérico");

                        text.EmptyLine();

                        text.Span("Mesero: ").SemiBold();
                        text.Span("CLOUD");
                    });

                column.Item().Element(ComposeTable);
            });
        }

        void ComposeTable(IContainer container)
        {
            container.Table(table =>
            {
                table.ColumnsDefinition(columns =>
                {
                    columns.RelativeColumn();
                    columns.RelativeColumn();
                    columns.RelativeColumn();
                    columns.RelativeColumn();
                });


                table.Header(header =>
                {
                    header.Cell().Element(CellStyle).Text("Artículo");
                    header.Cell().Element(CellStyle).Text("Cantidad");
                    header.Cell().Element(CellStyle).Text("Impuesto");
                    header.Cell().Element(CellStyle).Text("Sub total");

                    static IContainer CellStyle(IContainer container)
                    {
                        return container.DefaultTextStyle(x => x.SemiBold()).PaddingVertical(5).BorderBottom(1).BorderColor(Colors.Black);
                    }
                });

                table.Cell().Element(CellStyle).Text("Budweiser");
                table.Cell().Element(CellStyle).Text("1.00");
                table.Cell().Element(CellStyle).Text("Itbi");
                table.Cell().Element(CellStyle).Text("300.00");

                table.Cell().Element(CellStyle).Text("Cerveza República");
                table.Cell().Element(CellStyle).Text("2.00");
                table.Cell().Element(CellStyle).Text("Itbi");
                table.Cell().Element(CellStyle).Text("400.00");

                table.Cell().Element(CellStyle).Text("Bohemia");
                table.Cell().Element(CellStyle).Text("5.00");
                table.Cell().Element(CellStyle).Text("Itbi");
                table.Cell().Element(CellStyle).Text("1,350.00");

                static IContainer CellStyle(IContainer container)
                {
                    return container.BorderBottom(1).BorderColor(Colors.Grey.Lighten2).PaddingVertical(5);
                }
            });
        }
    }
}
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using QuestPDF.Fluent;
using QuestPDF.Infrastructure;

var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

QuestPDF.Settings.License = LicenseType.Community;

app.MapGet("/health", () => Results.Ok(new { status = "ok" }));

app.MapPost("/render", (RenderRequest req) =>
{
    var document = Document.Create(container =>
    {
        container.Page(page =>
        {
            page.Margin(50);
            page.Header().Text("Vexel Health Platform").FontSize(20).SemiBold();
            page.Content().PaddingVertical(20).Text($"Payload Version: {req.PayloadVersion}");
        });
    });

    return Results.Bytes(document.GeneratePdf(), "application/pdf");
});

app.Run();

public record RenderRequest(string PayloadVersion, object Payload);

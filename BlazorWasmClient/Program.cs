using BlazorWasmClient;
using BlazorWasmClient.Services;
using Microsoft.AspNetCore.Components.Web;
using Microsoft.AspNetCore.Components.WebAssembly.Hosting;
using MudBlazor.Services;

var builder = WebAssemblyHostBuilder.CreateDefault(args);
builder.RootComponents.Add<App>("#app");
builder.RootComponents.Add<HeadOutlet>("head::after");

ILocalStorageService _localStorageService;
HttpClient _httpClient;

async Task StartAsync(CancellationToken cancellationToken)
{
    _localStorageService.RemoveItem("accessToken");
    _localStorageService.SetItem("userPermissions", "");
    _httpClient.DefaultRequestHeaders.Clear();
}

async Task StopAsync(CancellationToken cancellationToken)
{
    _localStorageService.RemoveItem("accessToken");
    _localStorageService.SetItem("userPermissions", "");
    _httpClient.DefaultRequestHeaders.Clear();
}

//builder.Services.AddScoped(sp => new HttpClient { BaseAddress = new Uri(builder.HostEnvironment.BaseAddress) });

builder.Services.AddCors(options =>
{
    options.AddPolicy("CorsPolicy",
      builder =>
      {
          builder
          .AllowAnyHeader()
          .AllowAnyMethod()
          .AllowCredentials()
          .WithOrigins("http://localhost:5000");
      });
});

builder.Services.AddHttpClient<IUserService, UserService>(client =>
{
    client.BaseAddress = new Uri(builder.HostEnvironment.BaseAddress);
});

builder.Services.AddHttpClient<IRoleService, RoleService>(client =>
{
    client.BaseAddress = new Uri(builder.HostEnvironment.BaseAddress);
});

builder.Services.AddHttpClient<IPermissionService, PermissionService>(client =>
{
    client.BaseAddress = new Uri(builder.HostEnvironment.BaseAddress);
});

builder.Services.AddMudServices();

builder.Services.AddScoped<ILocalStorageService, LocalStorageService>();

builder.Services.AddScoped<IGetTokenService, GetTokenService>();

await builder.Build().RunAsync();

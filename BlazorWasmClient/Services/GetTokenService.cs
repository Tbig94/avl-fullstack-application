using BlazorWasmClient.Models.ViewModels;
using Microsoft.AspNetCore.Components;
using Newtonsoft.Json.Linq;
using System.Net.Http.Json;

namespace BlazorWasmClient.Services
{
    public class GetTokenService : IGetTokenService
    {
        private readonly string loginUrl = "http://localhost:5000/login";
        private readonly HttpClient _httpClient;
        private ILocalStorageService _localStorageService;
        private NavigationManager _navigationManager;

        public GetTokenService(HttpClient httpClient, ILocalStorageService localStorageService, NavigationManager navigationManager)
        {
            this._localStorageService = localStorageService;
            this._httpClient = httpClient;
            this._navigationManager = navigationManager;
        }

        public async Task<bool> GetToken(string username, string password)
        {
           LoginVM loginVM = new LoginVM { Username = username, Password = password };
            var loginResult = await _httpClient.PostAsJsonAsync(loginUrl, loginVM);
            string resultString = await loginResult.Content.ReadAsStringAsync();
            if (resultString.Contains("Forbidden"))
            {
                return false;
            } else
            {
                _localStorageService.SetItem("accessToken", resultString);
                return true;
            }
        }
    }
}

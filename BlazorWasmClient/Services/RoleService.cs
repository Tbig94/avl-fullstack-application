using BlazorWasmClient.Models;
using BlazorWasmClient.Models.ViewModels;
using System.Net.Http.Json;

namespace BlazorWasmClient.Services
{
    public class RoleService : IRoleService
    {
        private readonly HttpClient _httpClient;
        private readonly string apiUrl = "http://localhost:5000/api";
        private ILocalStorageService _localStorageService;

        public RoleService(HttpClient httpClient, ILocalStorageService localStorageService)
        {
            _httpClient = httpClient;
            _localStorageService = localStorageService;
        }

        public async Task<List<RoleGetModel>> GetRoles(string active, string keyWord, string sortCol, string order, string page)
        {
            await HandleToken();
            var result = await _httpClient.GetFromJsonAsync<List<RoleGetModel>>(apiUrl + $"/roles/active={active}&keyWord={keyWord}");
            return result;
        }

        public async Task<RoleWriteVM> AddRole(RoleWriteVM role)
        {
            await HandleToken();
            var result = await _httpClient.PostAsJsonAsync($"{apiUrl}/roles/", role);
            return await result.Content.ReadFromJsonAsync<RoleWriteVM>();
        }

        public async Task EditRole(RoleWriteVM role, int id)
        {
            Console.WriteLine($"IN EditRole, id: {id}");
            await HandleToken();
            await _httpClient.PutAsJsonAsync($"{apiUrl}/roles/{id}", role);
        }

        public async Task DeleteRole(int roleId)
        {
            await HandleToken();
            await _httpClient.DeleteAsync($"{apiUrl}/roles/{roleId}");
        }

        private async Task HandleToken()
        {
            string accessToken = await _localStorageService.GetItem<string>("accessToken");
            _httpClient.DefaultRequestHeaders.Clear();
            _httpClient.DefaultRequestHeaders.Add("Authorization", $"Bearer {accessToken}");
        }
    }
}

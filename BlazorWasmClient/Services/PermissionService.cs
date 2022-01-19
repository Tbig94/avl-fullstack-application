using BlazorWasmClient.Models;
using BlazorWasmClient.Models.ViewModels;
using BlazorWasmClient.Services;
using System.Net.Http.Json;

namespace BlazorWasmClient.Services
{
    public class PermissionService : IPermissionService
    {
        private readonly HttpClient _httpClient;
        private readonly string apiUrl = "http://localhost:5000/api";
        private ILocalStorageService _localStorageService;

        public PermissionService(HttpClient httpClient, ILocalStorageService localStorageService)
        {
            _httpClient = httpClient;
            _localStorageService = localStorageService;
        }

        public async Task GetPermissionForUser(List<string> currentUserRoles)
        {
            RolePostModel rolePostModel = new RolePostModel();
            rolePostModel.roleList = currentUserRoles;
            var postResult = await _httpClient.PostAsJsonAsync(apiUrl + $"/permissions/get", rolePostModel);
            string resultString = await postResult.Content.ReadAsStringAsync();

            Console.WriteLine($"permission list(PermissionService): {resultString}");
            _localStorageService.SetItem("userPermissions", resultString);
        }
    }
}

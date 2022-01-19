using BlazorWasmClient.Models;
using BlazorWasmClient.Models.ViewModels;
using System.Net.Http.Json;

namespace BlazorWasmClient.Services
{
    public class UserService : IUserService
    {
        private readonly HttpClient _httpClient;
        private readonly string apiUrl = "http://localhost:5000/api";
        private ILocalStorageService _localStorageService;

        public UserService(HttpClient httpClient, ILocalStorageService localStorageService)
        {
            _httpClient = httpClient;
            _localStorageService = localStorageService;
        }

        public async Task<List<UserGetModel>> GetUsers(string active, string keyWord, string sortCol, string order, string page)
        {
            await HandleToken();
            var result = await _httpClient.GetFromJsonAsync<List<UserGetModel>>(apiUrl + $"/users/active={active}&keyWord={keyWord}");
            return result;
        }

        public async Task<UserWriteVM> AddUser(UserWriteVM user)
        {
            await HandleToken();
            var result = await _httpClient.PostAsJsonAsync($"{apiUrl}/users/", user);
            return await result.Content.ReadFromJsonAsync<UserWriteVM>();
        }

        public async Task EditUser(UserWriteVM user, int id)
        {
            Console.WriteLine($"IN EditUser, id: {id}");
            await HandleToken();
            await _httpClient.PutAsJsonAsync($"{apiUrl}/users/{id}", user);
        }

        public async Task DeleteUser(int userId)
        {
            await HandleToken();
            await _httpClient.DeleteAsync($"{apiUrl}/users/{userId}");
        }

        private async Task HandleToken()
        {
            string accessToken = await _localStorageService.GetItem<string>("accessToken");
            _httpClient.DefaultRequestHeaders.Clear();
            _httpClient.DefaultRequestHeaders.Add("Authorization", $"Bearer {accessToken}");
        }
    }
}

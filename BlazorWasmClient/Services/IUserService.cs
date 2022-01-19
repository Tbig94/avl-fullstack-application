using BlazorWasmClient.Models;
using BlazorWasmClient.Models.ViewModels;

namespace BlazorWasmClient.Services
{
    public interface IUserService
    {
        Task<List<UserGetModel>> GetUsers(string active, string keyWord, string sortCol, string order, string page);

        Task<UserWriteVM> AddUser(UserWriteVM user);

        Task EditUser(UserWriteVM user, int id);

        Task DeleteUser(int userId);
    }
}

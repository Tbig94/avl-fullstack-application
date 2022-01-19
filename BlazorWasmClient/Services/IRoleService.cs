using BlazorWasmClient.Models;
using BlazorWasmClient.Models.ViewModels;

namespace BlazorWasmClient.Services
{
    public interface IRoleService
    {
        Task<List<RoleGetModel>> GetRoles(string active, string keyWord, string sortCol, string order, string page);

        Task<RoleWriteVM> AddRole(RoleWriteVM role);

        Task EditRole(RoleWriteVM role, int id);

        Task DeleteRole(int roleId);
    }
}
